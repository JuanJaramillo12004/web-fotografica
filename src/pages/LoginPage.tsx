import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { DEMO_CREDENTIALS } from '../lib/auth'
import { getRedirectPath } from '../lib/navigation'

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
      <h1 className="text-2xl font-medium tracking-tight">Acceso al panel</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Introduce tus credenciales para gestionar galerías y encargos.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-950"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-950"
          />
        </div>

        {error !== null && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="mt-8 rounded-md border border-dashed border-zinc-300 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Credenciales de prueba
        </p>
        <ul className="mt-2 flex flex-col gap-1 text-xs text-zinc-600">
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
