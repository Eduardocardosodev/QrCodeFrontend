import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage.tsx'
import { renderWithProviders } from '../test/testUtils.tsx'
import * as authService from '../services/authService.ts'

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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('mostra erros de validação quando o formulário está vazio', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] })

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
    expect(authService.login).not.toHaveBeenCalled()
  })

  it('envia login com credenciais válidas', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: '15m',
      user: {
        id: '1',
        email: 'user@example.com',
        createdAt: '2026-03-09T17:00:00.000Z',
      },
    })

    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      })
    })
  })

  it('normaliza email antes de enviar login', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: '15m',
      user: {
        id: '1',
        email: 'usuario@example.com',
        createdAt: '2026-03-09T17:00:00.000Z',
      },
    })

    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText('E-mail'), 'Usuario@Example.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'usuario@example.com',
        password: 'password123',
      })
    })
  })

  it('mostra erro retornado pela API', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockRejectedValue(
      new authService.AuthServiceError('Credenciais inválidas', 401),
    )

    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciais inválidas')
    })
  })
})
