export const DEFAULT_QR_COLOR = '#000000'

export type QrCode = {
  id: string
  name: string
  destinationUrl: string
  folder: string
  color: string
  publicUrl: string
  createdAt: string
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
