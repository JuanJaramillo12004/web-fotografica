import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createGallery,
  listGalleries,
  toSlug,
  type Gallery,
} from '@/lib/galleries'
import {
  formatShootDate,
  GALLERY_STATUS_CLASS,
  GALLERY_STATUS_LABEL,
} from '@/lib/galleryPresentation'

function describeLoadError(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'No se pudieron cargar las galerías.'
}

export function GalleriesPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [shootDate, setShootDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    // La carga inicial vive en el efecto, pero el estado se actualiza dentro de
    // los callbacks de la promesa: el efecto en sí no provoca renders en cascada.
    listGalleries()
      .then((data) => {
        if (!active) return
        setGalleries(data)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(describeLoadError(cause))
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function retry() {
    setLoading(true)
    setError(null)
    try {
      setGalleries(await listGalleries())
    } catch (cause) {
      setError(describeLoadError(cause))
    } finally {
      setLoading(false)
    }
  }

  function openForm() {
    setTitle('')
    setSlug('')
    setSlugTouched(false)
    setShootDate('')
    setFormError(null)
    setFormOpen(true)
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(toSlug(value))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (title.trim().length === 0) {
      setFormError('El título es obligatorio.')
      return
    }
    if (slug.length === 0) {
      setFormError('El identificador (slug) es obligatorio.')
      return
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      setFormError('El slug solo admite minúsculas, números y guiones simples.')
      return
    }

    setSubmitting(true)
    try {
      const created = await createGallery({
        title,
        slug,
        shootDate: shootDate.length > 0 ? shootDate : null,
      })
      setGalleries((current) => [created, ...current])
      setFormOpen(false)
      toast.success(`Galería «${created.title}» creada`)
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'No se pudo crear la galería.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Galerías</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? 'Cargando…' : `${galleries.length} galería${galleries.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {!formOpen && (
          <Button type="button" onClick={openForm}>
            Nueva galería
          </Button>
        )}
      </div>

      {formOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva galería</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              {formError !== null && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creando…' : 'Crear galería'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFormOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error !== null && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
        >
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            Reintentar
          </Button>
        </div>
      )}

      {!loading && error === null && galleries.length === 0 && (
        <Card className="border border-dashed border-border bg-transparent ring-0">
          <CardContent className="flex flex-col items-start gap-2 py-8">
            <p className="text-sm font-medium">Todavía no hay galerías</p>
            <p className="max-w-prose text-sm text-muted-foreground">
              Crea la primera para empezar a subir fotos. Nacerá como borrador: solo será
              visible desde la web pública cuando la publiques.
            </p>
          </CardContent>
        </Card>
      )}

      {galleries.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {galleries.map((gallery) => (
            <li key={gallery.id}>
              <Link
                to={`/admin/galerias/${gallery.id}`}
                className="flex flex-wrap items-center justify-between gap-3 bg-card px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{gallery.title}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    /{gallery.slug}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    {formatShootDate(gallery.shoot_date)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${GALLERY_STATUS_CLASS[gallery.status]}`}
                  >
                    {GALLERY_STATUS_LABEL[gallery.status]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
