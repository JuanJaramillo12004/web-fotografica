import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

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
 * Plugins como ScrollTrigger o SplitText se registran aquí cuando se usen, para
 * no arrastrar su peso al bundle hasta que hagan falta:
 *
 *   import { ScrollTrigger } from 'gsap/ScrollTrigger'
 *   gsap.registerPlugin(ScrollTrigger)
 */
export { gsap, useGSAP }
