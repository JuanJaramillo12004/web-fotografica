import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { toast } from '@/lib/toast'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createGallery, toSlug, type Gallery } from '@/lib/galleries'

interface CreateGalleryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Se llama tras crear la galería para añadirla al listado. */
  onCreated: (gallery: Gallery) => void
}

export function CreateGalleryDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateGalleryDialogProps) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [shootDate, setShootDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setTitle('')
    setSlug('')
    setSlugTouched(false)
    setShootDate('')
    setError(null)
    setSubmitting(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(toSlug(value))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (title.trim().length === 0) {
      setError('El título es obligatorio.')
      return
    }
    if (slug.length === 0) {
      setError('El identificador (slug) es obligatorio.')
      return
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      setError('El slug solo admite minúsculas, números y guiones simples.')
      return
    }

    setSubmitting(true)
    try {
      const created = await createGallery({
        title,
        slug,
        shootDate: shootDate.length > 0 ? shootDate : null,
      })
      toast.success(`Galería «${created.title}» creada`)
      onCreated(created)
      handleOpenChange(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo crear la galería.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-4" />
            Nueva galería
          </DialogTitle>
          <DialogDescription>
            Nacerá como borrador. Solo será visible cuando la publiques.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gallery-title">Título</Label>
            <Input
              id="gallery-title"
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Boda de Marta y Luis"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gallery-slug">Slug</Label>
            <Input
              id="gallery-slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value)
                setSlugTouched(true)
              }}
              placeholder="boda-marta-luis"
              className="font-mono"
              aria-describedby="gallery-slug-hint"
            />
            <p id="gallery-slug-hint" className="text-xs text-muted-foreground">
              Formará parte de la URL pública.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gallery-date">Fecha del reportaje</Label>
            <Input
              id="gallery-date"
              type="date"
              value={shootDate}
              onChange={(event) => setShootDate(event.target.value)}
            />
          </div>

          {error !== null && <ErrorAlert message={error} />}

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creando…' : 'Crear galería'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
