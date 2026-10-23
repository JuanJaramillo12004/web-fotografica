import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { AuthCard } from '@/components/common/AuthCard'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { getRedirectPath } from '@/lib/navigation'
import { toast } from '@/lib/toast'

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
    <AuthCard
      title="Acceso al panel"
      description="Introduce tus credenciales para gestionar galerías y encargos."
    >
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

        {error !== null && <ErrorAlert message={error} />}

        <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-full">
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthCard>
  )
}
