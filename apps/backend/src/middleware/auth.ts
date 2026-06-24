import { createMiddleware } from 'hono/factory'
import type { Env } from '../index'

let keyCache: { keys: (JsonWebKey & { kid: string })[]; at: number } | null = null

function b64url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

function parseB64url(str: string): unknown {
  return JSON.parse(new TextDecoder().decode(b64url(str)))
}

async function getKeys(teamDomain: string): Promise<(JsonWebKey & { kid: string })[]> {
  const now = Date.now()
  if (keyCache && now - keyCache.at < 3_600_000) return keyCache.keys
  const res = await fetch(`https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/certs`)
  if (!res.ok) throw new Error('Failed to fetch CF Access certs')
  const { keys } = await res.json<{ keys: (JsonWebKey & { kid: string })[] }>()
  keyCache = { keys, at: now }
  return keys
}

async function verifyJWT(token: string, teamDomain: string, aud: string): Promise<boolean> {
  try {
    const [rawHeader, rawPayload, rawSig] = token.split('.')
    const header = parseB64url(rawHeader) as { kid: string; alg: string }
    const payload = parseB64url(rawPayload) as { exp: number; aud: string | string[] }

    if (payload.exp < Math.floor(Date.now() / 1000)) return false
    const audList = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
    if (!audList.includes(aud)) return false

    const keys = await getKeys(teamDomain)
    const jwk = keys.find(k => k.kid === header.kid)
    if (!jwk) return false

    const key = await crypto.subtle.importKey(
      'jwk', jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false, ['verify'],
    )

    return crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5', key,
      b64url(rawSig),
      new TextEncoder().encode(`${rawHeader}.${rawPayload}`),
    )
  } catch {
    return false
  }
}

export const adminAuth = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  // Local dev: CF_ACCESS_AUD not set → skip auth
  if (!c.env.CF_ACCESS_AUD) {
    await next()
    return
  }

  const token = c.req.header('Cf-Access-Jwt-Assertion')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  const ok = await verifyJWT(token, c.env.CF_ACCESS_TEAM_DOMAIN, c.env.CF_ACCESS_AUD)
  if (!ok) return c.json({ error: 'Unauthorized' }, 401)

  await next()
})
