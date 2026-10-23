import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ImagePlus, Inbox, Plus } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { CreateGalleryDialog } from '@/components/admin/CreateGalleryDialog'
import { Button } from '@/components/ui/button'
import { listGalleries, type Gallery } from '@/lib/galleries'
import { formatShootDate } from '@/lib/format'

function describeLoadError(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'No se pudieron cargar las galerías.'
}

export function GalleriesPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    let active = true

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

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Galerías"
        description={
          loading
            ? 'Cargando…'
            : `${galleries.length} galería${galleries.length === 1 ? '' : 's'}`
        }
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus />
            Nueva galería
          </Button>
        }
      />

      {error !== null && (
        <ErrorAlert
          message={error}
          action={
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Reintentar
            </Button>
          }
        />
      )}

      {loading && error === null && <ListSkeleton rows={6} />}

      {!loading && error === null && galleries.length === 0 && (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title="Todavía no hay galerías"
          description="Crea la primera para empezar a subir fotos. Nacerá como borrador: solo será visible desde la web pública cuando la publiques."
          action={
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <ImagePlus />
              Crear primera galería
            </Button>
          }
        />
      )}

      {!loading && error === null && galleries.length > 0 && (
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
                  <StatusBadge status={gallery.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CreateGalleryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(gallery) => setGalleries((current) => [gallery, ...current])}
      />
    </section>
  )
}
