import { useEffect, useState, type FormEvent } from 'react'
import { DEFAULT_QR_COLOR, type QrCode } from '../../types/qrCode.ts'
import { isValidHexColor, isValidUrl } from '../../utils/validation.ts'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Input.tsx'
import { Modal } from '../ui/Modal.tsx'

export type QrCodeFormMode = 'create' | 'edit'

type QrCodeFormModalProps = {
  mode: QrCodeFormMode
  isOpen: boolean
  qrCode?: QrCode
  onClose: () => void
  onSubmit: (values: {
    name: string
    destinationUrl: string
    folder: string
    color: string
  }) => Promise<void>
}

type FormErrors = {
  name?: string
  destinationUrl?: string
  folder?: string
  color?: string
}

export function QrCodeFormModal({
  mode,
  isOpen,
  qrCode,
  onClose,
  onSubmit,
}: QrCodeFormModalProps) {
  const [name, setName] = useState('')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [folder, setFolder] = useState('')
  const [color, setColor] = useState(DEFAULT_QR_COLOR)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (mode === 'edit' && qrCode) {
      setName(qrCode.name)
      setDestinationUrl(qrCode.destinationUrl)
      setFolder(qrCode.folder)
      setColor(qrCode.color)
    } else {
      setName('')
      setDestinationUrl('')
      setFolder('')
      setColor(DEFAULT_QR_COLOR)
    }

    setErrors({})
    setFormError(null)
    setIsSubmitting(false)
  }, [isOpen, mode, qrCode])

  function validate(): FormErrors {
    const nextErrors: FormErrors = {}

    if (mode === 'create') {
      if (!name.trim()) {
        nextErrors.name = 'Informe o nome do QR Code.'
      }

      if (!folder.trim()) {
        nextErrors.folder = 'Informe a pasta.'
      }

      const trimmedColor = color.trim() || DEFAULT_QR_COLOR
      if (trimmedColor !== DEFAULT_QR_COLOR && !isValidHexColor(trimmedColor)) {
        nextErrors.color = 'Informe uma cor válida no formato #RRGGBB.'
      }
    }

    if (!destinationUrl.trim()) {
      nextErrors.destinationUrl = 'Informe a URL de destino.'
    } else if (!isValidUrl(destinationUrl)) {
      nextErrors.destinationUrl = 'Informe uma URL válida (http ou https).'
    }

    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        name: name.trim(),
        destinationUrl: destinationUrl.trim(),
        folder: folder.trim(),
        color: color.trim() || DEFAULT_QR_COLOR,
      })
      onClose()
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o QR Code. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = mode === 'create' ? 'Criar QR Code' : 'Editar destino'

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
      <form className="qr-form" onSubmit={handleSubmit} noValidate>
        {formError ? <div className="form-alert" role="alert">{formError}</div> : null}

        {mode === 'create' ? (
          <>
            <Input
              label="Nome"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
              placeholder="Ex.: Cardápio do restaurante"
            />

            <Input
              label="Pasta"
              name="folder"
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              error={errors.folder}
              placeholder="Ex.: Clientes"
            />

            <Input
              label="Cor (opcional)"
              name="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              error={errors.color}
              placeholder="#000000"
            />
            <p className="qr-form__hint">Padrão: preto (#000000)</p>
          </>
        ) : (
          <div className="qr-form__readonly">
            <p><strong>Nome:</strong> {qrCode?.name}</p>
            <p><strong>Pasta:</strong> {qrCode?.folder}</p>
            <p><strong>URL dinâmica:</strong> {qrCode?.publicUrl}</p>
          </div>
        )}

        <Input
          label="URL de destino"
          name="destinationUrl"
          type="url"
          value={destinationUrl}
          onChange={(event) => setDestinationUrl(event.target.value)}
          error={errors.destinationUrl}
          placeholder="https://seusite.com"
        />

        <div className="qr-form__actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : mode === 'create' ? 'Criar QR Code' : 'Salvar destino'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
