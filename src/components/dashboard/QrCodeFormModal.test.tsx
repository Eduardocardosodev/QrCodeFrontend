import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QrCodeFormModal } from './QrCodeFormModal.tsx'

const mockFolders = [
  {
    id: 'folder-1',
    name: 'Clientes',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    qrCodeCount: 0,
  },
]

describe('QrCodeFormModal', () => {
  it('valida campos obrigatórios na criação', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <QrCodeFormModal
        mode="create"
        isOpen
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Criar QR Code' }))

    expect(screen.getByText('Informe o nome do QR Code.')).toBeInTheDocument()
    expect(screen.getByText('Informe a pasta.')).toBeInTheDocument()
    expect(screen.getByText('Informe a URL de destino.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('valida URL inválida', async () => {
    const user = userEvent.setup()

    render(
      <QrCodeFormModal
        mode="create"
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Nome'), 'Teste')
    await user.type(screen.getByLabelText('Pasta'), 'Clientes')
    await user.type(screen.getByLabelText('URL de destino'), 'url-invalida')
    await user.click(screen.getByRole('button', { name: 'Criar QR Code' }))

    expect(screen.getByText('Informe uma URL válida (http ou https).')).toBeInTheDocument()
  })

  it('valida campos obrigatórios na criação em lote', async () => {
    const user = userEvent.setup()
    const onSubmitBatch = vi.fn()

    render(
      <QrCodeFormModal
        mode="create"
        isOpen
        folders={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onSubmitBatch={onSubmitBatch}
      />,
    )

    await user.click(screen.getByRole('tab', { name: 'Em lote' }))
    await user.click(screen.getByRole('button', { name: 'Criar em lote' }))

    expect(screen.getByText('Informe o prefixo dos QR Codes.')).toBeInTheDocument()
    expect(screen.getByText('Selecione uma pasta.')).toBeInTheDocument()
    expect(screen.getByText('Informe a URL de destino.')).toBeInTheDocument()
    expect(onSubmitBatch).not.toHaveBeenCalled()
  })

  it('envia criação em lote com folderId', async () => {
    const user = userEvent.setup()
    const onSubmitBatch = vi.fn().mockResolvedValue(undefined)

    render(
      <QrCodeFormModal
        mode="create"
        isOpen
        folders={mockFolders}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onSubmitBatch={onSubmitBatch}
      />,
    )

    await user.click(screen.getByRole('tab', { name: 'Em lote' }))
    await user.type(screen.getByLabelText('Prefixo'), 'Cliente')
    await user.clear(screen.getByLabelText('Quantidade'))
    await user.type(screen.getByLabelText('Quantidade'), '3')
    await user.selectOptions(screen.getByLabelText('Pasta'), 'folder-1')
    await user.type(screen.getByLabelText('URL de destino'), 'https://example.com/padrao')
    await user.click(screen.getByRole('button', { name: 'Criar em lote' }))

    expect(onSubmitBatch).toHaveBeenCalledWith({
      prefix: 'Cliente',
      quantity: 3,
      destinationUrl: 'https://example.com/padrao',
      folderId: 'folder-1',
      color: '#000000',
    })
  })

  it('valida cor hexadecimal inválida', async () => {
    const user = userEvent.setup()

    render(
      <QrCodeFormModal
        mode="create"
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Nome'), 'Teste')
    await user.type(screen.getByLabelText('Pasta'), 'Clientes')
    await user.type(screen.getByLabelText('URL de destino'), 'https://example.com')
    await user.clear(screen.getByLabelText('Cor (opcional)'))
    await user.type(screen.getByLabelText('Cor (opcional)'), 'red')
    await user.click(screen.getByRole('button', { name: 'Criar QR Code' }))

    expect(screen.getByText('Informe uma cor válida no formato #RRGGBB.')).toBeInTheDocument()
  })
})
