import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAnalytics } from './useAnalytics.ts'
import * as analyticsService from '../services/analyticsService.ts'
import { ApiClientError } from '../services/apiClient.ts'

vi.mock('../services/analyticsService.ts', () => ({
  getAnalyticsSummary: vi.fn(),
  getAnalyticsMetrics: vi.fn(),
  getQrCodeAnalytics: vi.fn(),
  listQrCodeScans: vi.fn(),
}))

const mockSummary = {
  totalScans: 1250,
  qrCodes: [
    { qrCodeId: '1', name: 'Cardápio', totalScans: 820 },
    { qrCodeId: '2', name: 'Promoção', totalScans: 430 },
  ],
}

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(analyticsService.getAnalyticsSummary).mockResolvedValue(mockSummary)
    vi.mocked(analyticsService.getAnalyticsMetrics).mockResolvedValue({
      totalScans: 1250,
      byDevice: { mobile: 800, desktop: 350, tablet: 80, unknown: 20 },
      byBrowser: { Safari: 500, Chrome: 600 },
      byOperatingSystem: { iOS: 480, Android: 320 },
      byCountry: { Brasil: 900 },
      byState: { SP: 500 },
      byCity: { 'São Paulo': 350 },
      timeline: [{ date: '2026-09-09', totalScans: 125 }],
    })
    vi.mocked(analyticsService.getQrCodeAnalytics).mockResolvedValue({
      qrCodeId: '1',
      name: 'Cardápio',
      totalScans: 820,
    })
    vi.mocked(analyticsService.listQrCodeScans).mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    })
  })

  it('carrega resumo e expõe mapa de scans', async () => {
    const { result } = renderHook(() => useAnalytics())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.summary?.totalScans).toBe(1250)
    expect(result.current.getScanCount('1')).toBe(820)
    expect(result.current.getScanCount('missing')).toBe(0)
  })

  it('recarrega resumo ao mudar preset', async () => {
    const { result } = renderHook(() => useAnalytics())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      result.current.setPreset('today')
    })

    await waitFor(() => {
      expect(analyticsService.getAnalyticsSummary).toHaveBeenCalledTimes(2)
    })
  })

  it('carrega detalhes ao abrir analytics de um QR Code', async () => {
    const { result } = renderHook(() => useAnalytics())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      result.current.openQrCodeAnalytics('1')
    })

    await waitFor(() => {
      expect(result.current.detail?.name).toBe('Cardápio')
    })

    expect(analyticsService.getQrCodeAnalytics).toHaveBeenCalledWith(
      '1',
      expect.any(String),
      expect.any(String),
    )
    expect(analyticsService.listQrCodeScans).toHaveBeenCalled()
  })

  it('expõe erro quando resumo falha', async () => {
    vi.mocked(analyticsService.getAnalyticsSummary).mockRejectedValue(
      new ApiClientError('Falha ao carregar analytics', 500),
    )

    const { result } = renderHook(() => useAnalytics())

    await waitFor(() => {
      expect(result.current.error).toBe('Falha ao carregar analytics')
    })
  })
})
