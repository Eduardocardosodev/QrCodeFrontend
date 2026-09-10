import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createQrCode,
  createQrCodesBatch,
  createFolder,
  deleteQrCode,
  deleteFolder,
  getFolder,
  listFolders,
  listQrCodes,
  updateFolder,
  updateQrCode,
} from './qrCodeService.ts'

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

  it('lista pastas autenticadas', async () => {
    vi.mocked(apiRequest).mockResolvedValue([
      {
        id: 'folder-1',
        name: 'Clientes',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ])

    const result = await listFolders()

    expect(apiRequest).toHaveBeenCalledWith('/folders')
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('Clientes')
  })

  it('cria, busca, renomeia e exclui pasta', async () => {
    const folder = {
      id: 'folder-1',
      name: 'Clientes',
      createdAt: '2026-09-10T14:00:00.000Z',
      updatedAt: '2026-09-10T14:00:00.000Z',
      qrCodeCount: 0,
    }
    vi.mocked(apiRequest)
      .mockResolvedValueOnce(folder)
      .mockResolvedValueOnce(folder)
      .mockResolvedValueOnce({ ...folder, name: 'Clientes VIP' })
      .mockResolvedValueOnce(undefined)

    await expect(createFolder({ name: ' Clientes ' })).resolves.toEqual(folder)
    await expect(getFolder('folder-1')).resolves.toEqual(folder)
    await expect(updateFolder('folder-1', { name: ' Clientes VIP ' })).resolves.toEqual({
      ...folder,
      name: 'Clientes VIP',
    })
    await expect(deleteFolder('folder-1')).resolves.toBeUndefined()

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/folders', {
      method: 'POST',
      body: { name: 'Clientes' },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/folders/folder-1')
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/folders/folder-1', {
      method: 'PATCH',
      body: { name: 'Clientes VIP' },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/folders/folder-1', {
      method: 'DELETE',
    })
  })

  it('lista QR Codes autenticados', async () => {
    vi.mocked(apiRequest).mockResolvedValue([mockQrCode])

    const result = await listQrCodes()

    expect(apiRequest).toHaveBeenCalledWith('/qr-codes?page=1&limit=20')
    expect(result).toEqual([mockQrCode])
  })

  it('lista QR Codes com paginação', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      items: [mockQrCode],
      page: 2,
      limit: 50,
      total: 101,
      totalPages: 3,
    })

    const result = await listQrCodes({ page: 2, limit: 50 })

    expect(apiRequest).toHaveBeenCalledWith('/qr-codes?page=2&limit=50')
    expect(result.totalPages).toBe(3)
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

  it('cria QR Codes em lote', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      count: 2,
      items: [
        { ...mockQrCode, id: '1', name: 'Cliente 1' },
        { ...mockQrCode, id: '2', name: 'Cliente 2' },
      ],
    })

    const result = await createQrCodesBatch({
      prefix: 'Cliente',
      quantity: 2,
      destinationUrl: 'https://example.com/padrao',
      folderId: 'folder-1',
      color: '#000000',
    })

    expect(apiRequest).toHaveBeenCalledWith('/qr-codes/batch', {
      method: 'POST',
      body: {
        prefix: 'Cliente',
        quantity: 2,
        destinationUrl: 'https://example.com/padrao',
        folderId: 'folder-1',
      },
    })
    expect(result.count).toBe(2)
    expect(result.items).toHaveLength(2)
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
