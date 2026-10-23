import { toast as sonner, type ExternalToast } from 'sonner'
import type { ReactNode } from 'react'

/**
 * Punto único de los avisos de la app.
 *
 * Sonner sigue siendo el motor y cada llamada acepta todas sus opciones
 * (`description`, `duration`, `action`, `id`…), así que se puede personalizar
 * sin salir del wrapper. Los toasts se auto-cierran con un delay coherente
 * con el tono minimal/editorial de la UI.
 */
export type ToastOptions = ExternalToast

function merge(defaults: ExternalToast, options?: ToastOptions): ExternalToast {
  return { ...defaults, ...options }
}

export const toast = {
  success(message: ReactNode, options?: ToastOptions) {
    return sonner.success(message, merge({ duration: 3000 }, options))
  },
  error(message: ReactNode, options?: ToastOptions) {
    return sonner.error(message, merge({ duration: 3500 }, options))
  },
  warning(message: ReactNode, options?: ToastOptions) {
    return sonner.warning(message, merge({ duration: 3500 }, options))
  },
  info(message: ReactNode, options?: ToastOptions) {
    return sonner.info(message, merge({ duration: 3000 }, options))
  },

  // El resto de la API de Sonner queda disponible sin perder los defaults.
  loading: sonner.loading,
  message: sonner.message,
  promise: sonner.promise,
  custom: sonner.custom,
  dismiss: sonner.dismiss,
}

export type Toast = typeof toast
