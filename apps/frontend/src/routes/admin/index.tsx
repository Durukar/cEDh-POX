import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { useState } from 'react'
import { TokenGate } from '../../components/admin/TokenGate'
import { AdminDashboard } from '../../components/admin/MatchList'

export const adminIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
})

function AdminPage() {
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem('admin_token'))

  if (!hasToken) return <TokenGate onTokenSet={() => setHasToken(true)} />

  return (
    <AdminDashboard
      onUnauthorized={() => {
        localStorage.removeItem('admin_token')
        setHasToken(false)
      }}
    />
  )
}
