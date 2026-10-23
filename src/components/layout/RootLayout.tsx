import { Link, Outlet } from 'react-router'
import { Logo } from '@/components/brand/Logo'

const publicNav = [
  { to: '/', label: 'Inicio' },
  { to: '/admin', label: 'Panel' },
]

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-zinc-950">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-6 px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium tracking-tight"
          >
            <Logo className="size-7" />
            Web fotográfica
          </Link>

          <nav aria-label="Navegación principal" className="flex items-center gap-5">
            {publicNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto w-full max-w-7xl px-6 py-6 text-xs text-zinc-500">
          © {new Date().getFullYear()} Web fotográfica
        </div>
      </footer>
    </div>
  )
}
