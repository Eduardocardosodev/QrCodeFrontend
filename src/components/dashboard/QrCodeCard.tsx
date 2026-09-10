import { ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { QrCode } from '../../types/qrCode.ts'
import { buildQrCodeImageUrl } from '../../utils/qrCodeImage.ts'
import { getQrCodeSlug } from '../../utils/qrCodeSlug.ts'

type QrCodeCardProps = {
  qrCode: QrCode
  scanCount: number
}

export function QrCodeCard({ qrCode, scanCount }: QrCodeCardProps) {
  const navigate = useNavigate()
  const qrImageUrl = buildQrCodeImageUrl(qrCode.publicUrl, qrCode.color)
  const slug = getQrCodeSlug(qrCode.publicUrl)
  const displayName =
    qrCode.name.length > 30 ? `${qrCode.name.slice(0, 30)}...` : qrCode.name

  function handleOpenDetails() {
    navigate(`/dashboard/qr-codes/${qrCode.id}`)
  }

  return (
    <article
      className="qr-card qr-card--clickable"
      onClick={handleOpenDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleOpenDetails()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Abrir detalhes de ${qrCode.name}`}
    >
      <div className="qr-card__image-wrap">
        <img
          src={qrImageUrl}
          alt={`QR Code de ${qrCode.name}`}
          className="qr-card__image"
          loading="lazy"
        />
      </div>

      <div className="qr-card__content">
        <div className="qr-card__header">
          <h3 className="qr-card__name" title={qrCode.name}>{displayName}</h3>
          <span className="qr-card__folder">{qrCode.folder}</span>
        </div>

        <div className="qr-card__field">
          <span className="qr-card__label">Slug</span>
          <code className="qr-card__slug">{slug}</code>
        </div>

        <div className="qr-card__field">
          <span className="qr-card__label">URL dinâmica</span>
          <a
            href={qrCode.publicUrl}
            target="_blank"
            rel="noreferrer"
            className="qr-card__link"
            onClick={(event) => event.stopPropagation()}
          >
            {qrCode.publicUrl}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>

        <div className="qr-card__field">
          <span className="qr-card__label">Destino atual</span>
          <p className="qr-card__destination">{qrCode.destinationUrl}</p>
        </div>

        <div className="qr-card__field">
          <span className="qr-card__label">Total de scans</span>
          <strong className="qr-card__scans">{scanCount}</strong>
        </div>
      </div>
    </article>
  )
}
