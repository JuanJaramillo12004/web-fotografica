import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Maximize2,
  Minimize2,
  Star,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Photo } from '@/lib/photos'

type PhotoPreviewDialogProps = {
  photos: Photo[]
  urls: Record<string, string>
  galleryTitle: string
  coverPhotoId: string | null
  /** Índice de la foto abierta. `null` mantiene el visor cerrado. */
  index: number | null
  onIndexChange: (index: number | null) => void
}

/**
 * Visor de una foto suelta dentro de una galería.
 *
 * El estado vive en la página (`index`), así que el visor sirve tanto para el
 * panel como para una futura galería pública. Se cierra con Escape, con la X o
 * haciendo clic fuera, y permite cambiar de foto con las flechas del teclado.
 *
 * La imagen nunca se abre en Storage: el tamaño real se ve dentro del propio
 * visor, con scroll si la foto es mayor que la ventana.
 */
export function PhotoPreviewDialog({
  photos,
  urls,
  galleryTitle,
  coverPhotoId,
  index,
  onIndexChange,
}: PhotoPreviewDialogProps) {
  const [fullSize, setFullSize] = useState(false)

  const total = photos.length
  const open = index !== null && total > 0
  const position = open ? Math.min(index, total - 1) : 0
  const photo = open ? photos[position] : null
  const url = photo !== null ? urls[photo.storage_path] : undefined
  const hasMany = total > 1

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight' && hasMany) {
        event.preventDefault()
        setFullSize(false)
        onIndexChange((position + 1) % total)
      }
      if (event.key === 'ArrowLeft' && hasMany) {
        event.preventDefault()
        setFullSize(false)
        onIndexChange((position - 1 + total) % total)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, hasMany, position, total, onIndexChange])

  function close() {
    setFullSize(false)
    onIndexChange(null)
  }

  function goTo(next: number) {
    setFullSize(false)
    onIndexChange((next + total) % total)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[min(96vw,1400px)] gap-0 border-none bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">
          Vista previa de {galleryTitle}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {photo !== null
            ? `Foto ${position + 1} de ${total}. Usa las flechas izquierda y derecha para cambiar.`
            : 'Vista previa de la galería.'}
        </DialogDescription>

        {photo !== null && (
          <div className="flex flex-col gap-3">
            <div
              className={
                fullSize
                  ? 'relative max-h-[82vh] overflow-auto rounded-lg bg-black/40'
                  : 'relative flex max-h-[82vh] items-center justify-center overflow-hidden rounded-lg bg-black/40'
              }
            >
              {url !== undefined ? (
                <img
                  src={url}
                  alt={photo.alt ?? `Foto ${position + 1} de ${galleryTitle}`}
                  onClick={() => setFullSize((current) => !current)}
                  className={
                    fullSize
                      ? 'mx-auto block max-h-none max-w-none cursor-zoom-out'
                      : 'max-h-[82vh] w-auto max-w-full cursor-zoom-in object-contain'
                  }
                />
              ) : (
                <div className="flex aspect-square w-full max-w-md flex-col items-center justify-center gap-2 text-white/70">
                  <ImageOff className="size-6" />
                  <span className="text-sm">No se pudo cargar la vista previa</span>
                </div>
              )}

              {hasMany && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    onClick={() => goTo(position - 1)}
                    aria-label="Foto anterior"
                    title="Foto anterior"
                    className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    onClick={() => goTo(position + 1)}
                    aria-label="Foto siguiente"
                    title="Foto siguiente"
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  >
                    <ChevronRight />
                  </Button>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-black/45 px-3 py-2 text-xs text-white/80">
              <span className="flex items-center gap-2">
                <span className="font-mono">
                  {position + 1} / {total}
                </span>
                {photo.width !== null && photo.height !== null && (
                  <span className="text-white/50">
                    {photo.width}×{photo.height}
                  </span>
                )}
                {coverPhotoId === photo.id && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-white">
                    <Star className="size-3" />
                    Portada
                  </span>
                )}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFullSize((current) => !current)}
                className="h-7 gap-1.5 px-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
              >
                {fullSize ? <Minimize2 /> : <Maximize2 />}
                {fullSize ? 'Ajustar a la pantalla' : 'Tamaño real'}
              </Button>
            </div>
          </div>
        )}

        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cerrar vista previa"
            title="Cerrar"
            className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
          >
            <X />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
