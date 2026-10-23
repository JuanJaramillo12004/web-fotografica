import { createContext } from 'react'
import type { AuthStatus, Credentials, LoginResult, Role, Session, User } from '../types/auth'

export interface AuthContextValue {
  status: AuthStatus
  session: Session | null
  user: User | null
  isAuthenticated: boolean
  login: (credentials: Credentials) => Promise<LoginResult>
  logout: () => Promise<void>
  hasRole: (roles: readonly Role[]) => boolean
}

/**
 * Vive en su propio módulo (sin componentes) para no romper la regla
 * `react-refresh/only-export-components`.
 */
export const AuthContext = createContext<AuthContextValue | null>(null)
