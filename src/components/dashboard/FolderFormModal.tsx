import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Input.tsx'
import { Modal } from '../ui/Modal.tsx'

type FolderFormModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}

export function FolderFormModal({
  isOpen,
  onClose,
  onSubmit,
}: FolderFormModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Informe o nome da pasta.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(trimmedName)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a pasta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Nova pasta" isOpen={isOpen} onClose={onClose}>
      <form className="qr-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome da pasta"
          name="folderName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={error ?? undefined}
          placeholder="Ex.: Clientes"
        />
        <div className="qr-form__actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar pasta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
