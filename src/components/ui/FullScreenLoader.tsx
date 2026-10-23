interface FullScreenLoaderProps {
  label?: string
}

export function FullScreenLoader({ label = 'Cargando…' }: FullScreenLoaderProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
