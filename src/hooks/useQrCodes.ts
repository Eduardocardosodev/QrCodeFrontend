import { useCallback, useEffect, useMemo, useState } from 'react'
import * as qrCodeService from '../services/qrCodeService.ts'
import { ApiClientError } from '../services/apiClient.ts'
import type {
  CreateQrCodePayload,
  QrCode,
  UpdateQrCodePayload,
} from '../types/qrCode.ts'

export type FolderFilter = 'all' | string

export function useQrCodes() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([])
  const [selectedFolder, setSelectedFolder] = useState<FolderFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadQrCodes = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await qrCodeService.listQrCodes()
      setQrCodes(data)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message)
      } else {
        setError('Não foi possível carregar os QR Codes.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadQrCodes()
  }, [loadQrCodes])

  const folders = useMemo(() => {
    const uniqueFolders = new Set(qrCodes.map((item) => item.folder).filter(Boolean))
    return Array.from(uniqueFolders).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [qrCodes])

  const filteredQrCodes = useMemo(() => {
    if (selectedFolder === 'all') {
      return qrCodes
    }

    return qrCodes.filter((item) => item.folder === selectedFolder)
  }, [qrCodes, selectedFolder])

  const createQrCode = useCallback(async (payload: CreateQrCodePayload) => {
    const created = await qrCodeService.createQrCode(payload)
    setQrCodes((current) => [created, ...current])
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
    selectedFolder,
    setSelectedFolder,
    totalCount: qrCodes.length,
    isLoading,
    error,
    reload: loadQrCodes,
    createQrCode,
    updateQrCode,
    deleteQrCode,
  }
}
