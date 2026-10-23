import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicRoute } from './components/auth/PublicRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { RootLayout } from './components/layout/RootLayout'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { GalleriesPage } from './pages/admin/GalleriesPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },

      // Solo visitantes sin sesión. Un usuario autenticado que entre en
      // /login es redirigido a /admin (o a la ruta de origen guardada).
      {
        element: <PublicRoute />,
        children: [{ path: 'login', element: <LoginPage /> }],
      },

      // Exige sesión y, además, rol `admin`. Las hijas heredan la protección:
      // no hay que repetir el guard en cada una.
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'galerias', element: <GalleriesPage /> },
            ],
          },
        ],
      },

      // Autenticado pero sin el rol requerido.
      { path: 'sin-acceso', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
