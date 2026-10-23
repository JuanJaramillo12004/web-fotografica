import { Link } from 'react-router'
import { MessagePage } from '@/components/common/MessagePage'
import { Button } from '@/components/ui/button'

export function ForbiddenPage() {
  return (
    <MessagePage
      eyebrow="Error 403"
      title="No tienes acceso a esta sección"
      description="Tu cuenta está autenticada, pero no tiene el rol necesario para ver este contenido."
      action={
        <Button asChild variant="outline">
          <Link to="/">Volver al inicio</Link>
        </Button>
      }
    />
  )
}
