import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { QrCodeCard } from './QrCodeCard.tsx'
import { buildQrCodeImageUrl } from '../../utils/qrCodeImage.ts'

vi.mock('../../utils/qrCodeImage.ts', () => ({
  buildQrCodeImageUrl: vi.fn(() => 'https://qr-image.example/test'),
}))

const mockQrCode = {
  id: '1',
  name: 'Cardápio',
  destinationUrl: 'https://example.com/menu',
  folder: 'Clientes',
  color: '#000000',
  publicUrl: 'http://localhost:3000/redirects/abc12xyz',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function renderCard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={<QrCodeCard qrCode={mockQrCode} scanCount={820} />}
        />
        <Route path="/dashboard/qr-codes/:id" element={<div>Página de detalhes</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('QrCodeCard', () => {
  it('gera imagem a partir da publicUrl retornada pela API', () => {
    renderCard()

    expect(buildQrCodeImageUrl).toHaveBeenCalledWith(
      'http://localhost:3000/redirects/abc12xyz',
      '#000000',
    )
    expect(screen.getByText('http://localhost:3000/redirects/abc12xyz')).toBeInTheDocument()
    expect(screen.getByText('https://example.com/menu')).toBeInTheDocument()
    expect(screen.getByText('820')).toBeInTheDocument()
  })

  it('navega para a tela de detalhes ao clicar no card', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: 'Abrir detalhes de Cardápio' }))

    expect(screen.getByText('Página de detalhes')).toBeInTheDocument()
  })
})
