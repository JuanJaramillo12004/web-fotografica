import { Link } from 'react-router'

export function ForbiddenPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm text-zinc-500">Error 403</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">No tienes acceso a esta sección</h1>
      <p className="mt-3 text-sm text-zinc-600">
        Tu cuenta está autenticada, pero no tiene el rol necesario para ver este contenido.
      </p>
      <Link
        to="/"
        className="mt-8 w-fit rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
