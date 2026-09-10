import type { ScanEvent } from '../../types/analytics.ts'
import {
  formatDeviceType,
  formatNullableValue,
  formatScanDateTime,
} from '../../utils/analyticsFormat.ts'

type ScanEventListProps = {
  items: ScanEvent[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export function ScanEventList({
  items,
  isLoading,
  error,
  onRetry,
}: ScanEventListProps) {
  if (isLoading) {
    return <div className="scan-event-list__state">Carregando analytics...</div>
  }

  if (error) {
    return (
      <div className="scan-event-list__state scan-event-list__state--error" role="alert">
        <p>{error}</p>
        <button type="button" className="analytics-summary__retry" onClick={onRetry}>
          Tentar novamente
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="scan-event-list__state">
        Ainda não houve scans neste período.
      </div>
    )
  }

  return (
    <div className="scan-event-table-wrap">
      <table className="scan-event-table">
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Dispositivo</th>
            <th scope="col">Sistema</th>
            <th scope="col">Navegador</th>
            <th scope="col">País</th>
            <th scope="col">Estado</th>
            <th scope="col">Cidade</th>
            <th scope="col">Referer</th>
            <th scope="col">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((event) => (
            <tr key={event.id}>
              <td>{formatScanDateTime(event.occurredAt)}</td>
              <td>{formatDeviceType(event.deviceType)}</td>
              <td>{formatNullableValue(event.operatingSystem)}</td>
              <td>{formatNullableValue(event.browser)}</td>
              <td>{formatNullableValue(event.country)}</td>
              <td>{formatNullableValue(event.state)}</td>
              <td>{formatNullableValue(event.city)}</td>
              <td>{formatNullableValue(event.referer)}</td>
              <td>
                {event.userAgent ? (
                  <details className="scan-event-table__user-agent">
                    <summary>User-Agent</summary>
                    <p>{event.userAgent}</p>
                  </details>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
