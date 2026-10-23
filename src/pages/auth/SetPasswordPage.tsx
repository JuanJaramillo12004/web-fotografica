import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

export function SetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Cuando el usuario llega con el link de invitación/magic link, Supabase
    // ya ha intercambiado el token y puede haber creado sesión. Si no hay sesión
    // aquí, el enlace ha caducado o ya se ha usado.
    supabase.auth.getSession().then(({ data }) => {
      setReady(true)
      if (!data.session) {
        setError(
          'El enlace ha caducado o ya se ha utilizado. Solicita una nueva invitación al administrador.',
        )
      }
    })
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      toast.success('Contraseña guardada. Ya puedes acceder.')
      // Los clientes todavía no tienen panel propio: el panel es solo para
      // administradores y ProtectedRoute les devolvería un 403.
      const isAdmin = data.user?.app_metadata?.role === 'admin'
      navigate(isAdmin ? '/admin' : '/', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la contraseña')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Establecer contraseña</CardTitle>
          <CardDescription>
            Elige una contraseña para acceder a tu cuenta de la web fotográfica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <p className="text-sm text-muted-foreground">Comprobando enlace…</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password">Repetir contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  disabled={submitting}
                />
              </div>

              {error !== null && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-full">
                {submitting ? 'Guardando…' : 'Guardar contraseña'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
