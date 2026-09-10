import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnalyticsCharts } from '../components/dashboard/AnalyticsCharts.tsx'
import { AnalyticsDateFilter } from '../components/dashboard/AnalyticsDateFilter.tsx'
import { Pagination } from '../components/dashboard/Pagination.tsx'
import { QrCodeDetailsForm } from '../components/dashboard/QrCodeDetailsForm.tsx'
import { QrCodeDownloadActions } from '../components/dashboard/QrCodeDownloadActions.tsx'
import { ScanEventList } from '../components/dashboard/ScanEventList.tsx'
import { Button } from '../components/ui/Button.tsx'
import { useQrCodeDetails } from '../hooks/useQrCodeDetails.ts'
import { ApiClientError } from '../services/apiClient.ts'
import { buildQrCodeImageUrl } from '../utils/qrCodeImage.ts'
import { getQrCodeSlug } from '../utils/qrCodeSlug.ts'

export function QrCodeDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const {
    qrCode,
    metrics,
    scans,
    dateRange,
    page,
    isLoading,
    isAnalyticsLoading,
    error,
    analyticsError,
    setPreset,
    setCustomRange,
    goToPage,
    updateDestinationUrl,
    reload,
  } = useQrCodeDetails(id)

  async function handleSave(values: {
    name: string
    destinationUrl: string
    address: string
  }) {
    try {
      await updateDestinationUrl(values)
    } catch (err) {
      throw err instanceof ApiClientError
        ? err
        : new Error('Não foi possível atualizar o QR Code.')
    }
  }

  if (isLoading) {
    return <div className="loading-screen">Carregando QR Code...</div>
  }

  if (error || !qrCode) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-state dashboard-state--error" role="alert">
          <p>{error ?? 'QR Code não encontrado.'}</p>
          <Button type="button" onClick={() => navigate('/dashboard')}>
            Voltar ao dashboard
          </Button>
        </div>
      </div>
    )
  }

  const qrImageUrl = buildQrCodeImageUrl(qrCode.publicUrl, qrCode.color)
  const slug = getQrCodeSlug(qrCode.publicUrl)

  return (
    <div className="dashboard-page qr-details-page">
      <header className="dashboard-page__header">
        <div>
          <Button
            type="button"
            variant="secondary"
            className="qr-details-page__back"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar
          </Button>
          <h1 className="dashboard-page__title">{qrCode.name}</h1>
          <p className="dashboard-page__subtitle">
            Analytics e configurações do QR Code
          </p>
        </div>
      </header>

      <section className="qr-details-layout">
        <aside className="qr-details-sidebar">
          <div className="qr-details-preview">
            <img
              src={qrImageUrl}
              alt={`QR Code de ${qrCode.name}`}
              className="qr-details-preview__image"
            />
            <p className="qr-details-preview__slug">{slug}</p>
          </div>

          <QrCodeDownloadActions qrCode={qrCode} />

          <QrCodeDetailsForm
            qrCode={qrCode}
            onSave={handleSave}
            onDelete={() => navigate(`/dashboard/qr-codes/${qrCode.id}/excluir`)}
          />
        </aside>

        <div className="qr-details-analytics">
          <section className="dashboard-stats" aria-label="Resumo do QR Code">
            <div className="dashboard-stats__card">
              <span className="dashboard-stats__label">Total de scans</span>
              <strong className="dashboard-stats__value">
                {metrics?.totalScans ?? 0}
              </strong>
            </div>
            <div className="dashboard-stats__card">
              <span className="dashboard-stats__label">Pasta</span>
              <strong className="dashboard-stats__value dashboard-stats__value--text">
                {qrCode.folder}
              </strong>
            </div>
          </section>

          <AnalyticsDateFilter
            dateRange={dateRange}
            onPresetChange={setPreset}
            onCustomRangeChange={setCustomRange}
          />

          <AnalyticsCharts
            metrics={metrics}
            isLoading={isAnalyticsLoading}
            error={analyticsError}
          />

          <section className="qr-details-events" aria-label="Eventos de scan">
            <h2 className="qr-details-events__title">Eventos individuais</h2>
            <ScanEventList
              items={scans?.items ?? []}
              isLoading={isAnalyticsLoading}
              error={analyticsError}
              onRetry={() => void reload()}
            />
            <Pagination
              page={page}
              totalPages={scans?.totalPages ?? 0}
              isLoading={isAnalyticsLoading}
              onPageChange={goToPage}
            />
          </section>
        </div>
      </section>
    </div>
  )
}
