import type { ReactNode } from 'react'

interface MessagePageProps {
  /** Etiqueta pequeña sobre el título, como «Error 404». */
  eyebrow: string
  title: string
  description: ReactNode
  action?: ReactNode
}

/** Pantallas completas de error o aviso (404, 403…). */
export function MessagePage({
  eyebrow,
  title,
  description,
  action,
}: MessagePageProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      {action !== undefined && <div className="mt-8">{action}</div>}
    </div>
  )
}
