import { useCallback, useEffect, useMemo, useState } from 'react'
import * as analyticsService from '../services/analyticsService.ts'
import * as qrCodeService from '../services/qrCodeService.ts'
import { ApiClientError } from '../services/apiClient.ts'
import type { AnalyticsMetrics, PaginatedScanEvents } from '../types/analytics.ts'
import type { QrCode } from '../types/qrCode.ts'
import {
  getDateRangeForPreset,
  resolveAnalyticsDateRange,
  type AnalyticsDateRange,
  type DateRangePreset,
} from '../utils/analyticsDateRange.ts'

const DEFAULT_LIMIT = 20

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 403) {
      return 'QR Code pertence a outro usuário.'
    }
    if (error.status === 404) {
      return 'QR Code não encontrado.'
    }
    return error.message
  }

  return 'Não foi possível carregar os dados do QR Code.'
}

export function useQrCodeDetails(qrCodeId: string | undefined) {
  const [qrCode, setQrCode] = useState<QrCode | null>(null)
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [scans, setScans] = useState<PaginatedScanEvents | null>(null)
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({
    preset: 'last30days',
    ...getDateRangeForPreset('last30days'),
  })
  const [page, setPage] = useState(1)
  const [limit] = useState(DEFAULT_LIMIT)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  const resolvedRange = useMemo(
    () => resolveAnalyticsDateRange(dateRange),
    [dateRange],
  )

  const loadQrCode = useCallback(async () => {
    if (!qrCodeId) {
      setQrCode(null)
      setError('QR Code não encontrado.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const items = await qrCodeService.listQrCodes()
      const found = items.find((item) => item.id === qrCodeId) ?? null
      setQrCode(found)

      if (!found) {
        setError('QR Code não encontrado.')
      }
    } catch (err) {
      setQrCode(null)
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [qrCodeId])

  const loadAnalytics = useCallback(async () => {
    if (!qrCodeId || !qrCode) {
      setMetrics(null)
      setScans(null)
      setIsAnalyticsLoading(false)
      return
    }

    setIsAnalyticsLoading(true)
    setAnalyticsError(null)

    try {
      const [metricsData, scansData] = await Promise.all([
        analyticsService.getAnalyticsMetrics(
          resolvedRange.from,
          resolvedRange.to,
          qrCodeId,
        ),
        analyticsService.listQrCodeScans(qrCodeId, {
          page,
          limit,
        }),
      ])

      setMetrics(metricsData)
      setScans(scansData)
    } catch (err) {
      setMetrics(null)
      setScans(null)
      setAnalyticsError(getErrorMessage(err))
    } finally {
      setIsAnalyticsLoading(false)
    }
  }, [qrCodeId, qrCode, resolvedRange.from, resolvedRange.to, page, limit])

  useEffect(() => {
    void loadQrCode()
  }, [loadQrCode])

  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  const setPreset = useCallback((preset: DateRangePreset) => {
    const nextRange = getDateRangeForPreset(preset)
    setDateRange({ preset, ...nextRange })
    setPage(1)
  }, [])

  const setCustomRange = useCallback((from: Date, to: Date) => {
    const nextRange = getDateRangeForPreset('custom', new Date(), { from, to })
    setDateRange({ preset: 'custom', ...nextRange })
    setPage(1)
  }, [])

  const goToPage = useCallback((nextPage: number) => {
    setPage(nextPage)
  }, [])

  const updateDestinationUrl = useCallback(async (destinationUrl: string) => {
    if (!qrCode) {
      return null
    }

    const updated = await qrCodeService.updateQrCode(qrCode.id, { destinationUrl })
    setQrCode(updated)
    return updated
  }, [qrCode])

  const removeQrCode = useCallback(async () => {
    if (!qrCode) {
      return
    }

    await qrCodeService.deleteQrCode(qrCode.id)
  }, [qrCode])

  const reload = useCallback(async () => {
    await Promise.all([loadQrCode(), loadAnalytics()])
  }, [loadQrCode, loadAnalytics])

  return {
    qrCode,
    metrics,
    scans,
    dateRange,
    page,
    limit,
    isLoading,
    isAnalyticsLoading,
    error,
    analyticsError,
    setPreset,
    setCustomRange,
    goToPage,
    updateDestinationUrl,
    removeQrCode,
    reload,
  }
}
