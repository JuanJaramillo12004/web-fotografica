import { PageHeader } from '@/components/common/PageHeader'
import { useAuth } from '../../hooks/useAuth'

export function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={`Hola, ${user?.name ?? 'de nuevo'}`}
        description="Gestiona las galerías, las fotos y los usuarios desde el panel."
      />
    </section>
  )
}
