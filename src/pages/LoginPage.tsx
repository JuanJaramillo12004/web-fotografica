import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { DEMO_CREDENTIALS } from '@/lib/auth'
import { getRedirectPath } from '@/lib/navigation'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const result = await login({ email, password })

    if (result.ok) {
      toast.success(`Bienvenido, ${result.session.user.name}`)
      // Al autenticarse, PublicRoute también redirigiría; hacerlo aquí
      // permite respetar la ruta de origen sin parpadeo.
      navigate(getRedirectPath(location.state) ?? '/admin', { replace: true })
      return
    }

    setError(result.message)
    setSubmitting(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Acceso al panel</CardTitle>
          <CardDescription>
            Introduce tus credenciales para gestionar galerías y encargos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error !== null && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-full">
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg border border-dashed border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Credenciales de prueba
        </p>
        <ul className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
          {DEMO_CREDENTIALS.map((account) => (
            <li key={account.email} className="font-mono">
              {account.role}: {account.email} / {account.password}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
