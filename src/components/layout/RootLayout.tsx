import type { MouseEvent } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { Logo } from '@/components/brand/Logo'

const publicNav = [
  { id: 'trabajos', label: 'Trabajos' },
  { id: 'estudio', label: 'Estudio' },
] as const

export function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  function scrollToSection(id: string) {
    const target = document.getElementById(id)
    if (!target) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  function handleSectionClick(id: string, event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    if (location.pathname === '/') {
      scrollToSection(id)
      return
    }

    navigate(`/#${id}`)
    // El destino se monta al cambiar de ruta; esperamos un frame.
    window.setTimeout(() => scrollToSection(id), 80)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 w-full max-w-[1400px] items-center justify-between gap-6 px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium tracking-tight transition-opacity hover:opacity-70"
          >
            <Logo className="size-8 text-primary" />
            <span className="text-base font-medium tracking-tight">Web fotográfica</span>
          </Link>

          <nav
            aria-label="Navegación principal"
            className="flex items-center gap-7"
          >
            {publicNav.map((item) => (
              <a
                key={item.id}
                href={`/#${item.id}`}
                onClick={(event) => handleSectionClick(item.id, event)}
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                {item.label}
              </a>
            ))}

            <Link
              to="/login"
              className="inline-flex h-9 items-center justify-center border border-primary px-4 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Acceder
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Web fotográfica · Estudio de fotografía
          </p>
          <div className="flex items-center gap-5">
            <a
              href="mailto:hola@webfotografica.es"
              className="transition-colors hover:text-foreground"
            >
              hola@webfotografica.es
            </a>
            <a
              href="/#estudio"
              onClick={(event) => handleSectionClick('estudio', event)}
              className="transition-colors hover:text-foreground"
            >
              Estudio
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
