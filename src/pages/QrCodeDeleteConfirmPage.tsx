import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button.tsx'
import { useQrCodeDetails } from '../hooks/useQrCodeDetails.ts'
import { ApiClientError } from '../services/apiClient.ts'

export function QrCodeDeleteConfirmPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { qrCode, isLoading, error, removeQrCode } = useQrCodeDetails(id)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleConfirmDelete() {
    setDeleteError(null)
    setIsDeleting(true)

    try {
      await removeQrCode()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setDeleteError(
        err instanceof ApiClientError
          ? err.message
          : 'Não foi possível excluir o QR Code.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <div className="loading-screen">Carregando...</div>
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

  return (
    <div className="dashboard-page qr-delete-page">
      <header className="dashboard-page__header">
        <div>
          <Button
            type="button"
            variant="secondary"
            className="qr-details-page__back"
            onClick={() => navigate(`/dashboard/qr-codes/${qrCode.id}`)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar
          </Button>
          <h1 className="dashboard-page__title">Excluir QR Code</h1>
          <p className="dashboard-page__subtitle">
            Confirme a exclusão de <strong>{qrCode.name}</strong>
          </p>
        </div>
      </header>

      <section className="qr-delete-card">
        <p>
          Esta ação não pode ser desfeita. O QR Code deixará de redirecionar e os
          analytics associados não estarão mais disponíveis nesta conta.
        </p>

        <div className="qr-delete-card__meta">
          <p><strong>Nome:</strong> {qrCode.name}</p>
          <p><strong>Pasta:</strong> {qrCode.folder}</p>
          <p><strong>URL dinâmica:</strong> {qrCode.publicUrl}</p>
        </div>

        {deleteError ? (
          <div className="form-alert" role="alert">{deleteError}</div>
        ) : null}

        <div className="qr-delete-card__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/dashboard/qr-codes/${qrCode.id}`)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="button--danger"
            onClick={() => void handleConfirmDelete()}
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
          </Button>
        </div>
      </section>
    </div>
  )
}
