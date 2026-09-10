import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthProvider.tsx'
import { useAuth } from './useAuth.ts'
import { saveSession } from './sessionStorage.ts'
import * as authService from '../services/authService.ts'
import { resetRefreshState } from './refreshSession.ts'

vi.mock('../services/authService.ts', () => ({
  AuthServiceError: class AuthServiceError extends Error {
    status: number

    constructor(message: string, status: number) {
      super(message)
      this.name = 'AuthServiceError'
      this.status = status
    }
  },
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
}))

function AuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Carregando sessão</div>
  }

  return (
    <div>
      <span>{isAuthenticated ? 'autenticado' : 'deslogado'}</span>
      <span>{user?.email ?? 'sem-usuario'}</span>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRefreshState()
    localStorage.clear()
  })

  it('valida sessão persistida com /auth/me', async () => {
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

    vi.mocked(authService.getMe).mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      createdAt: '2026-03-09T17:00:00.000Z',
    })

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('autenticado')).toBeInTheDocument()
    })

    expect(authService.getMe).toHaveBeenCalledWith('access-token')
  })

  it('renova sessão quando /auth/me retorna 401', async () => {
    saveSession({
      accessToken: 'expired-access',
      refreshToken: 'refresh-token',
      expiresIn: '15m',
      user: {
        id: '1',
        email: 'user@example.com',
        createdAt: '2026-03-09T17:00:00.000Z',
      },
    })

    vi.mocked(authService.getMe).mockRejectedValue(
      new authService.AuthServiceError('Token expirado', 401),
    )
    vi.mocked(authService.refresh).mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresIn: '15m',
      user: {
        id: '1',
        email: 'user@example.com',
        createdAt: '2026-03-09T17:00:00.000Z',
      },
    })

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('autenticado')).toBeInTheDocument()
    })

    expect(authService.refresh).toHaveBeenCalledWith('refresh-token')
    expect(localStorage.getItem('plaquinha_session')).toContain('new-refresh-token')
  })

  it('limpa sessão quando refresh falha', async () => {
    saveSession({
      accessToken: 'expired-access',
      refreshToken: 'refresh-token',
      expiresIn: '15m',
      user: {
        id: '1',
        email: 'user@example.com',
        createdAt: '2026-03-09T17:00:00.000Z',
      },
    })

    vi.mocked(authService.getMe).mockRejectedValue(
      new authService.AuthServiceError('Token expirado', 401),
    )
    vi.mocked(authService.refresh).mockRejectedValue(
      new authService.AuthServiceError('Refresh inválido', 401),
    )

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('deslogado')).toBeInTheDocument()
    })

    expect(localStorage.getItem('plaquinha_session')).toBeNull()
  })
})
