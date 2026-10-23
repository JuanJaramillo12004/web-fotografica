import { toast as sonner, type ExternalToast } from 'sonner'
import type { ReactNode } from 'react'

/**
 * Punto único de los avisos de la app.
 *
 * Sonner sigue siendo el motor y cada llamada acepta todas sus opciones
 * (`description`, `duration`, `action`, `id`…), así que se puede personalizar
 * sin salir del wrapper. Aquí solo se define la duración por defecto de cada
 * tipo; lo que pase la llamada tiene prioridad.
 */
export type ToastOptions = ExternalToast

function merge(defaults: ExternalToast, options?: ToastOptions): ExternalToast {
  return { ...defaults, ...options }
}

export const toast = {
  success(message: ReactNode, options?: ToastOptions) {
    return sonner.success(message, merge({ duration: 4000 }, options))
  },
  error(message: ReactNode, options?: ToastOptions) {
    return sonner.error(message, merge({ duration: 6000 }, options))
  },
  warning(message: ReactNode, options?: ToastOptions) {
    return sonner.warning(message, merge({ duration: 6000 }, options))
  },
  info(message: ReactNode, options?: ToastOptions) {
    return sonner.info(message, merge({ duration: 5000 }, options))
  },

  // El resto de la API de Sonner queda disponible sin perder los defaults.
  loading: sonner.loading,
  message: sonner.message,
  promise: sonner.promise,
  custom: sonner.custom,
  dismiss: sonner.dismiss,
}

export type Toast = typeof toast
