import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { QrCode } from '../types/qrCode.ts'
import { useQrCodes } from './useQrCodes.ts'
import * as qrCodeService from '../services/qrCodeService.ts'

vi.mock('../services/qrCodeService.ts', () => ({
  listQrCodes: vi.fn(),
  createQrCode: vi.fn(),
  updateQrCode: vi.fn(),
}))

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

describe('useQrCodes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('carrega lista e calcula totalCount', async () => {
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue(mockQrCodes)

    const { result } = renderHook(() => useQrCodes())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.totalCount).toBe(2)
    expect(result.current.folders).toEqual(['Clientes', 'Marketing'])
  })

  it('filtra por pasta localmente', async () => {
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue(mockQrCodes)

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

  it('preserva publicUrl após atualização', async () => {
    vi.mocked(qrCodeService.listQrCodes).mockResolvedValue([mockQrCodes[0]])
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
