import { Link } from 'react-router'
import { MessagePage } from '@/components/common/MessagePage'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <MessagePage
      eyebrow="Error 404"
      title="Esta página no existe"
      description="Puede que el enlace esté roto o que la galería haya dejado de estar disponible."
      action={
        <Button asChild variant="outline">
          <Link to="/">Volver al inicio</Link>
        </Button>
      }
    />
  )
}
