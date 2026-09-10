export const DEFAULT_QR_COLOR = '#000000'
export const MAX_BATCH_QUANTITY = 1000

export type Folder = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  qrCodeCount: number
}

export type CreateFolderPayload = {
  name: string
}

export type UpdateFolderPayload = {
  name: string
}

export type QrCode = {
  id: string
  name: string
  destinationUrl: string
  folder: string
  color: string
  publicUrl: string
  createdAt: string
}

export type PaginatedQrCodes = {
  items: QrCode[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type CreateQrCodePayload = {
  name: string
  destinationUrl: string
  folder: string
  color?: string
}

export type UpdateQrCodePayload = {
  destinationUrl: string
}

export type CreateQrCodeBatchPayload = {
  prefix: string
  quantity: number
  destinationUrl: string
  folderId: string
  color?: string
}

export type CreateQrCodeBatchResponse = {
  count: number
  items: QrCode[]
}
