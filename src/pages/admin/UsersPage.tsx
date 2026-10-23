import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, UsersRound } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { PageHeader } from '@/components/common/PageHeader'
import { InviteUserDialog } from '@/components/admin/InviteUserDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatDateTime } from '@/lib/format'
import {
  listUsers,
  USER_STATUS_CLASS,
  userStatus,
  USER_STATUS_LABEL,
  type AdminUser,
} from '@/lib/users'
import { cn } from '@/lib/utils'

function describeLoadError(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'No se pudieron cargar los usuarios.'
}

export function UsersPage() {
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      setUsers(await listUsers())
    } catch (cause) {
      setError(describeLoadError(cause))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    // Misma pauta que en Galerías: la carga inicial no toca el estado de forma
    // síncrona dentro del efecto, solo en los callbacks de la promesa.
    listUsers()
      .then((data) => {
        if (!active) return
        setUsers(data)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(describeLoadError(cause))
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Usuarios"
        description={
          loading
            ? 'Cargando…'
            : `${users.length} usuario${users.length === 1 ? '' : 's'}`
        }
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => void load()}
              disabled={refreshing}
            >
              <RefreshCw className={refreshing ? 'animate-spin' : undefined} />
              Actualizar
            </Button>
            <Button type="button" onClick={() => setInviteOpen(true)}>
              <UsersRound />
              Invitar usuario
            </Button>
          </>
        }
      />

      {error !== null && (
        <ErrorAlert
          message={error}
          action={
            <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
              Reintentar
            </Button>
          }
        />
      )}

      {!loading && error === null && users.length === 0 && (
        <EmptyState
          icon={<UsersRound className="size-6" />}
          title="Todavía no hay usuarios"
          description="Invita al primero para que pueda acceder a sus galerías."
        />
      )}

      {users.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Alta</TableHead>
                <TableHead>Último acceso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const status = userStatus(user)
                const isCurrentUser = currentUser?.id === user.id

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">
                          {user.name || 'Sin nombre'}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              (tú)
                            </span>
                          )}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'border-transparent',
                          user.role === 'admin'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('border-transparent', USER_STATUS_CLASS[status])}
                      >
                        {USER_STATUS_LABEL[status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                      {formatDateTime(user.lastSignInAt)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={() => void load()}
      />
    </section>
  )
}
