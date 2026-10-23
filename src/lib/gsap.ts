import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Respeta la preferencia de accesibilidad del sistema. Toda animación nueva
 * debe consultarlo: el movimiento no es decoración para todo el mundo.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Punto único de entrada de GSAP.
 *
 * Los plugins compartidos se registran aquí una sola vez. Cualquier página que
 * los necesite los importa desde este módulo para no registrarlos por
 * duplicado ni arrastrar dependencias sin uso.
 */
export { gsap, ScrollTrigger, useGSAP }
