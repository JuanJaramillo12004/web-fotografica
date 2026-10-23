import { useState, type FormEvent } from 'react'
import { UserPlus } from 'lucide-react'
import { toast } from '@/lib/toast'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { inviteUser } from '@/lib/invite'

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Se llama tras enviar la invitación para refrescar la lista. */
  onInvited: () => void
}

export function InviteUserDialog({
  open,
  onOpenChange,
  onInvited,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'client' | 'admin'>('client')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setEmail('')
    setName('')
    setRole('client')
    setError(null)
    setSubmitting(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

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
      onInvited()
      handleOpenChange(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la invitación')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-4" />
            Invitar usuario
          </DialogTitle>
          <DialogDescription>
            Recibirá un email con un enlace para establecer su propia contraseña.
          </DialogDescription>
        </DialogHeader>

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
              autoFocus
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
            <NativeSelect
              id="invite-role"
              value={role}
              onChange={(event) => setRole(event.target.value as 'client' | 'admin')}
            >
              <option value="client">Cliente</option>
              <option value="admin">Administrador</option>
            </NativeSelect>
            <p className="text-xs text-muted-foreground">
              Los clientes solo podrán ver sus galerías asignadas. Los administradores
              gestionan todo.
            </p>
          </div>

          {error !== null && <ErrorAlert message={error} />}

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Enviar invitación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
