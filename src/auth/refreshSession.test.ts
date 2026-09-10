import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetRefreshState, rotateRefreshToken } from './refreshSession.ts'
import * as authService from '../services/authService.ts'
import type { AuthSession } from '../types/auth.ts'

vi.mock('../services/authService.ts', () => ({
  refresh: vi.fn(),
}))

const baseSession: AuthSession = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: '15m',
  user: {
    id: '1',
    email: 'user@example.com',
    createdAt: '2026-03-09T17:00:00.000Z',
  },
}

describe('rotateRefreshToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRefreshState()
  })

  it('deduplica chamadas concorrentes de refresh', async () => {
    vi.mocked(authService.refresh).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ...baseSession,
              accessToken: 'new-access-token',
              refreshToken: 'new-refresh-token',
            })
          }, 20)
        }),
    )

    let currentSession: AuthSession | null = baseSession
    const applySession = vi.fn((session: AuthSession | null) => {
      currentSession = session
    })

    const [first, second] = await Promise.all([
      rotateRefreshToken({
        getCurrentSession: () => currentSession,
        applySession,
      }),
      rotateRefreshToken({
        getCurrentSession: () => currentSession,
        applySession,
      }),
    ])

    expect(first).toBe('new-access-token')
    expect(second).toBe('new-access-token')
    expect(authService.refresh).toHaveBeenCalledTimes(1)
    expect(applySession).toHaveBeenCalledWith({
      ...baseSession,
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    })
  })
})
