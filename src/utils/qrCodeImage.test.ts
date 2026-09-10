import { describe, expect, it } from 'vitest'
import { buildQrCodeImageUrl } from './qrCodeImage.ts'

describe('buildQrCodeImageUrl', () => {
  it('gera URL de imagem com cor preta por padrão', () => {
    const url = buildQrCodeImageUrl('http://localhost:3000/redirects/abc12xyz')

    expect(url).toContain('create-qr-code')
    expect(url).toContain('color=000000')
    expect(url).toContain(encodeURIComponent('http://localhost:3000/redirects/abc12xyz'))
  })
})
