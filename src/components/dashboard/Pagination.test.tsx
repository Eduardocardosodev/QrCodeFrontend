import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination.tsx'

describe('Pagination', () => {
  it('navega entre páginas', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <Pagination page={2} totalPages={3} onPageChange={onPageChange} />,
    )

    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('não renderiza com uma única página', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
