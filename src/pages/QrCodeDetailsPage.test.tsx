import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QrCodeDetailsPage } from './QrCodeDetailsPage.tsx'
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
  updateQrCode: vi.fn(),
  deleteQrCode: vi.fn(),
}))

vi.mock('../services/analyticsService.ts', () => ({
  getAnalyticsMetrics: vi.fn(),
  listQrCodeScans: vi.fn(),
}))

vi.mock('../utils/qrCodeImage.ts', () => ({
  buildQrCodeImageUrl: vi.fn(() => 'https://qr-image.example/test'),
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

function renderDetailsPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/dashboard/qr-codes/:id" element={<QrCodeDetailsPage />} />
    </Routes>,
    { initialEntries: ['/dashboard/qr-codes/1'] },
  )
}

describe('QrCodeDetailsPage', () => {
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
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue({
      items: [mockQrCode],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    })
    vi.mocked(analyticsService.getAnalyticsMetrics).mockResolvedValue({
      totalScans: 820,
      byDevice: { mobile: 500, desktop: 320 },
      byBrowser: { Safari: 400, Chrome: 420 },
      byOperatingSystem: { iOS: 400, Android: 420 },
      byCountry: { Brasil: 700 },
      byState: { SP: 500 },
      byCity: { 'São Paulo': 350 },
      timeline: [{ date: '2026-09-09', totalScans: 820 }],
    })
    vi.mocked(analyticsService.listQrCodeScans).mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    })
  })

  it('exibe analytics e formulário do QR Code', async () => {
    renderDetailsPage()

    expect(await screen.findByRole('heading', { name: 'Cardápio' })).toBeInTheDocument()
    expect(await screen.findByText('Scans por dia')).toBeInTheDocument()
    expect(screen.getByText('Países')).toBeInTheDocument()
    expect(screen.getByLabelText('URL de destino')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).not.toHaveAttribute('readonly')
    expect(screen.getByLabelText('Pasta')).toHaveAttribute('readonly')
  })

  it('salva destination URL', async () => {
    const user = userEvent.setup()
    vi.mocked(qrCodeService.updateQrCode).mockResolvedValue({
      ...mockQrCode,
      destinationUrl: 'https://example.com/novo',
    })

    renderDetailsPage()

    await screen.findByRole('heading', { name: 'Cardápio' })
    const destinationInput = screen.getByLabelText('URL de destino')
    await user.clear(destinationInput)
    await user.type(destinationInput, 'https://example.com/novo')
    await user.click(screen.getByRole('button', { name: 'Salvar destino' }))

    await waitFor(() => {
      expect(qrCodeService.updateQrCode).toHaveBeenCalledWith('1', {
        name: 'Cardápio',
        destinationUrl: 'https://example.com/novo',
        address: '',
      })
    })
  })
})
