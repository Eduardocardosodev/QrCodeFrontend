type AnalyticsSummaryProps = {
  totalScans: number
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export function AnalyticsSummary({
  totalScans,
  isLoading,
  error,
  onRetry,
}: AnalyticsSummaryProps) {
  if (isLoading) {
    return (
      <div className="dashboard-stats__card dashboard-stats__card--analytics">
        <span className="dashboard-stats__label">Total de scans</span>
        <strong className="dashboard-stats__value dashboard-stats__value--muted">
          Carregando...
        </strong>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="dashboard-stats__card dashboard-stats__card--analytics dashboard-stats__card--error"
        role="alert"
      >
        <span className="dashboard-stats__label">Total de scans</span>
        <p className="dashboard-stats__error">{error}</p>
        <button type="button" className="analytics-summary__retry" onClick={onRetry}>
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard-stats__card dashboard-stats__card--analytics">
      <span className="dashboard-stats__label">Total de scans</span>
      <strong className="dashboard-stats__value">{totalScans}</strong>
    </div>
  )
}
