function App() {
  return (
    <div className="min-h-dvh bg-white text-zinc-950">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center px-6">
          <a href="/" className="text-sm font-medium tracking-tight">
            Web fotográfica
          </a>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl items-center px-6 py-16">
        <div>
          <p className="text-sm text-zinc-500">Página de inicio</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-medium tracking-tight sm:text-6xl">
            Tu próxima página empieza aquí.
          </h1>
        </div>
      </main>
    </div>
  )
}

export default App
