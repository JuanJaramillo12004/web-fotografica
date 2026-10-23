import { Badge } from '@/components/ui/badge'
import {
  GALLERY_STATUS_CLASS,
  GALLERY_STATUS_LABEL,
} from '@/lib/galleryPresentation'
import type { GalleryStatus } from '@/lib/galleries'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: GalleryStatus
  className?: string
}

/** Estado de una galería con la misma etiqueta y color en toda la app. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('border-transparent', GALLERY_STATUS_CLASS[status], className)}
    >
      {GALLERY_STATUS_LABEL[status]}
    </Badge>
  )
}
