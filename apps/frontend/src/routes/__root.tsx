import { createRootRoute, Outlet, Link } from '@tanstack/react-router'

export const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight text-white hover:text-zinc-300">
          cEDh-POX
        </Link>
        <Link to="/admin" className="text-sm text-zinc-500 hover:text-zinc-300">
          Admin
        </Link>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  ),
})
