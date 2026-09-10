import type {
  AnalyticsMetrics,
  PaginatedScanEvents,
  QrCodeAnalyticsDetail,
} from '../../types/analytics.ts'
import { getPresetLabel, type AnalyticsDateRange } from '../../utils/analyticsDateRange.ts'
import { Modal } from '../ui/Modal.tsx'
import { AnalyticsCharts } from './AnalyticsCharts.tsx'
import { Pagination } from './Pagination.tsx'
import { ScanEventList } from './ScanEventList.tsx'

type QrCodeAnalyticsModalProps = {
  isOpen: boolean
  dateRange: AnalyticsDateRange
  detail: QrCodeAnalyticsDetail | null
  metrics: AnalyticsMetrics | null
  scans: PaginatedScanEvents | null
  isLoading: boolean
  error: string | null
  page: number
  onClose: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
}

export function QrCodeAnalyticsModal({
  isOpen,
  dateRange,
  detail,
  metrics,
  scans,
  isLoading,
  error,
  page,
  onClose,
  onPageChange,
  onRetry,
}: QrCodeAnalyticsModalProps) {
  const title = detail?.name ? `Analytics: ${detail.name}` : 'Analytics do QR Code'

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose} wide>
      <div className="qr-analytics-modal">
        <div className="qr-analytics-modal__summary">
          <div>
            <span className="qr-analytics-modal__label">Período</span>
            <strong>{getPresetLabel(dateRange.preset)}</strong>
          </div>
          <div>
            <span className="qr-analytics-modal__label">Total de scans</span>
            <strong>{metrics?.totalScans ?? detail?.totalScans ?? 0}</strong>
          </div>
        </div>

        <AnalyticsCharts
          metrics={metrics}
          isLoading={isLoading}
          error={error}
        />

        <ScanEventList
          items={scans?.items ?? []}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
        />

        <Pagination
          page={page}
          totalPages={scans?.totalPages ?? 0}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      </div>
    </Modal>
  )
}
