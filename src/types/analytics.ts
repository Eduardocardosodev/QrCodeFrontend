export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown'

export type ScanEvent = {
  id: string
  qrCodeId: string
  occurredAt: string
  deviceType: DeviceType
  operatingSystem: string | null
  browser: string | null
  userAgent: string | null
  referer: string | null
  country: string | null
  state: string | null
  city: string | null
}

export type QrCodeScanSummary = {
  qrCodeId: string
  name: string
  totalScans: number
}

export type AnalyticsSummary = {
  totalScans: number
  qrCodes: QrCodeScanSummary[]
}

export type QrCodeAnalyticsDetail = {
  qrCodeId: string
  name: string
  totalScans: number
}

export type AnalyticsTimelineItem = {
  date: string
  totalScans: number
}

export type AnalyticsMetrics = {
  totalScans: number
  byDevice: Partial<Record<DeviceType, number>>
  byBrowser: Record<string, number>
  byOperatingSystem: Record<string, number>
  byCountry: Record<string, number>
  byState: Record<string, number>
  byCity: Record<string, number>
  timeline: AnalyticsTimelineItem[]
}

export type PaginatedScanEvents = {
  items: ScanEvent[]
  page: number
  limit: number
  total: number
  totalPages: number
}
