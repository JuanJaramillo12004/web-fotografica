import { NavLink, Outlet, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'

const adminNav = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/galerias', label: 'Galerías', end: false },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
    toast.success('Sesión cerrada')
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 lg:flex-row">
      <aside className="lg:w-56 lg:shrink-0">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Panel</p>
        <p className="mt-1 text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-zinc-500">
          {user?.email} · {user?.role}
        </p>

        <nav aria-label="Navegación del panel" className="mt-6 flex flex-col gap-1">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          Cerrar sesión
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
