import { callAdminFunction } from './adminFunction'
import type { Role } from '../types/auth'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
  lastSignInAt: string | null
  invitedAt: string | null
  confirmed: boolean
}

interface UsersResponse {
  users: AdminUser[]
}

/** Lista de usuarios de Auth con su rol. Solo disponible para administradores. */
export async function listUsers(signal?: AbortSignal): Promise<AdminUser[]> {
  const data = await callAdminFunction<UsersResponse>('list-users', {
    method: 'GET',
    signal,
  })

  return data.users
}

export type UserStatus = 'active' | 'invited' | 'unconfirmed'

/**
 * Un usuario invitado que todavía no ha entrado sigue con la invitación
 * pendiente; el resto de cuentas sin confirmar quedan como «sin confirmar».
 */
export function userStatus(user: AdminUser): UserStatus {
  if (user.confirmed) return 'active'
  if (user.invitedAt !== null) return 'invited'
  return 'unconfirmed'
}

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Activo',
  invited: 'Invitación pendiente',
  unconfirmed: 'Sin confirmar',
}

export const USER_STATUS_CLASS: Record<UserStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  invited: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  unconfirmed: 'bg-muted text-muted-foreground',
}
