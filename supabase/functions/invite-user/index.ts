import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const siteUrl = Deno.env.get('SITE_URL')

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
      return jsonResponse({ error: 'Solo administradores pueden invitar usuarios' }, 403)
    }

    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const role = body.role === 'admin' ? 'admin' : 'client'

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: 'Email no válido' }, 400)
    }

    // Cliente con service_role para invitar y asignar app_metadata.
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const redirectTo =
      siteUrl && siteUrl.length > 0
        ? `${siteUrl.replace(/\/$/, '')}/auth/establecer-contrasena`
        : undefined

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: name.length > 0 ? { name } : undefined,
    })

    if (error) {
      // Mensajes más claros para los errores típicos de Auth.
      const message = error.message.toLowerCase()
      if (message.includes('already been registered')) {
        return jsonResponse({ error: 'Ese email ya está registrado' }, 409)
      }
      if (message.includes('rate limit')) {
        return jsonResponse({ error: 'Demasiados intentos. Prueba de nuevo más tarde' }, 429)
      }
      return jsonResponse({ error: error.message }, 400)
    }

    if (data.user) {
      await admin.auth.admin.updateUserById(data.user.id, {
        app_metadata: { role },
        user_metadata: name.length > 0 ? { name } : undefined,
      })
    }

    return jsonResponse({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado'
    return jsonResponse({ error: message }, 500)
  }
})
