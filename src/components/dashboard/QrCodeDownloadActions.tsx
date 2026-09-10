import { Download } from 'lucide-react'
import { useState } from 'react'
import type { QrCode } from '../../types/qrCode.ts'
import {
  downloadQrCodePdf,
  downloadQrCodePng,
  downloadQrCodeSvg,
} from '../../services/qrCodeDownloadService.ts'
import { Button } from '../ui/Button.tsx'
import { getQrCodeSlug } from '../../utils/qrCodeSlug.ts'

type QrCodeDownloadActionsProps = {
  qrCode: QrCode
}

export function QrCodeDownloadActions({ qrCode }: QrCodeDownloadActionsProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleDownload(
    format: 'png' | 'svg' | 'pdf',
  ) {
    setError(null)
    setIsDownloading(true)

    try {
      const options = {
        publicUrl: qrCode.publicUrl,
        color: qrCode.color,
        fileName: qrCode.name,
        slug: getQrCodeSlug(qrCode.publicUrl),
      }

      if (format === 'png') {
        await downloadQrCodePng(options)
      } else if (format === 'svg') {
        await downloadQrCodeSvg(options)
      } else {
        await downloadQrCodePdf(options)
      }
    } catch {
      setError('Não foi possível gerar o arquivo para download.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="qr-download-actions">
      <span className="qr-download-actions__label">Download</span>
      <div className="qr-download-actions__buttons">
        <Button
          type="button"
          variant="secondary"
          disabled={isDownloading}
          onClick={() => void handleDownload('png')}
        >
          <Download size={16} aria-hidden="true" />
          PNG
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isDownloading}
          onClick={() => void handleDownload('svg')}
        >
          <Download size={16} aria-hidden="true" />
          SVG
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isDownloading}
          onClick={() => void handleDownload('pdf')}
        >
          <Download size={16} aria-hidden="true" />
          PDF
        </Button>
      </div>
      {error ? <p className="qr-download-actions__error" role="alert">{error}</p> : null}
    </div>
  )
}
