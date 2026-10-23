import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. ' +
      'Copia .env.example a .env.local y rellena los valores del proyecto.',
  )
}

/**
 * Cliente único de Supabase.
 *
 * Solo usa la `anon key`, que es pública por diseño: lo que protege los datos
 * son las políticas RLS de Postgres, no el secreto de esta clave. La
 * `service_role` key NUNCA debe llegar al navegador.
 */
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
