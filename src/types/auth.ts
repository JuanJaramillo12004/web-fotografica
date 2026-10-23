/**
 * Contrato de autenticación de la aplicación.
 *
 * La sesión vive hoy en `localStorage` con un backend simulado (ver
 * `src/lib/auth.ts`). Estos tipos son la parte estable: el día que exista una
 * API real solo cambia la implementación, ni los guards ni las páginas.
 */

export type Role = 'admin' | 'client'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Session {
  user: User
  token: string
  /** Epoch en milisegundos a partir del cual la sesión deja de ser válida. */
  expiresAt: number
}

/**
 * `loading` existe para el día que restaurar la sesión sea asíncrono (API
 * real). Mientras se resuelve, los guards no pueden decidir y muestran un
 * loader en vez de redirigir a ciegas.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface Credentials {
  email: string
  password: string
}

export type LoginResult =
  | { ok: true; session: Session }
  | { ok: false; message: string }
