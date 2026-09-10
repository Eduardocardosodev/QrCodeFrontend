import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AuthServiceError,
  getMe,
  login,
  logout,
  refresh,
  register,
} from './authService.ts'

const mockSession = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: '15m',
  user: {
    id: '1',
    email: 'user@example.com',
    createdAt: '2026-03-09T17:00:00.000Z',
  },
}

describe('authService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('normaliza email no login', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockSession,
    } as Response)

    await login({
      email: 'Usuario@Example.com',
      password: 'password123',
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'usuario@example.com',
          password: 'password123',
        }),
      }),
    )
  })

  it('busca perfil com Bearer token', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockSession.user,
    } as Response)

    const result = await getMe('access-token')

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/auth/me',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer access-token',
        },
      }),
    )
    expect(result).toEqual(mockSession.user)
  })

  it('renova tokens sem Bearer', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ...mockSession,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
    } as Response)

    const result = await refresh('refresh-token')

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: 'refresh-token' }),
      }),
    )
    expect(result.refreshToken).toBe('new-refresh-token')
  })

  it('faz logout sem Bearer e aceita 204', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 204,
    } as Response)

    await logout('refresh-token')

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/auth/logout',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: 'refresh-token' }),
      }),
    )
  })

  it('expõe status em erros de cadastro', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 409,
      statusText: 'Conflict',
      json: async () => ({ message: 'Email já cadastrado' }),
    } as Response)

    await expect(
      register({ email: 'user@example.com', password: 'password123' }),
    ).rejects.toMatchObject({
      message: 'Email já cadastrado',
      status: 409,
    })

    try {
      await register({ email: 'user@example.com', password: 'password123' })
    } catch (error) {
      expect(error).toBeInstanceOf(AuthServiceError)
      expect((error as AuthServiceError).status).toBe(409)
    }
  })
})
