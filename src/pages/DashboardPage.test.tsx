import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from './DashboardPage.tsx'
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
}))

vi.mock('../services/analyticsService.ts', () => ({
  getAnalyticsSummary: vi.fn(),
  getAnalyticsMetrics: vi.fn(),
}))

const mockQrCodes = [
  {
    id: '1',
    name: 'Cardápio',
    destinationUrl: 'https://example.com/menu',
    folder: 'Clientes',
    color: '#000000',
    publicUrl: 'http://localhost:3000/redirects/abc12xyz',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Promoção',
    destinationUrl: 'https://example.com/promo',
    folder: 'Marketing',
    color: '#000000',
    publicUrl: 'http://localhost:3000/redirects/def45uvw',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
]

const mockAnalyticsSummary = {
  totalScans: 1250,
  qrCodes: [
    { qrCodeId: '1', name: 'Cardápio', totalScans: 820 },
    { qrCodeId: '2', name: 'Promoção', totalScans: 430 },
  ],
}

const mockMetrics = {
  totalScans: 1250,
  byDevice: { mobile: 800, desktop: 350, tablet: 80, unknown: 20 },
  byBrowser: { Safari: 500, Chrome: 600 },
  byOperatingSystem: { iOS: 480, Android: 320 },
  byCountry: { Brasil: 900 },
  byState: { SP: 500 },
  byCity: { 'São Paulo': 350 },
  timeline: [{ date: '2026-09-09', totalScans: 125 }],
}

describe('DashboardPage', () => {
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
    vi.mocked(analyticsService.getAnalyticsSummary).mockResolvedValue(mockAnalyticsSummary)
    vi.mocked(analyticsService.getAnalyticsMetrics).mockResolvedValue(mockMetrics)
  })

  it('exibe somente os cards de QR Code após carregar', async () => {
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue(mockQrCodes)

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    expect(await screen.findByText('Cardápio')).toBeInTheDocument()
    expect(screen.getByText('Promoção')).toBeInTheDocument()
    expect(screen.getByText('820')).toBeInTheDocument()
    expect(screen.queryByText('Scans por dia')).not.toBeInTheDocument()
    expect(screen.queryByText('Filtrados')).not.toBeInTheDocument()
  })

  it('filtra por pasta e permite voltar para todos', async () => {
    const user = userEvent.setup()
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue(mockQrCodes)

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    await screen.findByText('Cardápio')
    await user.click(screen.getByRole('tab', { name: 'Marketing' }))

    expect(screen.getByText('Promoção')).toBeInTheDocument()
    expect(screen.queryByText('Cardápio')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Todos' }))
    expect(screen.getByText('Cardápio')).toBeInTheDocument()
  })

  it('cria QR Code pelo modal', async () => {
    const user = userEvent.setup()
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue([])
    vi.mocked(qrCodeService.createQrCode).mockResolvedValue(mockQrCodes[0])

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    await user.click(await screen.findByRole('button', { name: 'Criar primeiro QR Code' }))
    await user.type(screen.getByLabelText('Nome'), 'Cardápio')
    await user.type(screen.getByLabelText('Pasta'), 'Clientes')
    await user.type(screen.getByLabelText('URL de destino'), 'https://example.com/menu')
    await user.click(screen.getByRole('button', { name: 'Criar QR Code' }))

    await waitFor(() => {
      expect(qrCodeService.createQrCode).toHaveBeenCalledWith({
        name: 'Cardápio',
        destinationUrl: 'https://example.com/menu',
        folder: 'Clientes',
        color: '#000000',
      })
    })
  })

  it('mostra erro quando a listagem falha', async () => {
    const { ApiClientError } = await import('../services/apiClient.ts')
    vi.mocked(qrCodeService.listQrCodes).mockRejectedValue(
      new ApiClientError('Falha ao carregar', 500),
    )

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar')
  })

})
