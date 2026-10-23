import { useAuth } from '../../hooks/useAuth'

export function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight">Hola, {user?.name}</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Esta ruta está detrás de <code className="font-mono text-xs">ProtectedRoute</code> con el
        rol <code className="font-mono text-xs">admin</code>.
      </p>
    </section>
  )
}
