import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { inviteUser } from '@/lib/invite'

export function UsersPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'client' | 'admin'>('client')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('El email es obligatorio.')
      return
    }

    setSubmitting(true)
    try {
      await inviteUser({ email, name, role })
      toast.success(`Invitación enviada a ${email.trim().toLowerCase()}`)
      setEmail('')
      setName('')
      setRole('client')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la invitación')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invita a clientes o administradores para que se creen su propia contraseña.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Enviar invitación</CardTitle>
          <CardDescription>
            El usuario recibirá un email con un enlace para establecer su contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="cliente@ejemplo.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-name">Nombre (opcional)</Label>
              <Input
                id="invite-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nombre y apellidos"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Rol</Label>
              <select
                id="invite-role"
                value={role}
                onChange={(event) => setRole(event.target.value as 'client' | 'admin')}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="client">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Los clientes solo podrán ver sus galerías asignadas. Los administradores
                gestionan todo.
              </p>
            </div>

            {error !== null && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="self-start">
              {submitting ? 'Enviando…' : 'Enviar invitación'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
