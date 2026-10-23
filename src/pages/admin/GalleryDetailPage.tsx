import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ImageOff, Star, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  getGallery,
  setGalleryCover,
  updateGalleryStatus,
  type Gallery,
} from '@/lib/galleries'
import {
  formatDateTime,
  formatShootDate,
  GALLERY_STATUS_CLASS,
  GALLERY_STATUS_LABEL,
} from '@/lib/galleryPresentation'
import {
  ACCEPT_ATTRIBUTE,
  deletePhoto,
  listPhotos,
  MAX_FILE_SIZE,
  signedUrlsFor,
  uploadPhoto,
  type Photo,
} from '@/lib/photos'

function messageOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Ha ocurrido un error inesperado.'
}

export function GalleryDetailPage() {
  const { galleryId } = useParams<{ galleryId: string }>()

  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [statusPending, setStatusPending] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!galleryId) return
    let active = true

    Promise.all([getGallery(galleryId), listPhotos(galleryId)])
      .then(async ([found, rows]) => {
        const signed = await signedUrlsFor(rows.map((photo) => photo.storage_path))
        if (!active) return
        setGallery(found)
        setPhotos(rows)
        setUrls(signed)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(messageOf(cause))
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [galleryId])

  async function refresh() {
    if (!galleryId) return
    const [found, rows] = await Promise.all([getGallery(galleryId), listPhotos(galleryId)])
    const signed = await signedUrlsFor(rows.map((photo) => photo.storage_path))
    setGallery(found)
    setPhotos(rows)
    setUrls(signed)
  }

  async function handleFiles(files: File[]) {
    if (!gallery || files.length === 0 || uploading !== null) return

    setUploadError(null)
    setUploading({ done: 0, total: files.length })

    const failures: string[] = []
    let nextPosition = photos.reduce((max, photo) => Math.max(max, photo.position), -1) + 1
    let firstNewId: string | null = null

    // Secuencial a propósito: subir 30 archivos en paralelo satura la conexión
    // y hace que un fallo sea más difícil de atribuir a un archivo concreto.
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      try {
        const photo = await uploadPhoto(gallery.id, file, nextPosition)
        nextPosition += 1
        if (firstNewId === null) firstNewId = photo.id
      } catch (cause) {
        failures.push(`${file.name}: ${messageOf(cause)}`)
      }
      setUploading({ done: index + 1, total: files.length })
    }

    // La primera foto pasa a ser portada si la galería aún no tiene ninguna.
    if (firstNewId !== null && gallery.cover_photo_id === null) {
      try {
        await setGalleryCover(gallery.id, firstNewId)
      } catch {
        // No es crítico: la portada se puede elegir a mano.
      }
    }

    try {
      await refresh()
    } catch (cause) {
      setError(messageOf(cause))
    }

    setUploading(null)

    if (failures.length > 0) {
      setUploadError(failures.join('\n'))
      toast.error(
        failures.length === 1
          ? 'Una imagen no se pudo subir'
          : `${failures.length} imágenes no se pudieron subir`,
      )
      return
    }

    toast.success(files.length === 1 ? 'Foto subida' : `${files.length} fotos subidas`)
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    // Permite volver a elegir el mismo archivo después de un error.
    event.target.value = ''
    void handleFiles(files)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    void handleFiles(Array.from(event.dataTransfer.files))
  }

  async function handleDelete(photo: Photo) {
    setPendingDelete(null)
    try {
      const { fileDeleted } = await deletePhoto(photo)
      await refresh()
      if (fileDeleted) {
        toast.success('Foto eliminada')
      } else {
        toast.warning('Foto eliminada de la galería, pero el archivo sigue en Storage')
      }
    } catch (cause) {
      toast.error(messageOf(cause))
    }
  }

  async function handleSetCover(photo: Photo) {
    if (!gallery) return
    try {
      await setGalleryCover(gallery.id, photo.id)
      setGallery({ ...gallery, cover_photo_id: photo.id })
      toast.success('Portada actualizada')
    } catch (cause) {
      toast.error(messageOf(cause))
    }
  }

  async function handleToggleStatus() {
    if (!gallery) return
    setStatusPending(true)
    try {
      const next = gallery.status === 'published' ? 'draft' : 'published'
      const updated = await updateGalleryStatus(gallery.id, next)
      setGallery(updated)
      toast.success(
        next === 'published'
          ? 'Galería publicada: ya es visible desde la web pública'
          : 'Galería vuelta a borrador: solo la ves tú',
      )
    } catch (cause) {
      toast.error(messageOf(cause))
    } finally {
      setStatusPending(false)
    }
  }

  if (!galleryId) {
    return <p className="text-sm text-destructive">Falta el identificador de la galería.</p>
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando galería…</p>
  }

  if (gallery === null) {
    return (
      <section className="flex flex-col gap-4">
        <Link
          to="/admin/galerias"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Galerías
        </Link>
        <p className="text-sm">
          {error ?? 'La galería no existe o no tienes permiso para verla.'}
        </p>
      </section>
    )
  }

  const isPublished = gallery.status === 'published'

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link
          to="/admin/galerias"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Galerías
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-medium tracking-tight">{gallery.title}</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${GALLERY_STATUS_CLASS[gallery.status]}`}
              >
                {GALLERY_STATUS_LABEL[gallery.status]}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">/{gallery.slug}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {photos.length} foto{photos.length === 1 ? '' : 's'} · reportaje{' '}
              {formatShootDate(gallery.shoot_date)}
              {gallery.published_at !== null &&
                ` · publicada el ${formatDateTime(gallery.published_at)}`}
            </p>
          </div>

          <Button
            type="button"
            variant={isPublished ? 'outline' : 'default'}
            onClick={handleToggleStatus}
            disabled={statusPending}
          >
            {statusPending
              ? 'Guardando…'
              : isPublished
                ? 'Volver a borrador'
                : 'Publicar galería'}
          </Button>
        </div>
      </div>

      {error !== null && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border border-dashed p-5 transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Añadir fotos</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              JPEG, PNG, WebP o AVIF · máximo {MAX_FILE_SIZE / (1024 * 1024)} MB por imagen
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT_ATTRIBUTE}
              className="hidden"
              onChange={handleFileInput}
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading !== null}
            >
              <Upload />
              {uploading !== null
                ? `Subiendo ${uploading.done}/${uploading.total}…`
                : 'Elegir archivos'}
            </Button>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          También puedes arrastrar las imágenes aquí.
        </p>

        {uploadError !== null && (
          <pre
            role="alert"
            className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-destructive"
          >
            {uploadError}
          </pre>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <ImageOff className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Esta galería todavía no tiene fotos</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sube las primeras para que el cliente pueda verlas.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => {
            const isCover = gallery.cover_photo_id === photo.id
            const url = urls[photo.storage_path]
            const sizeLabel =
              photo.width !== null && photo.height !== null
                ? `${photo.width}×${photo.height}`
                : null

            return (
              <li
                key={photo.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-muted"
              >
                <div className="aspect-square">
                  {url !== undefined ? (
                    <img
                      src={url}
                      alt={photo.alt ?? `Foto ${index + 1} de ${gallery.title}`}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                      <ImageOff className="size-5" />
                      <span className="text-xs">Sin vista previa</span>
                    </div>
                  )}
                </div>

                {isCover && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                    Portada
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-6">
                  <span className="text-xs text-white/80">
                    {index + 1}
                    {sizeLabel !== null && ` · ${sizeLabel}`}
                  </span>

                  <div className="flex items-center gap-1">
                    {pendingDelete === photo.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleDelete(photo)}
                          className="rounded px-1.5 py-0.5 text-xs font-medium text-red-200 hover:bg-white/10"
                        >
                          Eliminar
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(null)}
                          className="rounded px-1.5 py-0.5 text-xs text-white/80 hover:bg-white/10"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => void handleSetCover(photo)}
                            aria-label={`Usar la foto ${index + 1} como portada`}
                            title="Usar como portada"
                            className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white"
                          >
                            <Star className="size-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPendingDelete(photo.id)}
                          aria-label={`Eliminar la foto ${index + 1}`}
                          title="Eliminar"
                          className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
