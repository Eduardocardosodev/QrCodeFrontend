import { beforeEach, describe, expect, it } from 'vitest'
import { clearSession, loadSession, saveSession } from './sessionStorage.ts'

describe('sessionStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persiste sessão com expiresIn e createdAt', () => {
    saveSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: '15m',
      user: {
        id: '1',
        email: 'user@example.com',
        createdAt: '2026-03-09T17:00:00.000Z',
      },
    })

    expect(loadSession()).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: '15m',
      user: {
        id: '1',
        email: 'user@example.com',
        createdAt: '2026-03-09T17:00:00.000Z',
      },
    })
  })

  it('normaliza sessões antigas sem createdAt', () => {
    localStorage.setItem(
      'plaquinha_session',
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: '1',
          email: 'user@example.com',
        },
      }),
    )

    const session = loadSession()
    expect(session?.expiresIn).toBe('15m')
    expect(session?.user.createdAt).toBeTruthy()
  })

  it('remove sessões inválidas', () => {
    localStorage.setItem('plaquinha_session', '{"invalid":true}')
    expect(loadSession()).toBeNull()
    expect(localStorage.getItem('plaquinha_session')).toBeNull()
  })

  it('limpa sessão no logout local', () => {
    saveSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: '15m',
      user: {
        id: '1',
        email: 'user@example.com',
        createdAt: '2026-03-09T17:00:00.000Z',
      },
    })

    clearSession()
    expect(loadSession()).toBeNull()
  })
})
