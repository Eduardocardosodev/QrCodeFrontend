import { useEffect, useState, type FormEvent } from 'react'
import type { QrCode } from '../../types/qrCode.ts'
import { isValidUrl } from '../../utils/validation.ts'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Input.tsx'

type QrCodeDetailsFormProps = {
  qrCode: QrCode
  onSave: (destinationUrl: string) => Promise<void>
  onDelete: () => void
}

export function QrCodeDetailsForm({
  qrCode,
  onSave,
  onDelete,
}: QrCodeDetailsFormProps) {
  const [destinationUrl, setDestinationUrl] = useState(qrCode.destinationUrl)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setDestinationUrl(qrCode.destinationUrl)
    setError(null)
    setFormError(null)
  }, [qrCode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!destinationUrl.trim()) {
      setError('Informe a URL de destino.')
      return
    }

    if (!isValidUrl(destinationUrl)) {
      setError('Informe uma URL válida (http ou https).')
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      await onSave(destinationUrl.trim())
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar as alterações.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="qr-details-form" onSubmit={handleSubmit} noValidate>
      {formError ? <div className="form-alert" role="alert">{formError}</div> : null}

      <Input label="Nome" name="name" value={qrCode.name} readOnly className="field__input--readonly" />
      <Input label="Pasta" name="folder" value={qrCode.folder} readOnly className="field__input--readonly" />
      <Input
        label="URL dinâmica"
        name="publicUrl"
        value={qrCode.publicUrl}
        readOnly
        className="field__input--readonly"
      />
      <Input
        label="URL de destino"
        name="destinationUrl"
        type="url"
        value={destinationUrl}
        onChange={(event) => setDestinationUrl(event.target.value)}
        error={error ?? undefined}
        placeholder="https://seusite.com"
      />
      <Input
        label="Cor"
        name="color"
        value={qrCode.color}
        readOnly
        className="field__input--readonly"
      />

      <div className="qr-details-form__actions">
        <Button type="button" variant="secondary" onClick={onDelete}>
          Excluir QR Code
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar destino'}
        </Button>
      </div>
    </form>
  )
}
