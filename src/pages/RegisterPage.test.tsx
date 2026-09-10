import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterPage } from './RegisterPage.tsx'
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

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('exige confirmação de senha igual', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />, { initialEntries: ['/cadastro'] })

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar senha'), 'different')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument()
    expect(authService.register).not.toHaveBeenCalled()
  })

  it('mostra erro de email já cadastrado', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.register).mockRejectedValue(
      new authService.AuthServiceError('Email já cadastrado', 409),
    )

    renderWithProviders(<RegisterPage />, { initialEntries: ['/cadastro'] })

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email já cadastrado')
    })
  })

  it('cria conta com dados válidos', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.register).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: '15m',
      user: {
        id: '1',
        email: 'user@example.com',
        createdAt: '2026-03-09T17:00:00.000Z',
      },
    })

    renderWithProviders(<RegisterPage />, { initialEntries: ['/cadastro'] })

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      })
    })
  })
})
