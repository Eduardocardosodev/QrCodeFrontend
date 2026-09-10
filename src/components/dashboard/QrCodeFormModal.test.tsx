import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QrCodeFormModal } from './QrCodeFormModal.tsx'

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
