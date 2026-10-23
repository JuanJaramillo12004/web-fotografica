import { supabase } from './supabase'

interface CallOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
}

interface ErrorPayload {
  error?: string
}

/**
 * Llama a una Edge Function que exige el JWT de un administrador.
 *
 * Centraliza la cabecera `Authorization` y la traducción de errores para que
 * cada función de dominio (`inviteUser`, `listUsers`…) no repita el `fetch`.
 */
export async function callAdminFunction<T>(
  name: string,
  { method = 'POST', body, signal }: CallOptions = {},
): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    throw new Error('No hay sesión activa')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`,
    {
      method,
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  )

  const text = await response.text()
  let payload: unknown = null

  if (text.length > 0) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof (payload as ErrorPayload).error === 'string'
        ? (payload as ErrorPayload).error
        : `La operación falló (${response.status})`

    throw new Error(message ?? `La operación falló (${response.status})`)
  }

  return payload as T
}
