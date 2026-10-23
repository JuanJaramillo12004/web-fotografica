import { useRef } from 'react'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/gsap'

export function HomePage() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      // `useGSAP` se ejecuta en un layout effect, así que `from` aplica el
      // estado inicial antes del primer pintado: no hay parpadeo.
      gsap.from('[data-reveal]', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
      })
    },
    { scope },
  )

  return (
    <div
      ref={scope}
      className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-16"
    >
      <div>
        <p data-reveal className="text-sm text-muted-foreground">
          Página de inicio
        </p>
        <h1
          data-reveal
          className="mt-3 max-w-2xl text-4xl font-medium tracking-tight sm:text-6xl"
        >
          Tu próxima página empieza aquí.
        </h1>
      </div>
    </div>
  )
}
