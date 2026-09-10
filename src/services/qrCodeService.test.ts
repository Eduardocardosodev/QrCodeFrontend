import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createQrCode, deleteQrCode, listQrCodes, updateQrCode } from './qrCodeService.ts'

vi.mock('./apiClient.ts', () => ({
  apiRequest: vi.fn(),
}))

import { apiRequest } from './apiClient.ts'

const mockQrCode = {
  id: '1',
  name: 'Cardápio',
  destinationUrl: 'https://example.com/menu',
  folder: 'Clientes',
  color: '#000000',
  publicUrl: 'http://localhost:3000/redirects/abc12xyz',
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('qrCodeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lista QR Codes autenticados', async () => {
    vi.mocked(apiRequest).mockResolvedValue([mockQrCode])

    const result = await listQrCodes()

    expect(apiRequest).toHaveBeenCalledWith('/qr-codes')
    expect(result).toEqual([mockQrCode])
  })

  it('cria QR Code sem enviar cor padrão', async () => {
    vi.mocked(apiRequest).mockResolvedValue(mockQrCode)

    await createQrCode({
      name: 'Cardápio',
      destinationUrl: 'https://example.com/menu',
      folder: 'Clientes',
      color: '#000000',
    })

    expect(apiRequest).toHaveBeenCalledWith('/qr-codes', {
      method: 'POST',
      body: {
        name: 'Cardápio',
        destinationUrl: 'https://example.com/menu',
        folder: 'Clientes',
      },
    })
  })

  it('cria QR Code com cor customizada', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      ...mockQrCode,
      color: '#ff0000',
    })

    await createQrCode({
      name: 'Promoção',
      destinationUrl: 'https://example.com/promo',
      folder: 'Marketing',
      color: '#FF0000',
    })

    expect(apiRequest).toHaveBeenCalledWith('/qr-codes', {
      method: 'POST',
      body: {
        name: 'Promoção',
        destinationUrl: 'https://example.com/promo',
        folder: 'Marketing',
        color: '#ff0000',
      },
    })
  })

  it('exclui QR Code', async () => {
    vi.mocked(apiRequest).mockResolvedValue(undefined)

    await deleteQrCode('1')

    expect(apiRequest).toHaveBeenCalledWith('/qr-codes/1', {
      method: 'DELETE',
    })
  })

  it('atualiza apenas destinationUrl', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      ...mockQrCode,
      destinationUrl: 'https://example.com/novo',
    })

    const result = await updateQrCode('1', {
      destinationUrl: 'https://example.com/novo',
    })

    expect(apiRequest).toHaveBeenCalledWith('/qr-codes/1', {
      method: 'PATCH',
      body: { destinationUrl: 'https://example.com/novo' },
    })
    expect(result.publicUrl).toBe('http://localhost:3000/redirects/abc12xyz')
    expect(result.destinationUrl).toBe('https://example.com/novo')
  })
})
