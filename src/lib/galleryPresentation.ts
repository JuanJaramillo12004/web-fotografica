import type { GalleryStatus } from './galleries'

export const GALLERY_STATUS_LABEL: Record<GalleryStatus, string> = {
  draft: 'Borrador',
  published: 'Publicada',
  archived: 'Archivada',
}

export const GALLERY_STATUS_CLASS: Record<GalleryStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  archived: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
}
