/**
 * Extrae y sanea la ruta de origen que los guards guardan en `location.state`
 * para devolver al usuario donde quería ir después de iniciar sesión.
 *
 * Solo se aceptan rutas internas. Se rechazan valores vacíos, URLs absolutas
 * (`https://...`) y rutas protocol-relative (`//evil.com`), que serían un
 * open redirect aunque `startsWith('/')` parezca suficiente.
 */
export function getRedirectPath(state: unknown): string | null {
  if (typeof state !== 'object' || state === null) return null

  const from = (state as { from?: unknown }).from
  if (typeof from !== 'object' || from === null) return null

  const pathname = (from as { pathname?: unknown }).pathname
  if (typeof pathname !== 'string') return null

  if (!pathname.startsWith('/') || pathname.startsWith('//')) return null

  return pathname
}
