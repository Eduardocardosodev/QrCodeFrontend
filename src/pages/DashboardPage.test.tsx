import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from './DashboardPage.tsx'
import { renderWithProviders } from '../test/testUtils.tsx'
import { saveSession } from '../auth/sessionStorage.ts'
import * as authService from '../services/authService.ts'
import * as analyticsService from '../services/analyticsService.ts'
import * as qrCodeService from '../services/qrCodeService.ts'
import * as qrCodeDownloadService from '../services/qrCodeDownloadService.ts'

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
  listAllQrCodes: vi.fn(),
  listFolders: vi.fn(),
  createQrCode: vi.fn(),
  createQrCodesBatch: vi.fn(),
}))

vi.mock('../services/qrCodeDownloadService.ts', () => ({
  downloadQrCodesZip: vi.fn(),
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

const paginatedQrCodes = {
  items: mockQrCodes,
  page: 1,
  limit: 20,
  total: 2,
  totalPages: 1,
}

const mockFolders = [
  {
    id: 'folder-1',
    name: 'Clientes',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    qrCodeCount: 0,
  },
  {
    id: 'folder-2',
    name: 'Marketing',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    qrCodeCount: 0,
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
    vi.mocked(qrCodeService.listFolders).mockResolvedValue(mockFolders)
    vi.mocked(qrCodeService.listAllQrCodes).mockResolvedValue(mockQrCodes)
  })

  it('exibe somente os cards de QR Code após carregar', async () => {
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue(paginatedQrCodes)

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    expect(await screen.findByText('Cardápio')).toBeInTheDocument()
    expect(screen.getByText('Promoção')).toBeInTheDocument()
    expect(screen.getByText('820')).toBeInTheDocument()
    expect(screen.queryByText('Scans por dia')).not.toBeInTheDocument()
    expect(screen.queryByText('Filtrados')).not.toBeInTheDocument()
  })

  it('filtra por pasta e permite voltar para todos', async () => {
    const user = userEvent.setup()
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue(paginatedQrCodes)

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    await screen.findByText('Cardápio')
    await user.click(screen.getByRole('tab', { name: 'Marketing' }))

    expect(screen.getByText('Promoção')).toBeInTheDocument()
    expect(screen.queryByText('Cardápio')).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('tab', { name: 'Todos' })[1])
    expect(screen.getByText('Cardápio')).toBeInTheDocument()
  })

  it('filtra QR Codes por uso', async () => {
    const user = userEvent.setup()
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    })

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Em uso' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('tab', { name: 'Em uso' }))

    await waitFor(() => {
      expect(qrCodeService.listQrCodes).toHaveBeenLastCalledWith({
        page: 1,
        limit: 20,
        isInUse: true,
      })
    })
  })

  it('busca QR Codes por nome ou slug', async () => {
    const user = userEvent.setup()
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue(paginatedQrCodes)

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    await screen.findByText('Cardápio')
    const search = screen.getByRole('searchbox', { name: 'Buscar QR Code' })

    await user.type(search, 'def45uvw')
    expect(screen.getByText('Promoção')).toBeInTheDocument()
    expect(screen.queryByText('Cardápio')).not.toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'cardápio')
    expect(screen.getByText('Cardápio')).toBeInTheDocument()
    expect(screen.queryByText('Promoção')).not.toBeInTheDocument()
  })

  it('troca de página e recarrega os QR Codes', async () => {
    const user = userEvent.setup()
    vi.mocked(qrCodeService.listQrCodes)
      .mockResolvedValueOnce({
        items: [mockQrCodes[0]],
        page: 1,
        limit: 20,
        total: 21,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        items: [mockQrCodes[1]],
        page: 2,
        limit: 20,
        total: 21,
        totalPages: 2,
      })

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    expect(await screen.findByText('Cardápio')).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 2 · 21 itens')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Próxima página' }))

    await waitFor(() => {
      expect(qrCodeService.listQrCodes).toHaveBeenLastCalledWith({
        page: 2,
        limit: 20,
      })
    })
    expect(await screen.findByText('Promoção')).toBeInTheDocument()
    expect(screen.queryByText('Cardápio')).not.toBeInTheDocument()
  })

  it('cria QR Code pelo modal', async () => {
    const user = userEvent.setup()
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    })
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
        address: '',
        color: '#000000',
      })
    })
  })

  it('cria QR Codes em lote pelo modal', async () => {
    const user = userEvent.setup()
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    })
    vi.mocked(qrCodeService.createQrCodesBatch).mockResolvedValue({
      count: 2,
      items: [
        { ...mockQrCodes[0], id: 'batch-1', name: 'Cliente 1' },
        { ...mockQrCodes[0], id: 'batch-2', name: 'Cliente 2' },
      ],
    })

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    await user.click(await screen.findByRole('button', { name: 'Criar primeiro QR Code' }))
    await user.click(screen.getByRole('tab', { name: 'Em lote' }))
    await user.type(screen.getByLabelText('Prefixo'), 'Cliente')
    await user.clear(screen.getByLabelText('Quantidade'))
    await user.type(screen.getByLabelText('Quantidade'), '2')
    await user.selectOptions(screen.getByLabelText('Pasta'), 'folder-1')
    await user.type(screen.getByLabelText('URL de destino'), 'https://example.com/padrao')
    await user.click(screen.getByRole('button', { name: 'Criar em lote' }))

    await waitFor(() => {
      expect(qrCodeService.createQrCodesBatch).toHaveBeenCalledWith({
        prefix: 'Cliente',
        quantity: 2,
        destinationUrl: 'https://example.com/padrao',
        folderId: 'folder-1',
        address: '',
        color: '#000000',
      })
    })
  })

  it('permite selecionar QR Codes e baixar ZIP', async () => {
    const user = userEvent.setup()
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue(paginatedQrCodes)

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    await screen.findByText('Cardápio')
    await user.click(screen.getByRole('checkbox', { name: 'Selecionar Cardápio para download' }))
    await user.click(screen.getByRole('button', { name: 'Baixar ZIP PNG' }))

    await waitFor(() => {
      expect(qrCodeDownloadService.downloadQrCodesZip).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            fileName: 'Cardápio',
            slug: 'abc12xyz',
          }),
        ]),
        'png',
        'qr-codes-png.zip',
      )
    })
  })

  it('seleciona todos os QR Codes filtrados', async () => {
    const user = userEvent.setup()
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue(paginatedQrCodes)

    renderWithProviders(<DashboardPage />, { initialEntries: ['/dashboard'] })

    await screen.findByText('Cardápio')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Selecionar filtrados' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Selecionar filtrados' }))

    await waitFor(() => {
      expect(qrCodeService.listAllQrCodes).toHaveBeenCalled()
      expect(screen.getByText(/2 selecionado\(s\)/)).toBeInTheDocument()
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
