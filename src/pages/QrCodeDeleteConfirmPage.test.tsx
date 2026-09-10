import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from './DashboardPage.tsx'
import { QrCodeDeleteConfirmPage } from './QrCodeDeleteConfirmPage.tsx'
import { renderWithProviders } from '../test/testUtils.tsx'
import { saveSession } from '../auth/sessionStorage.ts'
import * as authService from '../services/authService.ts'
import * as analyticsService from '../services/analyticsService.ts'
import * as qrCodeService from '../services/qrCodeService.ts'

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

vi.mock('../services/qrCodeService.ts', () => ({
  listQrCodes: vi.fn(),
  createQrCode: vi.fn(),
  deleteQrCode: vi.fn(),
}))

vi.mock('../services/analyticsService.ts', () => ({
  getAnalyticsSummary: vi.fn(),
  getAnalyticsMetrics: vi.fn(),
  listQrCodeScans: vi.fn(),
}))

const mockQrCode = {
  id: '1',
  name: 'Cardápio',
  destinationUrl: 'https://example.com/menu',
  folder: 'Clientes',
  color: '#000000',
  publicUrl: 'http://localhost:3000/redirects/abc12xyz',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function renderDeleteFlow() {
  return renderWithProviders(
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/qr-codes/:id/excluir" element={<QrCodeDeleteConfirmPage />} />
    </Routes>,
    { initialEntries: ['/dashboard/qr-codes/1/excluir'] },
  )
}

describe('QrCodeDeleteConfirmPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
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
    vi.mocked(qrCodeService.listQrCodes)
      .mockResolvedValueOnce({
        items: [mockQrCode],
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      })
      .mockResolvedValue({
        items: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      })
    vi.mocked(qrCodeService.deleteQrCode).mockResolvedValue(undefined)
    vi.mocked(analyticsService.getAnalyticsSummary).mockResolvedValue({
      totalScans: 0,
      qrCodes: [],
    })
    vi.mocked(analyticsService.getAnalyticsMetrics).mockResolvedValue({
      totalScans: 0,
      byDevice: {},
      byBrowser: {},
      byOperatingSystem: {},
      byCountry: {},
      byState: {},
      byCity: {},
      timeline: [],
    })
    vi.mocked(analyticsService.listQrCodeScans).mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    })
  })

  it('confirma exclusão e redireciona para o dashboard', async () => {
    const user = userEvent.setup()
    renderDeleteFlow()

    expect(await screen.findByText('Excluir QR Code')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))

    await waitFor(() => {
      expect(qrCodeService.deleteQrCode).toHaveBeenCalledWith('1')
    })
    expect(await screen.findByText('QR Codes')).toBeInTheDocument()
  })
})
