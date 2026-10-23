import { useRef } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/gsap'

const works = [
  {
    title: 'Marta y Luis',
    location: 'Finca El Olivar, Toledo',
    alt: 'Pareja de novios caminando entre olivos al atardecer',
    photo: 'photo-1519741497674-611481863552',
    className: 'md:col-span-7',
    ratio: 'aspect-[4/3]',
  },
  {
    title: 'Clara',
    location: 'Luz de tarde, Madrid',
    alt: 'Retrato de una mujer con luz natural de tarde',
    photo: 'photo-1507504031003-b417219a0fde',
    className: 'md:col-span-4 md:col-start-9 md:mt-28',
    ratio: 'aspect-[3/4]',
  },
  {
    title: 'Ana y Pablo',
    location: 'Casa de piedra, Segovia',
    alt: 'Pareja de novios abrazados junto a una casa de piedra',
    photo: 'photo-1511285560929-80b456fea0bc',
    className: 'md:col-span-4',
    ratio: 'aspect-[3/4]',
  },
  {
    title: 'Retrato familiar',
    location: 'Estudio, Madrid',
    alt: 'Retrato familiar en blanco y negro con fondo neutro',
    photo: 'photo-1494790108377-be9c29b29330',
    className: 'md:col-span-7 md:col-start-6',
    ratio: 'aspect-[16/10]',
  },
] as const

const process = [
  {
    number: '01',
    title: 'Antes',
    body: 'Una conversación para entender la historia, el lugar y lo que queréis recordar.',
  },
  {
    number: '02',
    title: 'Durante',
    body: 'Trabajamos con luz natural y sin interrumpir. La escena manda.',
  },
  {
    number: '03',
    title: 'Después',
    body: 'Seleccionamos, editamos y entregamos una galería privada lista para compartir.',
  },
] as const

const manifesto = 'No dirigimos la escena. Acompañamos lo que ocurre.'.split(' ')

function photoUrl(id: string, width: number): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`
}

function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({
    behavior: reduce ? 'auto' : 'smooth',
    block: 'start',
  })
}

export function HomePage() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
      })

      intro
        .from('[data-hero-line]', {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.08,
        })
        .from(
          '[data-hero-copy]',
          { y: 18, opacity: 0, duration: 0.8, stagger: 0.07 },
          '-=0.65',
        )
        .from(
          '[data-hero-media]',
          { y: 32, opacity: 0, duration: 1.1 },
          '-=0.9',
        )

      gsap.to('[data-hero-parallax]', {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-hero]',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.utils.toArray<HTMLElement>('[data-work]').forEach((item, index) => {
        gsap.from(item, {
          y: 48,
          opacity: 0,
          duration: 0.9,
          delay: index * 0.04,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            once: true,
          },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-work-image]').forEach((image) => {
        gsap.fromTo(
          image,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: 'none',
            scrollTrigger: {
              trigger: image,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })

      gsap.from('[data-manifesto-word]', {
        opacity: 0.12,
        y: 10,
        duration: 0.55,
        stagger: 0.055,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '[data-manifesto]',
          start: 'top 76%',
          once: true,
        },
      })

      gsap.utils.toArray<HTMLElement>('[data-process-row]').forEach((row, index) => {
        gsap.from(row, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          delay: index * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 88%',
            once: true,
          },
        })
      })

      gsap.from('[data-quote]', {
        y: 26,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '[data-quote]',
          start: 'top 82%',
          once: true,
        },
      })

      gsap.from('[data-cta]', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '[data-cta]',
          start: 'top 82%',
          once: true,
        },
      })
    },
    { scope },
  )

  return (
    <div ref={scope} className="flex flex-1 flex-col">
      <section data-hero className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 px-6 pt-14 pb-16 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pt-24 lg:pb-24">
          <div className="flex flex-col justify-center lg:col-span-6 xl:col-span-5">
            <p
              data-hero-copy
              className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground"
            >
              Fotografía editorial · Madrid
            </p>

            <h1 className="mt-6 text-[clamp(2.9rem,8vw,5.8rem)] font-medium leading-[0.95] tracking-[-0.045em]">
              <span className="block overflow-hidden pb-1">
                <span data-hero-line className="block">
                  La luz también
                </span>
              </span>
              <span className="block overflow-hidden pb-2">
                <span data-hero-line className="block italic">
                  se recuerda.
                </span>
              </span>
            </h1>

            <p
              data-hero-copy
              className="mt-7 max-w-[42ch] text-base leading-relaxed text-muted-foreground"
            >
              Reportajes de boda, familia y retrato con una mirada íntima y
              atemporal.
            </p>

            <div data-hero-copy className="mt-9 flex flex-wrap items-center gap-5">
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center border border-primary bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
              >
                Acceder a tu galería
              </Link>
              <a
                href="/#trabajos"
                onClick={(event) => {
                  event.preventDefault()
                  scrollToSection('trabajos')
                }}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Ver reportajes
                <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>

          <div className="relative lg:col-span-6 xl:col-span-7">
            <div data-hero-media className="relative ml-auto w-full max-w-[580px]">
              <div className="relative aspect-[4/5] overflow-hidden bg-muted lg:aspect-auto lg:h-[68vh] lg:max-h-[680px]">
                <img
                  data-hero-parallax
                  src={photoUrl(works[0].photo, 1200)}
                  srcSet={[
                    `${photoUrl(works[0].photo, 800)} 800w`,
                    `${photoUrl(works[0].photo, 1200)} 1200w`,
                    `${photoUrl(works[0].photo, 1800)} 1800w`,
                  ].join(', ')}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  alt={works[0].alt}
                  width={1200}
                  height={1500}
                  fetchPriority="high"
                  className="absolute inset-x-0 -top-[9%] h-[118%] w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-8 -left-6 hidden w-[42%] sm:block">
                <div className="aspect-[3/4] overflow-hidden bg-muted ring-1 ring-background">
                  <img
                    src={photoUrl(works[1].photo, 700)}
                    srcSet={[
                      `${photoUrl(works[1].photo, 500)} 500w`,
                      `${photoUrl(works[1].photo, 700)} 700w`,
                    ].join(', ')}
                    sizes="20vw"
                    alt={works[1].alt}
                    width={700}
                    height={933}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <p className="mt-4 text-right text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Bodas · Familia · Retrato
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="trabajos" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:py-28">
          <h2 className="max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Reportajes recientes
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-12">
            {works.map((work) => (
              <figure key={work.title} data-work className={`group ${work.className}`}>
                <div className={`relative overflow-hidden bg-muted ${work.ratio}`}>
                  <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.025]">
                    <img
                      data-work-image
                      src={photoUrl(work.photo, 1200)}
                      srcSet={[
                        `${photoUrl(work.photo, 800)} 800w`,
                        `${photoUrl(work.photo, 1200)} 1200w`,
                        `${photoUrl(work.photo, 1800)} 1800w`,
                      ].join(', ')}
                      sizes="(min-width: 768px) 55vw, 100vw"
                      alt={work.alt}
                      width={1200}
                      height={900}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-x-0 -top-[6%] h-[112%] w-full object-cover"
                    />
                  </div>
                </div>

                <figcaption className="mt-3 flex items-baseline justify-between gap-4">
                  <span className="text-sm">{work.title}</span>
                  <span className="text-xs text-muted-foreground">{work.location}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div data-manifesto className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:py-32">
          <p className="max-w-4xl text-3xl font-medium leading-[1.12] tracking-[-0.035em] sm:text-4xl lg:text-6xl">
            {manifesto.map((word, index) => (
              <span
                key={`${word}-${index}`}
                data-manifesto-word
                className="mr-[0.24em] inline-block"
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section id="estudio" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:py-28">
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Cómo trabajamos
          </h2>

          <div className="mt-12 border-t border-border">
            {process.map((step) => (
              <div
                key={step.number}
                data-process-row
                className="grid gap-4 border-b border-border py-8 md:grid-cols-12 md:items-baseline"
              >
                <span className="font-mono text-xs text-muted-foreground md:col-span-1">
                  {step.number}
                </span>
                <h3 className="text-lg font-medium md:col-span-3">{step.title}</h3>
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground md:col-span-7 md:justify-self-end">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:py-28">
          <blockquote data-quote className="mx-auto max-w-4xl text-center">
            <p className="text-2xl leading-snug tracking-tight text-balance sm:text-3xl lg:text-4xl">
              “Hay fotos que no buscan impresionar. Buscan devolverte a ese día.”
            </p>
            <footer className="mt-6 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Estudio Web fotográfica
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="border-t border-border">
        <div
          data-cta
          className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 py-20 md:flex-row md:items-end md:justify-between lg:py-28"
        >
          <div>
            <h2 className="max-w-2xl text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
              ¿Tienes una fecha en mente?
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Cuéntanos qué quieres recordar. Te respondemos con disponibilidad y
              el siguiente paso.
            </p>
          </div>

          <a
            href="mailto:hola@webfotografica.es"
            className="group inline-flex w-fit items-center gap-2 border-b border-foreground pb-1 text-sm font-medium transition-colors hover:border-muted-foreground hover:text-muted-foreground"
          >
            Escríbenos
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>
    </div>
  )
}
