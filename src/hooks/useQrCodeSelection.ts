import { useCallback, useEffect, useState } from 'react'
import type { QrCode } from '../types/qrCode.ts'
import { getQrCodeSlug } from '../utils/qrCodeSlug.ts'
import * as qrCodeService from '../services/qrCodeService.ts'
import type { UsageFilter } from './useQrCodes.ts'

type UseQrCodeSelectionOptions = {
  usageFilter: UsageFilter
  selectedFolder: 'all' | string
  searchTerm: string
}

export function filterQrCodesByFolderAndSearch(
  qrCodes: QrCode[],
  selectedFolder: 'all' | string,
  searchTerm: string,
) {
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase('pt-BR')
  const byFolder =
    selectedFolder === 'all'
      ? qrCodes
      : qrCodes.filter((qrCode) => qrCode.folder === selectedFolder)

  if (!normalizedSearchTerm) {
    return byFolder
  }

  return byFolder.filter((qrCode) => {
    const name = qrCode.name.toLocaleLowerCase('pt-BR')
    const slug = getQrCodeSlug(qrCode.publicUrl).toLocaleLowerCase('pt-BR')
    return name.includes(normalizedSearchTerm) || slug.includes(normalizedSearchTerm)
  })
}

export function useQrCodeSelection({
  usageFilter,
  selectedFolder,
  searchTerm,
}: UseQrCodeSelectionOptions) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [selectedQrCodesById, setSelectedQrCodesById] = useState<Map<string, QrCode>>(
    () => new Map(),
  )
  const [filteredCount, setFilteredCount] = useState(0)
  const [isSelectingAll, setIsSelectingAll] = useState(false)
  const [selectionError, setSelectionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        const allQrCodes = await qrCodeService.listAllQrCodes({
          ...(usageFilter === 'all' ? {} : { isInUse: usageFilter === 'inUse' }),
        })
        if (cancelled) {
          return
        }
        setFilteredCount(
          filterQrCodesByFolderAndSearch(allQrCodes, selectedFolder, searchTerm).length,
        )
      } catch {
        if (!cancelled) {
          setFilteredCount(0)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [searchTerm, selectedFolder, usageFilter])

  const toggleSelection = useCallback((qrCode: QrCode) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(qrCode.id)) {
        next.delete(qrCode.id)
      } else {
        next.add(qrCode.id)
      }
      return next
    })

    setSelectedQrCodesById((current) => {
      const next = new Map(current)
      if (next.has(qrCode.id)) {
        next.delete(qrCode.id)
      } else {
        next.set(qrCode.id, qrCode)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setSelectedQrCodesById(new Map())
    setSelectionError(null)
  }, [])

  const selectFiltered = useCallback(async () => {
    setIsSelectingAll(true)
    setSelectionError(null)

    try {
      const allQrCodes = await qrCodeService.listAllQrCodes({
        ...(usageFilter === 'all' ? {} : { isInUse: usageFilter === 'inUse' }),
      })
      const filteredQrCodes = filterQrCodesByFolderAndSearch(
        allQrCodes,
        selectedFolder,
        searchTerm,
      )

      setSelectedIds(new Set(filteredQrCodes.map((qrCode) => qrCode.id)))
      setSelectedQrCodesById(new Map(filteredQrCodes.map((qrCode) => [qrCode.id, qrCode])))
      setFilteredCount(filteredQrCodes.length)
    } catch {
      setSelectionError('Não foi possível selecionar os QR Codes filtrados.')
    } finally {
      setIsSelectingAll(false)
    }
  }, [searchTerm, selectedFolder, usageFilter])

  const getSelectedQrCodes = useCallback(async () => {
    return Array.from(selectedQrCodesById.values())
  }, [selectedQrCodesById])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  )

  return {
    selectedCount: selectedIds.size,
    filteredCount,
    isSelectingAll,
    selectionError,
    toggleSelection,
    clearSelection,
    selectFiltered,
    getSelectedQrCodes,
    isSelected,
  }
}
