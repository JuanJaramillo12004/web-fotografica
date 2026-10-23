import { supabase } from './supabase'

export interface InviteUserInput {
  email: string
  name?: string
  role?: 'admin' | 'client'
}

export async function inviteUser(input: InviteUserInput): Promise<void> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    throw new Error('No hay sesión activa')
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email.trim().toLowerCase(),
      name: input.name?.trim() || undefined,
      role: input.role ?? 'client',
    }),
  })

  const body = (await response.json()) as { error?: string; ok?: boolean }

  if (!response.ok || body.error) {
    throw new Error(body.error ?? 'No se pudo enviar la invitación')
  }
}
