import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '../lib/authContext'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  }

  return context
}
