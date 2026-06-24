import { createRootRoute, Outlet, Link } from '@tanstack/react-router'

export const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-base tracking-tight text-foreground hover:text-foreground/80 transition-colors">
            cEDh-POX
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">
        <Outlet />
      </main>
      <footer className="border-t border-border/40 mt-auto">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center">
          <p className="text-xs text-muted-foreground">Feito para a comunidade cEDH-POX</p>
        </div>
      </footer>
    </div>
  ),
})
