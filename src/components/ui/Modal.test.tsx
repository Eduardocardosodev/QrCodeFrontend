import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal.tsx'

describe('Modal', () => {
  it('bloqueia a rolagem do body enquanto estiver aberto', () => {
    const { unmount } = render(
      <Modal title="Teste" isOpen onClose={() => undefined}>
        Conteúdo
      </Modal>,
    )

    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('fecha com Escape e devolve o foco ao elemento anterior', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const trigger = document.createElement('button')
    trigger.textContent = 'Abrir'
    document.body.appendChild(trigger)
    trigger.focus()

    render(
      <Modal title="Teste" isOpen onClose={onClose}>
        Conteúdo
      </Modal>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
    })

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)

    document.body.removeChild(trigger)
  })

  it('mantém o foco dentro do modal ao usar Tab', async () => {
    const user = userEvent.setup()

    render(
      <Modal title="Teste" isOpen onClose={() => undefined}>
        <button type="button">Ação interna</button>
      </Modal>,
    )

    const closeButton = screen.getByRole('button', { name: 'Fechar' })
    const internalButton = screen.getByRole('button', { name: 'Ação interna' })

    await waitFor(() => {
      expect(closeButton).toHaveFocus()
    })

    await user.tab()
    expect(internalButton).toHaveFocus()

    await user.tab()
    expect(closeButton).toHaveFocus()
  })
})
