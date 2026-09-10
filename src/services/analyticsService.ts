import { apiRequest } from './apiClient.ts'
import type {
  AnalyticsMetrics,
  AnalyticsSummary,
  PaginatedScanEvents,
  QrCodeAnalyticsDetail,
} from '../types/analytics.ts'

function buildDateRangeQuery(from?: string, to?: string): string {
  const params = new URLSearchParams()
  if (from) {
    params.set('from', from)
  }
  if (to) {
    params.set('to', to)
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function getAnalyticsSummary(
  from?: string,
  to?: string,
): Promise<AnalyticsSummary> {
  return apiRequest<AnalyticsSummary>(
    `/analytics/summary${buildDateRangeQuery(from, to)}`,
  )
}

export async function getAnalyticsMetrics(
  from?: string,
  to?: string,
  qrCodeId?: string,
): Promise<AnalyticsMetrics> {
  const params = new URLSearchParams()
  if (from) {
    params.set('from', from)
  }
  if (to) {
    params.set('to', to)
  }
  if (qrCodeId) {
    params.set('qrCodeId', qrCodeId)
  }
  const query = params.toString()

  return apiRequest<AnalyticsMetrics>(
    `/analytics/metrics${query ? `?${query}` : ''}`,
  )
}

export async function getQrCodeAnalytics(
  qrCodeId: string,
  from?: string,
  to?: string,
): Promise<QrCodeAnalyticsDetail> {
  return apiRequest<QrCodeAnalyticsDetail>(
    `/analytics/qr-codes/${qrCodeId}${buildDateRangeQuery(from, to)}`,
  )
}

export async function listQrCodeScans(
  qrCodeId: string,
  options: {
    page?: number
    limit?: number
  } = {},
): Promise<PaginatedScanEvents> {
  const params = new URLSearchParams()
  params.set('page', String(options.page ?? 1))
  params.set('limit', String(options.limit ?? 20))

  return apiRequest<PaginatedScanEvents>(
    `/analytics/qr-codes/${qrCodeId}/scans?${params.toString()}`,
  )
}
