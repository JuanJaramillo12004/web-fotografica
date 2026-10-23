import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import type { Role } from '../../types/auth'
import { FullScreenLoader } from '../ui/FullScreenLoader'

interface ProtectedRouteProps {
  /** Si se indica, el usuario debe tener uno de estos roles. */
  allowedRoles?: readonly Role[]
  /** Destino para usuarios sin sesión. */
  loginPath?: string
  /** Destino para usuarios autenticados sin el rol requerido. */
  forbiddenPath?: string
}

/**
 * Envuelve las rutas que exigen sesión. Se usa como ruta de layout (sin
 * `path`), de modo que agrupa a sus hijas sin añadir un segmento a la URL.
 *
 *   { element: <ProtectedRoute />, children: [...] }
 */
export function ProtectedRoute({
  allowedRoles,
  loginPath = '/login',
  forbiddenPath = '/sin-acceso',
}: ProtectedRouteProps) {
  const { status, user } = useAuth()
  const location = useLocation()

  // Mientras se restaura la sesión no se puede decidir. Redirigir aquí
  // provocaría un parpadeo hacia /login en cada recarga.
  if (status === 'loading') {
    return <FullScreenLoader label="Comprobando sesión…" />
  }

  if (status === 'unauthenticated' || user === null) {
    // Se guarda la ruta de origen para volver a ella tras el login.
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  if (allowedRoles !== undefined && !allowedRoles.includes(user.role)) {
    return <Navigate to={forbiddenPath} replace />
  }

  return <Outlet />
}
