import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getAnalyticsMetrics,
  getAnalyticsSummary,
  getQrCodeAnalytics,
  listQrCodeScans,
} from './analyticsService.ts'

vi.mock('./apiClient.ts', () => ({
  apiRequest: vi.fn(),
}))

import { apiRequest } from './apiClient.ts'

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('busca resumo geral sem filtro', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      totalScans: 10,
      qrCodes: [],
    })

    const result = await getAnalyticsSummary()

    expect(apiRequest).toHaveBeenCalledWith('/analytics/summary')
    expect(result.totalScans).toBe(10)
  })

  it('busca resumo geral com filtro de datas', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      totalScans: 5,
      qrCodes: [],
    })

    await getAnalyticsSummary('2026-09-01T00:00:00.000Z', '2026-09-30T23:59:59.999Z')

    expect(apiRequest).toHaveBeenCalledWith(
      '/analytics/summary?from=2026-09-01T00%3A00%3A00.000Z&to=2026-09-30T23%3A59%3A59.999Z',
    )
  })

  it('busca métricas agregadas com QR Code e filtro', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      totalScans: 10,
      byDevice: { mobile: 10 },
      byBrowser: { Safari: 10 },
      byOperatingSystem: { iOS: 10 },
      timeline: [{ date: '2026-09-09', totalScans: 10 }],
    })

    await getAnalyticsMetrics(
      '2026-09-01T00:00:00.000Z',
      '2026-09-30T23:59:59.999Z',
      'qr-1',
    )

    expect(apiRequest).toHaveBeenCalledWith(
      '/analytics/metrics?from=2026-09-01T00%3A00%3A00.000Z&to=2026-09-30T23%3A59%3A59.999Z&qrCodeId=qr-1',
    )
  })

  it('busca analytics de um QR Code', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      qrCodeId: 'qr-1',
      name: 'Cardápio',
      totalScans: 3,
    })

    const result = await getQrCodeAnalytics('qr-1')

    expect(apiRequest).toHaveBeenCalledWith('/analytics/qr-codes/qr-1')
    expect(result.name).toBe('Cardápio')
  })

  it('lista scans paginados', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      items: [],
      page: 2,
      limit: 20,
      total: 40,
      totalPages: 2,
    })

    await listQrCodeScans('qr-1', {
      page: 2,
      limit: 20,
    })

    expect(apiRequest).toHaveBeenCalledWith(
      '/analytics/qr-codes/qr-1/scans?page=2&limit=20',
    )
  })
})
