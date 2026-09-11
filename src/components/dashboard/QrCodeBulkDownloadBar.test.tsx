import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QrCodeBulkDownloadBar } from './QrCodeBulkDownloadBar.tsx'
import * as qrCodeDownloadService from '../../services/qrCodeDownloadService.ts'

vi.mock('../../services/qrCodeDownloadService.ts', async () => {
  const actual = await vi.importActual<typeof qrCodeDownloadService>(
    '../../services/qrCodeDownloadService.ts',
  )
  return {
    ...actual,
    downloadQrCodesZip: vi.fn(),
  }
})

const mockQrCode = {
  id: '1',
  name: 'Cardápio',
  destinationUrl: 'https://example.com/menu',
  folder: 'Clientes',
  color: '#000000',
  publicUrl: 'http://localhost:3000/redirects/abc12xyz',
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('QrCodeBulkDownloadBar', () => {
  it('baixa ZIP PNG dos selecionados', async () => {
    const user = userEvent.setup()
    const getSelectedQrCodes = vi.fn().mockResolvedValue([mockQrCode])

    render(
      <QrCodeBulkDownloadBar
        selectedCount={1}
        filteredCount={1}
        isSelectingAll={false}
        onSelectFiltered={vi.fn()}
        onClearSelection={vi.fn()}
        getSelectedQrCodes={getSelectedQrCodes}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Baixar ZIP PNG' }))

    await waitFor(() => {
      expect(getSelectedQrCodes).toHaveBeenCalled()
      expect(qrCodeDownloadService.downloadQrCodesZip).toHaveBeenCalledWith(
        [
          {
            publicUrl: mockQrCode.publicUrl,
            color: mockQrCode.color,
            fileName: mockQrCode.name,
            slug: 'abc12xyz',
          },
        ],
        'png',
        'qr-codes-png.zip',
      )
    })
  })
})
