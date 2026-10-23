import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { getRedirectPath } from '../../lib/navigation'
import { FullScreenLoader } from '../ui/FullScreenLoader'

interface PublicRouteProps {
  /** Destino por defecto cuando no hay ruta de origen guardada. */
  redirectTo?: string
}

/**
 * El inverso de `ProtectedRoute`: agrupa rutas que solo tienen sentido sin
 * sesión (login, registro, recuperación de contraseña). Evita que un usuario
 * ya autenticado vuelva a ver el formulario de acceso.
 *
 *   { element: <PublicRoute />, children: [...] }
 */
export function PublicRoute({ redirectTo = '/admin' }: PublicRouteProps) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <FullScreenLoader label="Comprobando sesión…" />
  }

  if (status === 'authenticated') {
    // Si venía de una ruta protegida, se le devuelve allí.
    return <Navigate to={getRedirectPath(location.state) ?? redirectTo} replace />
  }

  return <Outlet />
}
