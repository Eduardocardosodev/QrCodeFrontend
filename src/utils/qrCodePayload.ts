import { DEFAULT_QR_COLOR, type CreateQrCodePayload, type UpdateQrCodePayload } from '../types/qrCode.ts'
import { isValidHexColor } from './validation.ts'

export class QrCodePayloadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QrCodePayloadError'
  }
}

export function buildCreateQrCodePayload(payload: CreateQrCodePayload): {
  name: string
  destinationUrl: string
  folder: string
  color?: string
} {
  const name = payload.name.trim()
  const destinationUrl = payload.destinationUrl.trim()
  const folder = payload.folder.trim()

  if (!name) {
    throw new QrCodePayloadError('Informe o nome do QR Code.')
  }

  if (!destinationUrl) {
    throw new QrCodePayloadError('Informe a URL de destino.')
  }

  if (!folder) {
    throw new QrCodePayloadError('Informe a pasta.')
  }

  const body: {
    name: string
    destinationUrl: string
    folder: string
    color?: string
  } = {
    name,
    destinationUrl,
    folder,
  }

  const color = payload.color?.trim() || DEFAULT_QR_COLOR
  if (color !== DEFAULT_QR_COLOR) {
    if (!isValidHexColor(color)) {
      throw new QrCodePayloadError('Informe uma cor válida no formato #RRGGBB.')
    }
    body.color = color.toLowerCase()
  }

  return body
}

export function buildUpdateQrCodePayload(payload: UpdateQrCodePayload): {
  destinationUrl: string
} {
  const destinationUrl = payload.destinationUrl.trim()

  if (!destinationUrl) {
    throw new QrCodePayloadError('Informe a URL de destino.')
  }

  return { destinationUrl }
}
