import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  login as loginRequest,
  logout as logoutRequest,
  readSession,
  subscribeToAuthChanges,
} from '../../lib/auth'
import { AuthContext, type AuthContextValue } from '../../lib/authContext'
import type { AuthStatus, Credentials, Role, Session } from '../../types/auth'

interface AuthProviderProps {
  children: ReactNode
}

interface AuthState {
  status: AuthStatus
  session: Session | null
}

export function AuthProvider({ children }: AuthProviderProps) {
  // `loading` es real ahora: la sesión se restaura contra Supabase, no de
  // localStorage de forma síncrona. Los guards muestran loader mientras tanto.
  const [state, setState] = useState<AuthState>({ status: 'loading', session: null })

  const applySession = useCallback((session: Session | null) => {
    setState({
      status: session === null ? 'unauthenticated' : 'authenticated',
      session,
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    // `onAuthStateChange` emite INITIAL_SESSION al suscribirse, así que cubre
    // tanto la restauración inicial como los refrescos de token y los cierres
    // de sesión desde otra pestaña.
    const unsubscribe = subscribeToAuthChanges((session) => {
      if (!cancelled) applySession(session)
    })

    // Red de seguridad: si la suscripción no emite (red caída), no dejamos la
    // app atrapada en `loading`.
    readSession().then((session) => {
      if (!cancelled) applySession(session)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [applySession])

  const login = useCallback(
    async (credentials: Credentials) => {
      const result = await loginRequest(credentials)
      if (result.ok) {
        applySession(result.session)
      }
      return result
    },
    [applySession],
  )

  const logout = useCallback(async () => {
    await logoutRequest()
    applySession(null)
  }, [applySession])

  const { status, session } = state

  const hasRole = useCallback(
    (roles: readonly Role[]) => session !== null && roles.includes(session.user.role),
    [session],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      isAuthenticated: status === 'authenticated',
      login,
      logout,
      hasRole,
    }),
    [status, session, login, logout, hasRole],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
