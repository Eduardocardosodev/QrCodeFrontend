import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { filterQrCodesByFolderAndSearch, useQrCodeSelection } from './useQrCodeSelection.ts'
import * as qrCodeService from '../services/qrCodeService.ts'

vi.mock('../services/qrCodeService.ts', () => ({
  listAllQrCodes: vi.fn(),
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

describe('filterQrCodesByFolderAndSearch', () => {
  it('filtra por pasta e busca', () => {
    const filtered = filterQrCodesByFolderAndSearch(mockQrCodes, 'Marketing', 'def45')
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.name).toBe('Promoção')
  })
})

describe('useQrCodeSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(qrCodeService.listAllQrCodes).mockResolvedValue(mockQrCodes)
  })

  it('seleciona QR Codes filtrados de todas as páginas', async () => {
    const { result } = renderHook(() =>
      useQrCodeSelection({
        usageFilter: 'all',
        selectedFolder: 'all',
        searchTerm: '',
      }),
    )

    await waitFor(() => {
      expect(result.current.filteredCount).toBe(2)
    })

    await result.current.selectFiltered()

    await waitFor(() => {
      expect(result.current.selectedCount).toBe(2)
      expect(result.current.isSelected('1')).toBe(true)
      expect(result.current.isSelected('2')).toBe(true)
    })
  })

  it('alterna seleção individual', async () => {
    const { result } = renderHook(() =>
      useQrCodeSelection({
        usageFilter: 'all',
        selectedFolder: 'all',
        searchTerm: '',
      }),
    )

    act(() => {
      result.current.toggleSelection(mockQrCodes[0])
    })
    expect(result.current.selectedCount).toBe(1)
    expect(result.current.isSelected('1')).toBe(true)

    act(() => {
      result.current.toggleSelection(mockQrCodes[0])
    })
    expect(result.current.selectedCount).toBe(0)
    expect(result.current.isSelected('1')).toBe(false)
  })
})
