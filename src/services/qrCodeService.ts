import { apiRequest } from './apiClient.ts'
import type {
  CreateQrCodeBatchPayload,
  CreateQrCodeBatchResponse,
  CreateFolderPayload,
  CreateQrCodePayload,
  Folder,
  PaginatedQrCodes,
  QrCode,
  UpdateFolderPayload,
  UpdateQrCodePayload,
} from '../types/qrCode.ts'
import {
  buildCreateQrCodeBatchPayload,
  buildCreateQrCodePayload,
  buildUpdateQrCodePayload,
} from '../utils/qrCodePayload.ts'

const QR_CODE_ENDPOINTS = {
  list: '/qr-codes',
  create: '/qr-codes',
  createBatch: '/qr-codes/batch',
  folders: '/folders',
  folder: (id: string) => `/folders/${id}`,
  update: (id: string) => `/qr-codes/${id}`,
  delete: (id: string) => `/qr-codes/${id}`,
} as const

export async function listQrCodes(
  options: { page?: number; limit?: number } = {},
): Promise<PaginatedQrCodes> {
  const params = new URLSearchParams({
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 20),
  })
  return apiRequest<PaginatedQrCodes>(`${QR_CODE_ENDPOINTS.list}?${params.toString()}`)
}

export async function listFolders(): Promise<Folder[]> {
  return apiRequest<Folder[]>(QR_CODE_ENDPOINTS.folders)
}

export async function createFolder(payload: CreateFolderPayload): Promise<Folder> {
  return apiRequest<Folder>(QR_CODE_ENDPOINTS.folders, {
    method: 'POST',
    body: { name: payload.name.trim() },
  })
}

export async function getFolder(id: string): Promise<Folder> {
  return apiRequest<Folder>(QR_CODE_ENDPOINTS.folder(id))
}

export async function updateFolder(
  id: string,
  payload: UpdateFolderPayload,
): Promise<Folder> {
  return apiRequest<Folder>(QR_CODE_ENDPOINTS.folder(id), {
    method: 'PATCH',
    body: { name: payload.name.trim() },
  })
}

export async function deleteFolder(id: string): Promise<void> {
  return apiRequest<void>(QR_CODE_ENDPOINTS.folder(id), {
    method: 'DELETE',
  })
}

export async function createQrCode(payload: CreateQrCodePayload): Promise<QrCode> {
  return apiRequest<QrCode>(QR_CODE_ENDPOINTS.create, {
    method: 'POST',
    body: buildCreateQrCodePayload(payload),
  })
}

export async function createQrCodesBatch(
  payload: CreateQrCodeBatchPayload,
): Promise<CreateQrCodeBatchResponse> {
  return apiRequest<CreateQrCodeBatchResponse>(QR_CODE_ENDPOINTS.createBatch, {
    method: 'POST',
    body: buildCreateQrCodeBatchPayload(payload),
  })
}

export async function updateQrCode(
  id: string,
  payload: UpdateQrCodePayload,
): Promise<QrCode> {
  return apiRequest<QrCode>(QR_CODE_ENDPOINTS.update(id), {
    method: 'PATCH',
    body: buildUpdateQrCodePayload(payload),
  })
}

export async function deleteQrCode(id: string): Promise<void> {
  return apiRequest<void>(QR_CODE_ENDPOINTS.delete(id), {
    method: 'DELETE',
  })
}
