import logoUrl from '@/assets/pictures.svg'

interface LogoProps {
  className?: string
}

/**
 * Marca temporal mientras llega el logotipo definitivo.
 *
 * Se importa el SVG de `src/assets` (Vite lo procesa y le pone hash en el
 * build), así que reemplazar el archivo actualiza la marca en toda la app.
 * El SVG es negro: `dark:invert` lo deja legible sobre fondos oscuros.
 *
 * Es decorativo; el nombre accesible lo aporta el texto que lo acompaña.
 */
export function Logo({ className }: LogoProps) {
  return (
    <img
      src={logoUrl}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`select-none dark:invert ${className ?? ''}`}
    />
  )
}
