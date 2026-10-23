import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as loginRequest, logout as logoutRequest, readSession } from '../../lib/auth'
import { AuthContext, type AuthContextValue } from '../../lib/authContext'
import type { AuthStatus, Credentials, Role, Session } from '../../types/auth'

interface AuthProviderProps {
  children: ReactNode
}

interface AuthState {
  status: AuthStatus
  session: Session | null
}

/**
 * Restauración síncrona: la sesión de demostración vive en localStorage, así
 * que se puede leer durante la inicialización del estado. Esto evita el
 * `setState` dentro de un efecto y el parpadeo de un frame en `loading`.
 *
 * Con una API real, el inicializador pasaría a `{ status: 'loading' }` y la
 * sesión se resolvería de forma asíncrona; los guards ya contemplan ese estado.
 */
function createInitialState(): AuthState {
  const session = readSession()
  return {
    status: session === null ? 'unauthenticated' : 'authenticated',
    session,
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(createInitialState)

  const applySession = useCallback((session: Session | null) => {
    setState({
      status: session === null ? 'unauthenticated' : 'authenticated',
      session,
    })
  }, [])

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

  const logout = useCallback(() => {
    logoutRequest()
    applySession(null)
  }, [applySession])

  const { status, session } = state

  // Caducidad en caliente: `readSession` ya descarta sesiones vencidas al
  // arrancar, pero una sesión puede expirar con la app abierta. Esto no es
  // seguridad (eso lo hará el servidor), solo coherencia de la UI.
  useEffect(() => {
    if (session === null) return

    const timeout = window.setTimeout(
      () => {
        logoutRequest()
        applySession(null)
      },
      Math.max(0, session.expiresAt - Date.now()),
    )

    return () => {
      window.clearTimeout(timeout)
    }
  }, [session, applySession])

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
