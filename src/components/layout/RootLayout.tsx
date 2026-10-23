import { Link, Outlet } from 'react-router'
import { Logo } from '@/components/brand/Logo'

const publicNav = [
  { to: '/', label: 'Inicio' },
  { to: '/admin', label: 'Panel' },
]

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-6 px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium tracking-tight transition-opacity hover:opacity-80"
          >
            <Logo className="size-6" />
            <span>Web fotográfica</span>
          </Link>

          <nav aria-label="Navegación principal" className="flex items-center gap-6">
            {publicNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Web fotográfica</p>
          <p className="hidden sm:block">Reportajes editoriales</p>
        </div>
      </footer>
    </div>
  )
}
