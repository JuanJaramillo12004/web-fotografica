import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

/** Hueco vacío reutilizable: listas sin datos, galerías sin fotos, etc. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-xl border border-dashed border-border px-4 py-10 text-center',
        className,
      )}
    >
      {icon !== undefined && (
        <div className="text-muted-foreground">{icon}</div>
      )}
      <p className="mt-2 text-sm font-medium">{title}</p>
      {description !== undefined && (
        <p className="mt-1 max-w-prose text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {action !== undefined && <div className="mt-4">{action}</div>}
    </div>
  )
}
