import {
  DEFAULT_QR_COLOR,
  MAX_BATCH_QUANTITY,
  type CreateQrCodeBatchPayload,
  type CreateQrCodePayload,
  type UpdateQrCodePayload,
} from '../types/qrCode.ts'
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
  address?: string
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
    address?: string
    color?: string
  } = {
    name,
    destinationUrl,
    folder,
  }
  const address = payload.address?.trim()
  if (address) {
    body.address = address
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
  name?: string
  destinationUrl?: string
  address?: string
  isInUse?: boolean
} {
  const body: {
    name?: string
    destinationUrl?: string
    address?: string
    isInUse?: boolean
  } = {}

  if (payload.name !== undefined) {
    const name = payload.name.trim()
    if (!name) {
      throw new QrCodePayloadError('Informe o nome do QR Code.')
    }
    body.name = name
  }

  if (payload.destinationUrl !== undefined) {
    const destinationUrl = payload.destinationUrl.trim()
    if (!destinationUrl) {
      throw new QrCodePayloadError('Informe a URL de destino.')
    }
    body.destinationUrl = destinationUrl
  }

  if (payload.isInUse !== undefined) {
    body.isInUse = payload.isInUse
  }

  if (payload.address !== undefined) {
    body.address = payload.address.trim()
  }

  if (Object.keys(body).length === 0) {
    throw new QrCodePayloadError('Informe uma alteração para o QR Code.')
  }

  return body
}

export function buildCreateQrCodeBatchPayload(payload: CreateQrCodeBatchPayload): {
  prefix: string
  quantity: number
  destinationUrl: string
  folderId: string
  address?: string
  color?: string
} {
  const prefix = payload.prefix.trim()
  const destinationUrl = payload.destinationUrl.trim()
  const folderId = payload.folderId.trim()

  if (!prefix) {
    throw new QrCodePayloadError('Informe o prefixo dos QR Codes.')
  }

  if (!Number.isInteger(payload.quantity) || payload.quantity < 1) {
    throw new QrCodePayloadError('Informe uma quantidade válida (mínimo 1).')
  }

  if (payload.quantity > MAX_BATCH_QUANTITY) {
    throw new QrCodePayloadError(`A quantidade máxima é ${MAX_BATCH_QUANTITY}.`)
  }

  if (!destinationUrl) {
    throw new QrCodePayloadError('Informe a URL de destino.')
  }

  if (!folderId) {
    throw new QrCodePayloadError('Selecione uma pasta.')
  }

  const body: {
    prefix: string
    quantity: number
    destinationUrl: string
    folderId: string
    address?: string
    color?: string
  } = {
    prefix,
    quantity: payload.quantity,
    destinationUrl,
    folderId,
  }
  const address = payload.address?.trim()
  if (address) {
    body.address = address
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
