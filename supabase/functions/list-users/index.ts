import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'client'
  createdAt: string
  lastSignInAt: string | null
  invitedAt: string | null
  confirmed: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Método no permitido' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonResponse(
        { error: 'La función no está configurada correctamente' },
        500,
      )
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'No autorizado' }, 401)
    }

    // Cliente con el JWT del usuario que llama para verificar permisos.
    const caller = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: callerUser, error: callerError } =
      await caller.auth.getUser()
    if (callerError || !callerUser.user) {
      return jsonResponse({ error: 'Sesión inválida o caducada' }, 401)
    }

    if (callerUser.user.app_metadata?.role !== 'admin') {
      return jsonResponse(
        { error: 'Solo administradores pueden ver los usuarios' },
        403,
      )
    }

    // El rol vive en `app_metadata`, que no es legible desde el frontend:
    // por eso esta lista se construye aquí con service_role.
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const users: AdminUser[] = []
    const perPage = 200
    let page = 1

    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage,
      })

      if (error) {
        return jsonResponse({ error: error.message }, 400)
      }

      for (const user of data.users) {
        const name = user.user_metadata?.name
        users.push({
          id: user.id,
          email: user.email ?? '',
          name: typeof name === 'string' ? name : '',
          role: user.app_metadata?.role === 'admin' ? 'admin' : 'client',
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at ?? null,
          invitedAt: user.invited_at ?? null,
          confirmed:
            user.email_confirmed_at !== null &&
            user.email_confirmed_at !== undefined,
        })
      }

      if (data.users.length < perPage) break
      page += 1
    }

    users.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return jsonResponse({ users })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado'
    return jsonResponse({ error: message }, 500)
  }
})
