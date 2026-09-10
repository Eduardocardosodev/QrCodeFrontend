import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useQrCodeDetails } from './useQrCodeDetails.ts'
import * as analyticsService from '../services/analyticsService.ts'
import * as qrCodeService from '../services/qrCodeService.ts'

vi.mock('../services/qrCodeService.ts', () => ({
  listQrCodes: vi.fn(),
  updateQrCode: vi.fn(),
  deleteQrCode: vi.fn(),
}))

vi.mock('../services/analyticsService.ts', () => ({
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

describe('useQrCodeDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue({
      items: [mockQrCode],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    })
    vi.mocked(analyticsService.getAnalyticsMetrics).mockResolvedValue({
      totalScans: 820,
      byDevice: { mobile: 500 },
      byBrowser: { Safari: 400 },
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

  it('carrega QR Code e métricas', async () => {
    const { result } = renderHook(() => useQrCodeDetails('1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.qrCode?.name).toBe('Cardápio')
    expect(result.current.metrics?.totalScans).toBe(820)
  })

  it('atualiza destination URL', async () => {
    vi.mocked(qrCodeService.updateQrCode).mockResolvedValue({
      ...mockQrCode,
      destinationUrl: 'https://example.com/novo',
    })

    const { result } = renderHook(() => useQrCodeDetails('1'))

    await waitFor(() => {
      expect(result.current.qrCode?.name).toBe('Cardápio')
    })

    await act(async () => {
      await result.current.updateDestinationUrl({
        destinationUrl: 'https://example.com/novo',
      })
    })

    expect(result.current.qrCode?.destinationUrl).toBe('https://example.com/novo')
  })
})
