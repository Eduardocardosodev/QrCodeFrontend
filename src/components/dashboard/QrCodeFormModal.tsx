import clsx from 'clsx'
import { useEffect, useState, type FormEvent } from 'react'
import {
  DEFAULT_QR_COLOR,
  MAX_BATCH_QUANTITY,
  type Folder,
  type QrCode,
} from '../../types/qrCode.ts'
import { isValidHexColor, isValidUrl } from '../../utils/validation.ts'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Input.tsx'
import { Modal } from '../ui/Modal.tsx'

export type QrCodeFormMode = 'create' | 'edit'
export type QrCodeCreateVariant = 'single' | 'batch'

type QrCodeFormModalProps = {
  mode: QrCodeFormMode
  isOpen: boolean
  qrCode?: QrCode
  folders?: Folder[]
  foldersLoading?: boolean
  foldersError?: string | null
  onClose: () => void
  onSubmit: (values: {
    name: string
    destinationUrl: string
    folder: string
    color: string
  }) => Promise<void>
  onSubmitBatch?: (values: {
    prefix: string
    quantity: number
    destinationUrl: string
    folderId: string
    color: string
  }) => Promise<void>
}

type FormErrors = {
  name?: string
  prefix?: string
  quantity?: string
  destinationUrl?: string
  folder?: string
  folderId?: string
  color?: string
}

export function QrCodeFormModal({
  mode,
  isOpen,
  qrCode,
  folders = [],
  foldersLoading = false,
  foldersError = null,
  onClose,
  onSubmit,
  onSubmitBatch,
}: QrCodeFormModalProps) {
  const [createVariant, setCreateVariant] = useState<QrCodeCreateVariant>('single')
  const [name, setName] = useState('')
  const [prefix, setPrefix] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [folder, setFolder] = useState('')
  const [folderId, setFolderId] = useState('')
  const [color, setColor] = useState(DEFAULT_QR_COLOR)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const defaultFolderId = folders[0]?.id ?? ''

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (mode === 'edit' && qrCode) {
      setCreateVariant('single')
      setName(qrCode.name)
      setDestinationUrl(qrCode.destinationUrl)
      setFolder(qrCode.folder)
      setColor(qrCode.color)
    } else {
      setCreateVariant('single')
      setName('')
      setPrefix('')
      setQuantity('1')
      setDestinationUrl('')
      setFolder('')
      setFolderId(defaultFolderId)
      setColor(DEFAULT_QR_COLOR)
    }

    setErrors({})
    setFormError(null)
    setIsSubmitting(false)
  }, [isOpen, mode, qrCode, defaultFolderId])

  function validate(): FormErrors {
    const nextErrors: FormErrors = {}

    if (mode === 'create' && createVariant === 'batch') {
      if (!prefix.trim()) {
        nextErrors.prefix = 'Informe o prefixo dos QR Codes.'
      }

      const parsedQuantity = Number.parseInt(quantity, 10)
      if (!quantity.trim() || Number.isNaN(parsedQuantity)) {
        nextErrors.quantity = 'Informe uma quantidade válida.'
      } else if (parsedQuantity < 1) {
        nextErrors.quantity = 'A quantidade mínima é 1.'
      } else if (parsedQuantity > MAX_BATCH_QUANTITY) {
        nextErrors.quantity = `A quantidade máxima é ${MAX_BATCH_QUANTITY}.`
      }

      if (!folderId) {
        nextErrors.folderId = 'Selecione uma pasta.'
      }
    }

    if (mode === 'create' && createVariant === 'single') {
      if (!name.trim()) {
        nextErrors.name = 'Informe o nome do QR Code.'
      }

      if (!folder.trim()) {
        nextErrors.folder = 'Informe a pasta.'
      }
    }

    if (!destinationUrl.trim()) {
      nextErrors.destinationUrl = 'Informe a URL de destino.'
    } else if (!isValidUrl(destinationUrl)) {
      nextErrors.destinationUrl = 'Informe uma URL válida (http ou https).'
    }

    if (mode === 'create') {
      const trimmedColor = color.trim() || DEFAULT_QR_COLOR
      if (trimmedColor !== DEFAULT_QR_COLOR && !isValidHexColor(trimmedColor)) {
        nextErrors.color = 'Informe uma cor válida no formato #RRGGBB.'
      }
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
      if (mode === 'create' && createVariant === 'batch') {
        if (!onSubmitBatch) {
          throw new Error('Criação em lote não disponível.')
        }

        await onSubmitBatch({
          prefix: prefix.trim(),
          quantity: Number.parseInt(quantity, 10),
          destinationUrl: destinationUrl.trim(),
          folderId,
          color: color.trim() || DEFAULT_QR_COLOR,
        })
      } else {
        await onSubmit({
          name: name.trim(),
          destinationUrl: destinationUrl.trim(),
          folder: folder.trim(),
          color: color.trim() || DEFAULT_QR_COLOR,
        })
      }

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
  const submitLabel =
    mode === 'create'
      ? createVariant === 'batch'
        ? 'Criar em lote'
        : 'Criar QR Code'
      : 'Salvar destino'

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
      <form className="qr-form" onSubmit={handleSubmit} noValidate>
        {formError ? <div className="form-alert" role="alert">{formError}</div> : null}

        {mode === 'create' ? (
          <div className="qr-form__tabs" role="tablist" aria-label="Tipo de criação">
            <button
              type="button"
              role="tab"
              aria-selected={createVariant === 'single'}
              className={clsx(
                'qr-form__tab',
                createVariant === 'single' && 'qr-form__tab--active',
              )}
              onClick={() => setCreateVariant('single')}
            >
              Individual
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={createVariant === 'batch'}
              className={clsx(
                'qr-form__tab',
                createVariant === 'batch' && 'qr-form__tab--active',
              )}
              onClick={() => setCreateVariant('batch')}
            >
              Em lote
            </button>
          </div>
        ) : null}

        {mode === 'create' && createVariant === 'single' ? (
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
        ) : null}

        {mode === 'create' && createVariant === 'batch' ? (
          <>
            <Input
              label="Prefixo"
              name="prefix"
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
              error={errors.prefix}
              placeholder="Ex.: Cliente"
            />
            <p className="qr-form__hint">
              Os nomes serão gerados como Cliente 1, Cliente 2, etc.
            </p>

            <Input
              label="Quantidade"
              name="quantity"
              type="number"
              min={1}
              max={MAX_BATCH_QUANTITY}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              error={errors.quantity}
              placeholder={`1 a ${MAX_BATCH_QUANTITY}`}
            />

            <div className="field">
              <label className="field__label" htmlFor="folderId">
                Pasta
              </label>
              <select
                id="folderId"
                name="folderId"
                className={clsx(
                  'field__input',
                  errors.folderId && 'field__input--error',
                )}
                value={folderId}
                onChange={(event) => setFolderId(event.target.value)}
                disabled={foldersLoading}
                aria-invalid={Boolean(errors.folderId)}
                aria-describedby={errors.folderId ? 'folderId-error' : undefined}
              >
                <option value="">
                  {foldersLoading ? 'Carregando pastas...' : 'Selecione uma pasta'}
                </option>
                {folders.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {errors.folderId ? (
                <span className="field__error" id="folderId-error" role="alert">
                  {errors.folderId}
                </span>
              ) : null}
              {foldersError ? (
                <span className="field__error" role="alert">{foldersError}</span>
              ) : null}
            </div>

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
        ) : null}

        {mode === 'edit' ? (
          <div className="qr-form__readonly">
            <p><strong>Nome:</strong> {qrCode?.name}</p>
            <p><strong>Pasta:</strong> {qrCode?.folder}</p>
            <p><strong>URL dinâmica:</strong> {qrCode?.publicUrl}</p>
          </div>
        ) : null}

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
            {isSubmitting ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
