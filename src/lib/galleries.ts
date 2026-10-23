import { supabase } from './supabase'
import type { Database } from '../types/database'

export type Gallery = Database['public']['Tables']['galleries']['Row']
export type GalleryStatus = Database['public']['Enums']['gallery_status']

export interface NewGalleryInput {
  title: string
  slug: string
  shootDate?: string | null
}

/**
 * Convierte un título en slug: sin acentos, en minúsculas y separado por
 * guiones. Debe cumplir el CHECK de la tabla (`^[a-z0-9]+(-[a-z0-9]+)*$`).
 */
export function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}

/**
 * Lista las galerías que el usuario puede ver.
 *
 * No hay `where` por rol a propósito: RLS ya decide. El admin recibe todas; un
 * cliente recibiría solo las suyas y las publicadas.
 */
export async function listGalleries(): Promise<Gallery[]> {
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error !== null) {
    throw new Error(error.message)
  }

  return data
}

export async function createGallery(input: NewGalleryInput): Promise<Gallery> {
  const { data, error } = await supabase
    .from('galleries')
    .insert({
      title: input.title.trim(),
      slug: input.slug,
      shoot_date: input.shootDate ?? null,
    })
    .select()
    .single()

  if (error !== null) {
    // 23505 es la violación del índice único de `slug`.
    if (error.code === '23505') {
      throw new Error('Ya existe una galería con ese identificador (slug).')
    }
    throw new Error(error.message)
  }

  return data
}
