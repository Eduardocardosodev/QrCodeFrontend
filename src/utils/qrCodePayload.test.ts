import { describe, expect, it } from 'vitest'
import { DEFAULT_QR_COLOR } from '../types/qrCode.ts'
import {
  buildCreateQrCodePayload,
  buildUpdateQrCodePayload,
  QrCodePayloadError,
} from './qrCodePayload.ts'

describe('qrCodePayload', () => {
  it('monta payload de criação sem cor quando usa o padrão', () => {
    expect(
      buildCreateQrCodePayload({
        name: 'Cardápio',
        destinationUrl: 'https://example.com/menu',
        folder: 'Clientes',
        color: DEFAULT_QR_COLOR,
      }),
    ).toEqual({
      name: 'Cardápio',
      destinationUrl: 'https://example.com/menu',
      folder: 'Clientes',
    })
  })

  it('inclui cor customizada válida', () => {
    expect(
      buildCreateQrCodePayload({
        name: 'Promoção',
        destinationUrl: 'https://example.com/promo',
        folder: 'Marketing',
        color: '#FF0000',
      }),
    ).toEqual({
      name: 'Promoção',
      destinationUrl: 'https://example.com/promo',
      folder: 'Marketing',
      color: '#ff0000',
    })
  })

  it('rejeita cor inválida', () => {
    expect(() =>
      buildCreateQrCodePayload({
        name: 'Promoção',
        destinationUrl: 'https://example.com/promo',
        folder: 'Marketing',
        color: 'red',
      }),
    ).toThrow(QrCodePayloadError)
  })

  it('monta payload de atualização apenas com destinationUrl', () => {
    expect(
      buildUpdateQrCodePayload({
        destinationUrl: 'https://novo-destino.com',
      }),
    ).toEqual({
      destinationUrl: 'https://novo-destino.com',
    })
  })
})
