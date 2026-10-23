import { useRef } from 'react'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/gsap'

export function HomePage() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      gsap.from('[data-reveal]', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
      })
    },
    { scope },
  )

  return (
    <section
      ref={scope}
      className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-16 sm:py-20 lg:py-24"
    >
      <div className="flex flex-col gap-6">
        <p
          data-reveal
          className="text-xs uppercase tracking-[0.32em] text-muted-foreground"
        >
          Fotografía editorial
        </p>
        <h1
          data-reveal
          className="max-w-4xl text-balance text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl"
        >
          Reportajes con intención. Imágenes que perduran.
        </h1>
        <p
          data-reveal
          className="max-w-[65ch] text-base leading-relaxed text-muted-foreground"
        >
          Galerías privadas para clientes, seleccionadas con cuidado y pensadas
          para disfrutar con calma.
        </p>
      </div>
    </section>
  )
}
