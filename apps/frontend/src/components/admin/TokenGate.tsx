import { useState } from 'react'

interface TokenGateProps {
  onTokenSet: () => void
}

export function TokenGate({ onTokenSet }: TokenGateProps) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token.trim()) { setError('Token is required'); return }
    localStorage.setItem('admin_token', token.trim())
    onTokenSet()
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Admin Access</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Admin Token</label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              placeholder="Enter admin token"
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white rounded px-4 py-2 text-sm font-medium transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
