import { Download } from 'lucide-react'
import { useState } from 'react'
import type { QrCodeDownloadFormat } from '../../services/qrCodeDownloadService.ts'
import { downloadQrCodesZip } from '../../services/qrCodeDownloadService.ts'
import type { QrCode } from '../../types/qrCode.ts'
import { getQrCodeSlug } from '../../utils/qrCodeSlug.ts'
import { Button } from '../ui/Button.tsx'

type QrCodeBulkDownloadBarProps = {
  selectedCount: number
  filteredCount: number
  isSelectingAll: boolean
  onSelectFiltered: () => void
  onClearSelection: () => void
  getSelectedQrCodes: () => Promise<QrCode[]>
}

const formatLabels: Record<QrCodeDownloadFormat, string> = {
  png: 'PNG',
  svg: 'SVG',
  pdf: 'PDF',
}

export function QrCodeBulkDownloadBar({
  selectedCount,
  filteredCount,
  isSelectingAll,
  onSelectFiltered,
  onClearSelection,
  getSelectedQrCodes,
}: QrCodeBulkDownloadBarProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload(format: QrCodeDownloadFormat) {
    setError(null)
    setIsDownloading(true)

    try {
      const selectedQrCodes = await getSelectedQrCodes()

      if (selectedQrCodes.length === 0) {
        setError('Selecione ao menos um QR Code para download.')
        return
      }

      await downloadQrCodesZip(
        selectedQrCodes.map((qrCode) => ({
          publicUrl: qrCode.publicUrl,
          color: qrCode.color,
          fileName: qrCode.name,
          slug: getQrCodeSlug(qrCode.publicUrl),
        })),
        format,
        `qr-codes-${format}.zip`,
      )
    } catch {
      setError('Não foi possível gerar o arquivo ZIP para download.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <section className="qr-bulk-download" aria-label="Download em lote de QR Codes">
      <div className="qr-bulk-download__summary">
        <strong>{selectedCount} selecionado(s)</strong>
        <span className="qr-bulk-download__hint">
          {filteredCount} QR Code(s) nos resultados filtrados
        </span>
      </div>

      <div className="qr-bulk-download__actions">
        <Button
          type="button"
          variant="secondary"
          disabled={isSelectingAll || filteredCount === 0}
          onClick={onSelectFiltered}
        >
          {isSelectingAll ? 'Selecionando...' : 'Selecionar filtrados'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={selectedCount === 0 || isDownloading}
          onClick={onClearSelection}
        >
          Limpar seleção
        </Button>
        {(['png', 'svg', 'pdf'] as const).map((format) => (
          <Button
            key={format}
            type="button"
            disabled={selectedCount === 0 || isDownloading}
            onClick={() => void handleDownload(format)}
          >
            <Download size={16} aria-hidden="true" />
            Baixar ZIP {formatLabels[format]}
          </Button>
        ))}
      </div>

      {error ? (
        <p className="qr-bulk-download__error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
