import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { QrCode } from '../../types/qrCode.ts'
import { buildQrCodeImageUrl } from '../../utils/qrCodeImage.ts'
import { getQrCodeSlug } from '../../utils/qrCodeSlug.ts'

type QrCodeCardProps = {
  qrCode: QrCode
  scanCount: number
}

function truncateUrl(url: string, maxLength = 48) {
  if (url.length <= maxLength) {
    return url
  }

  return `${url.slice(0, maxLength - 1)}…`
}

export function QrCodeCard({ qrCode, scanCount }: QrCodeCardProps) {
  const qrImageUrl = buildQrCodeImageUrl(qrCode.publicUrl, qrCode.color)
  const slug = getQrCodeSlug(qrCode.publicUrl)
  const detailsPath = `/dashboard/qr-codes/${qrCode.id}`
  const displayName =
    qrCode.name.length > 30 ? `${qrCode.name.slice(0, 30)}...` : qrCode.name

  return (
    <article className="qr-card">
      <Link to={detailsPath} className="qr-card__main-link" aria-label={`Abrir detalhes de ${qrCode.name}`}>
        <div className="qr-card__image-wrap">
          <img
            src={qrImageUrl}
            alt={`QR Code de ${qrCode.name}`}
            className="qr-card__image"
            loading="lazy"
          />
        </div>

        <div className="qr-card__content qr-card__content--linked">
          <div className="qr-card__header">
            <h3 className="qr-card__name" title={qrCode.name}>
              {displayName}
            </h3>
            <span className="qr-card__folder">{qrCode.folder}</span>
          </div>

          <div className="qr-card__field">
            <span className="qr-card__label">Slug</span>
            <code className="qr-card__slug">{slug}</code>
          </div>

          <div className="qr-card__field">
            <span className="qr-card__label">Total de scans</span>
            <strong className="qr-card__scans">{scanCount}</strong>
          </div>

          <span className="qr-card__details-cta">Ver detalhes</span>
        </div>
      </Link>

      <div className="qr-card__content qr-card__content--secondary">
        <div className="qr-card__field">
          <span className="qr-card__label">URL dinâmica</span>
          <a
            href={qrCode.publicUrl}
            target="_blank"
            rel="noreferrer"
            className="qr-card__link"
            title={qrCode.publicUrl}
          >
            {truncateUrl(qrCode.publicUrl)}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>

        <div className="qr-card__field">
          <span className="qr-card__label">Destino atual</span>
          <p className="qr-card__destination" title={qrCode.destinationUrl}>
            {truncateUrl(qrCode.destinationUrl, 56)}
          </p>
        </div>
      </div>
    </article>
  )
}
