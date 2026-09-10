import * as authService from '../services/authService.ts'
import type { AuthSession } from '../types/auth.ts'

let ongoingRefresh: Promise<AuthSession | null> | null = null

type RefreshDependencies = {
  getCurrentSession: () => AuthSession | null
  applySession: (session: AuthSession | null) => void
}

export async function rotateRefreshToken({
  getCurrentSession,
  applySession,
}: RefreshDependencies): Promise<string | null> {
  if (ongoingRefresh) {
    const result = await ongoingRefresh
    return result?.accessToken ?? null
  }

  ongoingRefresh = (async () => {
    const currentSession = getCurrentSession()
    if (!currentSession?.refreshToken) {
      applySession(null)
      return null
    }

    try {
      const refreshed = await authService.refresh(currentSession.refreshToken)
      applySession(refreshed)
      return refreshed
    } catch {
      applySession(null)
      return null
    }
  })()

  try {
    const result = await ongoingRefresh
    return result?.accessToken ?? null
  } finally {
    ongoingRefresh = null
  }
}

export function resetRefreshState(): void {
  ongoingRefresh = null
}
