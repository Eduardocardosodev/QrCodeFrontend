import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { QrCode } from '../types/qrCode.ts'
import { useQrCodes } from './useQrCodes.ts'
import * as qrCodeService from '../services/qrCodeService.ts'

vi.mock('../services/qrCodeService.ts', () => ({
  listQrCodes: vi.fn(),
  listFolders: vi.fn(),
  createQrCode: vi.fn(),
  createQrCodesBatch: vi.fn(),
  updateQrCode: vi.fn(),
}))

const mockFolders = [
  {
    id: 'folder-1',
    name: 'Clientes',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    qrCodeCount: 0,
  },
  {
    id: 'folder-2',
    name: 'Marketing',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    qrCodeCount: 0,
  },
]

const mockQrCodes = [
  {
    id: '1',
    name: 'Cardápio',
    destinationUrl: 'https://example.com/menu',
    folder: 'Clientes',
    color: '#000000',
    publicUrl: 'http://localhost:3000/redirects/abc12xyz',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Promoção',
    destinationUrl: 'https://example.com/promo',
    folder: 'Marketing',
    color: '#000000',
    publicUrl: 'http://localhost:3000/redirects/def45uvw',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
]

const paginatedQrCodes = {
  items: mockQrCodes,
  page: 1,
  limit: 20,
  total: 2,
  totalPages: 1,
}

describe('useQrCodes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('carrega lista e calcula totalCount', async () => {
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue(paginatedQrCodes)
    vi.mocked(qrCodeService.listFolders).mockResolvedValue(mockFolders)

    const { result } = renderHook(() => useQrCodes())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.totalCount).toBe(2)
    expect(result.current.folders).toEqual(['Clientes', 'Marketing'])
  })

  it('filtra por pasta localmente', async () => {
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue(paginatedQrCodes)
    vi.mocked(qrCodeService.listFolders).mockResolvedValue(mockFolders)

    const { result } = renderHook(() => useQrCodes())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(() => {
      result.current.setSelectedFolder('Marketing')
    })

    await waitFor(() => {
      expect(result.current.filteredQrCodes).toHaveLength(1)
      expect(result.current.filteredQrCodes[0]?.name).toBe('Promoção')
    })
  })

  it('carrega a página solicitada', async () => {
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue({
      items: [mockQrCodes[1]],
      page: 2,
      limit: 20,
      total: 21,
      totalPages: 2,
    })
    vi.mocked(qrCodeService.listFolders).mockResolvedValue(mockFolders)

    const { result } = renderHook(() => useQrCodes())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      result.current.goToPage(2)
    })

    await waitFor(() => {
      expect(qrCodeService.listQrCodes).toHaveBeenLastCalledWith({
        page: 2,
        limit: 20,
      })
    })
    expect(result.current.page).toBe(2)
  })

  it('adiciona QR Codes criados em lote à lista', async () => {
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    })
    vi.mocked(qrCodeService.listFolders).mockResolvedValue(mockFolders)
    vi.mocked(qrCodeService.createQrCodesBatch).mockResolvedValue({
      count: 2,
      items: [
        { ...mockQrCodes[0], id: 'batch-1', name: 'Cliente 1' },
        { ...mockQrCodes[0], id: 'batch-2', name: 'Cliente 2' },
      ],
    })

    const { result } = renderHook(() => useQrCodes())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.createQrCodesBatch({
        prefix: 'Cliente',
        quantity: 2,
        destinationUrl: 'https://example.com/padrao',
        folderId: 'folder-1',
      })
    })

    expect(qrCodeService.createQrCodesBatch).toHaveBeenCalledWith({
      prefix: 'Cliente',
      quantity: 2,
      destinationUrl: 'https://example.com/padrao',
      folderId: 'folder-1',
    })
    expect(result.current.totalCount).toBe(2)
    expect(result.current.qrCodes[0]?.name).toBe('Cliente 1')
  })

  it('preserva publicUrl após atualização', async () => {
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue({
      items: [mockQrCodes[0]],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    })
    vi.mocked(qrCodeService.listFolders).mockResolvedValue(mockFolders)
    vi.mocked(qrCodeService.updateQrCode).mockResolvedValue({
      ...mockQrCodes[0],
      destinationUrl: 'https://cliente.com/landing',
    })

    const { result } = renderHook(() => useQrCodes())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let updatedQrCode: QrCode | undefined
    await act(async () => {
      updatedQrCode = await result.current.updateQrCode('1', {
        destinationUrl: 'https://cliente.com/landing',
      })
    })

    expect(qrCodeService.updateQrCode).toHaveBeenCalledWith('1', {
      destinationUrl: 'https://cliente.com/landing',
    })
    expect(updatedQrCode?.publicUrl).toBe('http://localhost:3000/redirects/abc12xyz')
    expect(updatedQrCode?.destinationUrl).toBe('https://cliente.com/landing')
    expect(result.current.qrCodes[0]).toEqual(updatedQrCode)
  })
})
