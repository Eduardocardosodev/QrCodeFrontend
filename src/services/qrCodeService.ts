import { apiRequest } from './apiClient.ts'
import type {
  CreateQrCodePayload,
  QrCode,
  UpdateQrCodePayload,
} from '../types/qrCode.ts'
import {
  buildCreateQrCodePayload,
  buildUpdateQrCodePayload,
} from '../utils/qrCodePayload.ts'

const QR_CODE_ENDPOINTS = {
  list: '/qr-codes',
  create: '/qr-codes',
  update: (id: string) => `/qr-codes/${id}`,
  delete: (id: string) => `/qr-codes/${id}`,
} as const

export async function listQrCodes(): Promise<QrCode[]> {
  return apiRequest<QrCode[]>(QR_CODE_ENDPOINTS.list)
}

export async function createQrCode(payload: CreateQrCodePayload): Promise<QrCode> {
  return apiRequest<QrCode>(QR_CODE_ENDPOINTS.create, {
    method: 'POST',
    body: buildCreateQrCodePayload(payload),
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
