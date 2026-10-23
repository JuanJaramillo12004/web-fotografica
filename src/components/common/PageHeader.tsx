import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** Botones o acciones alineados a la derecha. */
  actions?: ReactNode
}

/**
 * Cabecera de las páginas del panel: título, resumen y acción principal.
 * Mantiene el mismo ritmo vertical en todas las secciones.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
        {description !== undefined && (
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
        )}
      </div>

      {actions !== undefined && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
