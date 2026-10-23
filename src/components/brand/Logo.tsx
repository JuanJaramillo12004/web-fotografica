import logoUrl from '@/assets/pictures.svg'

interface LogoProps {
  className?: string
}

/**
 * Logotipo de la marca.
 * Usa `currentColor` para poder teñirse con las utilidades de Tailwind
 * (`text-primary`, `text-foreground`, ...).
 */
export function Logo({ className }: LogoProps) {
  return (
    <img
      src={logoUrl}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`select-none ${className ?? ''}`}
    />
  )
}
