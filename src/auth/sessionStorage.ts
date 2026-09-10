import type { AuthSession } from '../types/auth.ts'

const SESSION_KEY = 'plaquinha_session'

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as Partial<AuthSession>
  return (
    typeof session.accessToken === 'string' &&
    typeof session.refreshToken === 'string' &&
    typeof session.user === 'object' &&
    session.user !== null &&
    typeof session.user.id === 'string' &&
    typeof session.user.email === 'string'
  )
}

export function loadSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!isValidSession(parsed)) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      expiresIn: parsed.expiresIn ?? '15m',
      user: {
        id: parsed.user.id,
        email: parsed.user.email,
        createdAt: parsed.user.createdAt ?? new Date(0).toISOString(),
      },
    }
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}
