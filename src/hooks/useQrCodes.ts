import { useCallback, useEffect, useMemo, useState } from 'react'
import * as qrCodeService from '../services/qrCodeService.ts'
import { ApiClientError } from '../services/apiClient.ts'
import type {
  CreateQrCodeBatchPayload,
  CreateFolderPayload,
  CreateQrCodePayload,
  Folder,
  PaginatedQrCodes,
  QrCode,
  UpdateQrCodePayload,
} from '../types/qrCode.ts'

export type FolderFilter = 'all' | string
export type UsageFilter = 'all' | 'inUse' | 'available'
const QR_CODES_PAGE_SIZE = 20

export function useQrCodes() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([])
  const [availableFolders, setAvailableFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<FolderFilter>('all')
  const [usageFilter, setUsageFilter] = useState<UsageFilter>('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pick<PaginatedQrCodes, 'page' | 'limit' | 'total' | 'totalPages'>>({
    page: 1,
    limit: QR_CODES_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isFoldersLoading, setIsFoldersLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [foldersError, setFoldersError] = useState<string | null>(null)

  const loadFolders = useCallback(async () => {
    setIsFoldersLoading(true)
    setFoldersError(null)

    try {
      const data = await qrCodeService.listFolders()
      setAvailableFolders(data)
    } catch (err) {
      setAvailableFolders([])
      if (err instanceof ApiClientError) {
        setFoldersError(err.message)
      } else {
        setFoldersError('Não foi possível carregar as pastas.')
      }
    } finally {
      setIsFoldersLoading(false)
    }
  }, [])

  const loadQrCodes = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await qrCodeService.listQrCodes({
        page,
        limit: QR_CODES_PAGE_SIZE,
        ...(usageFilter === 'all' ? {} : { isInUse: usageFilter === 'inUse' }),
      })
      setQrCodes(data.items)
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      })
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message)
      } else {
        setError('Não foi possível carregar os QR Codes.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [page, usageFilter])

  useEffect(() => {
    void loadQrCodes()
    void loadFolders()
  }, [loadQrCodes, loadFolders])

  const folders = useMemo(() => {
    const uniqueFolders = new Set([
      ...availableFolders.map((folder) => folder.name),
      ...qrCodes.map((item) => item.folder).filter(Boolean),
    ])
    return Array.from(uniqueFolders).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [availableFolders, qrCodes])

  const filteredQrCodes = useMemo(() => {
    if (selectedFolder === 'all') {
      return qrCodes
    }

    return qrCodes.filter((item) => item.folder === selectedFolder)
  }, [qrCodes, selectedFolder])

  const goToPage = useCallback((nextPage: number) => {
    if (nextPage >= 1 && nextPage <= pagination.totalPages) {
      setPage(nextPage)
    }
  }, [pagination.totalPages])

  const changeUsageFilter = useCallback((nextFilter: UsageFilter) => {
    setUsageFilter(nextFilter)
    setPage(1)
  }, [])

  const createQrCode = useCallback(async (payload: CreateQrCodePayload) => {
    const created = await qrCodeService.createQrCode(payload)
    setQrCodes((current) => [created, ...current])
    return created
  }, [])

  const createQrCodesBatch = useCallback(async (payload: CreateQrCodeBatchPayload) => {
    const result = await qrCodeService.createQrCodesBatch(payload)
    setQrCodes((current) => [...result.items, ...current])
    return result
  }, [])

  const createFolder = useCallback(async (payload: CreateFolderPayload) => {
    const created = await qrCodeService.createFolder(payload)
    setAvailableFolders((current) => [...current, created])
    return created
  }, [])

  const updateQrCode = useCallback(async (id: string, payload: UpdateQrCodePayload) => {
    const updated = await qrCodeService.updateQrCode(id, payload)
    setQrCodes((current) => current.map((item) => (item.id === id ? updated : item)))
    return updated
  }, [])

  const deleteQrCode = useCallback(async (id: string) => {
    await qrCodeService.deleteQrCode(id)
    setQrCodes((current) => current.filter((item) => item.id !== id))
  }, [])

  return {
    qrCodes,
    filteredQrCodes,
    folders,
    availableFolders,
    selectedFolder,
    setSelectedFolder,
    usageFilter,
    setUsageFilter: changeUsageFilter,
    totalCount: qrCodes.length,
    isLoading,
    isFoldersLoading,
    error,
    foldersError,
    reload: loadQrCodes,
    reloadFolders: loadFolders,
    createQrCode,
    createQrCodesBatch,
    createFolder,
    updateQrCode,
    deleteQrCode,
    page,
    pagination,
    goToPage,
  }
}
