import { useCallback, useEffect, useMemo, useState } from 'react'
import * as analyticsService from '../services/analyticsService.ts'
import { ApiClientError } from '../services/apiClient.ts'
import type {
  AnalyticsMetrics,
  AnalyticsSummary,
  PaginatedScanEvents,
  QrCodeAnalyticsDetail,
} from '../types/analytics.ts'
import {
  getDateRangeForPreset,
  resolveAnalyticsDateRange,
  type AnalyticsDateRange,
  type DateRangePreset,
} from '../utils/analyticsDateRange.ts'

const DEFAULT_LIMIT = 20

function getAnalyticsErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 403) {
      return 'QR Code pertence a outro usuário.'
    }
    if (error.status === 404) {
      return 'QR Code não encontrado.'
    }
    return error.message
  }

  return 'Não foi possível carregar os dados de analytics.'
}

export function useAnalytics() {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({
    preset: 'last30days',
    ...getDateRangeForPreset('last30days'),
  })
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedQrCodeId, setSelectedQrCodeId] = useState<string | null>(null)
  const [detail, setDetail] = useState<QrCodeAnalyticsDetail | null>(null)
  const [detailMetrics, setDetailMetrics] = useState<AnalyticsMetrics | null>(null)
  const [scans, setScans] = useState<PaginatedScanEvents | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(DEFAULT_LIMIT)

  const resolvedRange = useMemo(
    () => resolveAnalyticsDateRange(dateRange),
    [dateRange],
  )

  const scansByQrCodeId = useMemo(() => {
    const map = new Map<string, number>()
    summary?.qrCodes.forEach((item) => {
      map.set(item.qrCodeId, item.totalScans)
    })
    return map
  }, [summary])

  const getScanCount = useCallback(
    (qrCodeId: string) => scansByQrCodeId.get(qrCodeId) ?? 0,
    [scansByQrCodeId],
  )

  const loadSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [summaryData, metricsData] = await Promise.all([
        analyticsService.getAnalyticsSummary(
          resolvedRange.from,
          resolvedRange.to,
        ),
        analyticsService.getAnalyticsMetrics(
          resolvedRange.from,
          resolvedRange.to,
        ),
      ])
      setSummary(summaryData)
      setMetrics(metricsData)
    } catch (err) {
      setSummary(null)
      setMetrics(null)
      setError(getAnalyticsErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [resolvedRange.from, resolvedRange.to])

  const loadDetail = useCallback(async () => {
    if (!selectedQrCodeId) {
      setDetail(null)
      setDetailMetrics(null)
      setScans(null)
      setDetailError(null)
      return
    }

    setDetailLoading(true)
    setDetailError(null)

    try {
      const [detailData, metricsData, scansData] = await Promise.all([
        analyticsService.getQrCodeAnalytics(
          selectedQrCodeId,
          resolvedRange.from,
          resolvedRange.to,
        ),
        analyticsService.getAnalyticsMetrics(
          resolvedRange.from,
          resolvedRange.to,
          selectedQrCodeId,
        ),
        analyticsService.listQrCodeScans(selectedQrCodeId, {
          page,
          limit,
        }),
      ])

      setDetail(detailData)
      setDetailMetrics(metricsData)
      setScans(scansData)
    } catch (err) {
      setDetail(null)
      setDetailMetrics(null)
      setScans(null)
      setDetailError(getAnalyticsErrorMessage(err))
    } finally {
      setDetailLoading(false)
    }
  }, [selectedQrCodeId, resolvedRange.from, resolvedRange.to, page, limit])

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

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

  const openQrCodeAnalytics = useCallback((qrCodeId: string) => {
    setSelectedQrCodeId(qrCodeId)
    setPage(1)
  }, [])

  const closeQrCodeAnalytics = useCallback(() => {
    setSelectedQrCodeId(null)
    setDetail(null)
    setDetailMetrics(null)
    setScans(null)
    setDetailError(null)
    setPage(1)
  }, [])

  const goToPage = useCallback((nextPage: number) => {
    setPage(nextPage)
  }, [])

  const reload = useCallback(async () => {
    await Promise.all([loadSummary(), loadDetail()])
  }, [loadSummary, loadDetail])

  return {
    dateRange,
    resolvedRange,
    summary,
    metrics,
    isLoading,
    error,
    getScanCount,
    scansByQrCodeId,
    setPreset,
    setCustomRange,
    reloadSummary: loadSummary,
    reload,
    selectedQrCodeId,
    detail,
    detailMetrics,
    scans,
    detailLoading,
    detailError,
    page,
    limit,
    openQrCodeAnalytics,
    closeQrCodeAnalytics,
    goToPage,
  }
}
