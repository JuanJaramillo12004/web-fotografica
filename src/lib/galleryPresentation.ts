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

const dateFormat = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' })
const dateTimeFormat = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

/**
 * `shoot_date` llega como 'YYYY-MM-DD'. Añadir la hora evita que `Date` lo
 * interprete como UTC y muestre el día anterior en zonas horarias negativas.
 */
export function formatShootDate(value: string | null): string {
  if (value === null) return '—'
  return dateFormat.format(new Date(`${value}T00:00:00`))
}

export function formatDateTime(value: string): string {
  return dateTimeFormat.format(new Date(value))
}
