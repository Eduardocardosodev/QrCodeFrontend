import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthProvider.tsx'
import { ProtectedRoute } from './ProtectedRoute.tsx'
import { saveSession } from './sessionStorage.ts'
import * as authService from '../services/authService.ts'
import { resetRefreshState } from './refreshSession.ts'

vi.mock('../services/authService.ts', () => ({
  AuthServiceError: class AuthServiceError extends Error {
    status: number

    constructor(message: string, status = 400) {
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

function renderProtectedRoute(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Página de login</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Área protegida</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRefreshState()
    localStorage.clear()
  })

  it('redireciona para login sem sessão', async () => {
    renderProtectedRoute()

    expect(await screen.findByText('Página de login')).toBeInTheDocument()
  })

  it('permite acesso com sessão válida', async () => {
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

    renderProtectedRoute()

    expect(await screen.findByText('Área protegida')).toBeInTheDocument()
  })
})
