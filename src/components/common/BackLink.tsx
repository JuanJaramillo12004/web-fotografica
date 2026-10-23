import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

interface BackLinkProps {
  to: string
  children: ReactNode
}

/** Enlace de vuelta con el mismo aspecto en las páginas de detalle. */
export function BackLink({ to, children }: BackLinkProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="-ml-2.5 w-fit text-muted-foreground"
    >
      <Link to={to}>
        <ArrowLeft />
        {children}
      </Link>
    </Button>
  )
}
