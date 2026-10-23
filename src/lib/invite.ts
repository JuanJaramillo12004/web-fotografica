import { callAdminFunction } from './adminFunction'

export interface InviteUserInput {
  email: string
  name?: string
  role?: 'admin' | 'client'
}

export async function inviteUser(input: InviteUserInput): Promise<void> {
  await callAdminFunction('invite-user', {
    method: 'POST',
    body: {
      email: input.email.trim().toLowerCase(),
      name: input.name?.trim() || undefined,
      role: input.role ?? 'client',
    },
  })
}
