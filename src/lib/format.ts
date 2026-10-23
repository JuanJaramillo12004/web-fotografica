const dateFormat = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' })
const dateTimeFormat = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

/** Fecha sin hora. Devuelve un guion cuando no hay valor. */
export function formatDate(value: string | null): string {
  if (value === null) return '—'
  return dateFormat.format(new Date(value))
}

export function formatDateTime(value: string | null): string {
  if (value === null) return '—'
  return dateTimeFormat.format(new Date(value))
}

/**
 * `shoot_date` llega como 'YYYY-MM-DD'. Añadir la hora evita que `Date` lo
 * interprete como UTC y muestre el día anterior en zonas horarias negativas.
 */
export function formatShootDate(value: string | null): string {
  if (value === null) return '—'
  return dateFormat.format(new Date(`${value}T00:00:00`))
}
