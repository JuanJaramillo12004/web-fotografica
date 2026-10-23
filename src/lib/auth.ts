import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Credentials, LoginResult, Role, Session, User } from '../types/auth'

function isRole(value: unknown): value is Role {
  return value === 'admin' || value === 'client'
}

/**
 * Traduce el usuario de Supabase al modelo de la app.
 *
 * El rol se lee de `app_metadata`, no de `user_metadata`: `app_metadata` solo
 * puede escribirlo el servidor (o la service_role key), así que un usuario no
 * puede ascenderse a admin editando su propio perfil.
 */
function toUser(user: SupabaseUser): User {
  const role = user.app_metadata?.role
  const name = user.user_metadata?.name

  return {
    id: user.id,
    name: typeof name === 'string' && name.length > 0 ? name : (user.email ?? 'Usuario'),
    email: user.email ?? '',
    role: isRole(role) ? role : 'client',
  }
}

function toSession(session: SupabaseSession): Session {
  return {
    user: toUser(session.user),
    token: session.access_token,
    // Supabase devuelve `expires_at` en segundos; el modelo usa milisegundos.
    expiresAt: (session.expires_at ?? 0) * 1000,
  }
}

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }
  if (normalized.includes('email not confirmed')) {
    return 'Tu cuenta aún no está confirmada. Revisa tu correo.'
  }
  if (normalized.includes('too many requests') || normalized.includes('rate limit')) {
    return 'Demasiados intentos seguidos. Espera un momento.'
  }

  return message
}

/** Restaura la sesión que el cliente de Supabase tenga persistida. */
export async function readSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()

  if (error !== null || data.session === null) {
    return null
  }

  return toSession(data.session)
}

export async function login({ email, password }: Credentials): Promise<LoginResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  if (error !== null) {
    return { ok: false, message: translateAuthError(error.message) }
  }

  if (data.session === null) {
    return { ok: false, message: 'No se pudo iniciar sesión. Inténtalo de nuevo.' }
  }

  return { ok: true, session: toSession(data.session) }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

/**
 * Sincroniza el estado con Supabase: emite `INITIAL_SESSION` al suscribirse y
 * avisa de refrescos de token, cierres de sesión en otra pestaña, etc.
 *
 * Devuelve la función para desuscribirse.
 */
export function subscribeToAuthChanges(onChange: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session === null ? null : toSession(session))
  })

  return () => {
    data.subscription.unsubscribe()
  }
}
