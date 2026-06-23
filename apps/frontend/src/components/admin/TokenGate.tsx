import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'

interface TokenGateProps {
  onTokenSet: () => void
}

export function TokenGate({ onTokenSet }: TokenGateProps) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token.trim()) { setError('Token obrigatório'); return }
    localStorage.setItem('admin_token', token.trim())
    onTokenSet()
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-sm border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Acesso Admin</CardTitle>
          <CardDescription>Digite o token para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="token">Token</Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
              {error && <p className="text-destructive text-xs">{error}</p>}
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
