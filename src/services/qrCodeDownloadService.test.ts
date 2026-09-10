import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  downloadQrCodePdf,
  downloadQrCodePng,
  downloadQrCodeSvg,
} from './qrCodeDownloadService.ts'

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,abc'),
    toString: vi.fn().mockResolvedValue('<svg></svg>'),
  },
}))

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}))

describe('qrCodeDownloadService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:qr')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  it('dispara download PNG', async () => {
    await downloadQrCodePng({
      publicUrl: 'http://localhost:3000/redirects/abc',
      color: '#000000',
      fileName: 'Cardápio',
    })

    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
  })

  it('dispara download SVG', async () => {
    await downloadQrCodeSvg({
      publicUrl: 'http://localhost:3000/redirects/abc',
      color: '#000000',
      fileName: 'Cardápio',
    })

    expect(globalThis.URL.createObjectURL).toHaveBeenCalled()
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
  })

  it('gera PDF', async () => {
    const { jsPDF } = await import('jspdf')

    await downloadQrCodePdf({
      publicUrl: 'http://localhost:3000/redirects/abc',
      color: '#000000',
      fileName: 'Cardápio',
    })

    expect(jsPDF).toHaveBeenCalled()
  })
})
