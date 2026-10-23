import { supabase } from './supabase'
import type { Database } from '../types/database'

export type Photo = Database['public']['Tables']['photos']['Row']

const BUCKET = 'photos'

/** Debe coincidir con `allowed_mime_types` y `file_size_limit` del bucket. */
export const MAX_FILE_SIZE = 20 * 1024 * 1024
export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const
export const ACCEPT_ATTRIBUTE = ACCEPTED_MIME_TYPES.join(',')

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

/**
 * Segunda barrera antes de gastar ancho de banda. El bucket también rechaza
 * tipos y tamaños, pero el error del servidor llega tarde y en inglés.
 */
export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
    return 'Formato no admitido. Usa JPEG, PNG, WebP o AVIF.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'La imagen supera los 20 MB.'
  }
  if (file.size === 0) {
    return 'El archivo está vacío.'
  }
  return null
}

export async function listPhotos(galleryId: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error !== null) {
    throw new Error(error.message)
  }

  return data
}

/**
 * URLs firmadas para pintar las imágenes.
 *
 * El bucket es privado, así que `getPublicUrl` no sirve. Storage comprueba las
 * políticas RLS antes de firmar: si una foto no debería verse, no hay URL.
 */
export async function signedUrlsFor(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) {
    return {}
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, 60 * 60)

  if (error !== null) {
    throw new Error(error.message)
  }

  const urls: Record<string, string> = {}
  for (const item of data) {
    if (item.signedUrl !== null && item.path !== null) {
      urls[item.path] = item.signedUrl
    }
  }

  return urls
}

async function readDimensions(
  file: File,
): Promise<{ width: number | null; height: number | null }> {
  try {
    const bitmap = await createImageBitmap(file)
    const dimensions = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return dimensions
  } catch {
    // Si el navegador no puede decodificarla, se guarda sin dimensiones: son
    // útiles para reservar el hueco, no imprescindibles.
    return { width: null, height: null }
  }
}

/**
 * Sube el archivo y crea su fila en `photos`.
 *
 * El orden importa: si el INSERT falla, se borra el objeto recién subido. Al
 * revés quedaría un archivo huérfano pagando almacenamiento para siempre.
 */
export async function uploadPhoto(
  galleryId: string,
  file: File,
  position: number,
): Promise<Photo> {
  const invalid = validatePhotoFile(file)
  if (invalid !== null) {
    throw new Error(invalid)
  }

  const extension = EXTENSION_BY_MIME[file.type] ?? 'bin'
  const storagePath = `${galleryId}/${crypto.randomUUID()}.${extension}`
  const dimensions = await readDimensions(file)

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError !== null) {
    throw new Error(uploadError.message)
  }

  const { data, error: insertError } = await supabase
    .from('photos')
    .insert({
      gallery_id: galleryId,
      storage_path: storagePath,
      width: dimensions.width,
      height: dimensions.height,
      position,
    })
    .select()
    .single()

  if (insertError !== null) {
    await supabase.storage.from(BUCKET).remove([storagePath])
    throw new Error(insertError.message)
  }

  return data
}

/**
 * Borra la fila y después el objeto.
 *
 * Ese orden deja el peor caso en un archivo huérfano (invisible, coste mínimo)
 * en vez de una fila apuntando a un archivo que ya no existe (imagen rota).
 * `cover_photo_id` se limpia solo por la FK `on delete set null`.
 */
export async function deletePhoto(
  photo: Photo,
): Promise<{ fileDeleted: boolean }> {
  const { error } = await supabase.from('photos').delete().eq('id', photo.id)

  if (error !== null) {
    throw new Error(error.message)
  }

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([photo.storage_path])

  return { fileDeleted: storageError === null }
}
