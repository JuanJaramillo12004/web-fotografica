import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorAlertProps {
  message: string
  /** Acción opcional a la derecha, como un botón de reintentar. */
  action?: ReactNode
  className?: string
}

/**
 * Único formato de error visible de la app: errores de formulario, de carga y
 * de subida comparten alerta y `role="alert"` viene del componente base.
 */
export function ErrorAlert({ message, action, className }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle />
      <AlertDescription className="flex w-full flex-wrap items-center justify-between gap-3">
        <span className="whitespace-pre-wrap">{message}</span>
        {action}
      </AlertDescription>
    </Alert>
  )
}
