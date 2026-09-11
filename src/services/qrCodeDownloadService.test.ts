import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildQrCodeDownloadFileName,
  buildUniqueDownloadFileNames,
  downloadQrCodePdf,
  downloadQrCodePng,
  downloadQrCodeSvg,
  downloadQrCodesZip,
  generateQrCodePdfBlob,
  generateQrCodePngBlob,
  generateQrCodeSvgBlob,
} from './qrCodeDownloadService.ts'

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,abc'),
    toString: vi.fn().mockResolvedValue('<svg></svg>'),
  },
}))

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
      },
    },
    setFontSize: vi.fn(),
    text: vi.fn(),
    addImage: vi.fn(),
    output: vi.fn().mockReturnValue(new Blob(['pdf'], { type: 'application/pdf' })),
  })),
}))

const baseOptions = {
  publicUrl: 'http://localhost:3000/redirects/abc',
  color: '#000000',
  fileName: 'Cardápio',
  slug: 'abc',
}

describe('qrCodeDownloadService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:qr')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  it('monta nome padronizado com slug', () => {
    expect(buildQrCodeDownloadFileName('Cardápio', 'abc', 'png')).toBe('Card-pio-abc.png')
  })

  it('evita colisão de nomes no lote', () => {
    const names = buildUniqueDownloadFileNames(
      [
        baseOptions,
        { ...baseOptions, slug: 'abc' },
      ],
      'png',
    )

    expect(names).toEqual(['Card-pio-abc.png', 'Card-pio-abc-2.png'])
  })

  it('gera blobs nos três formatos', async () => {
    await expect(generateQrCodePngBlob(baseOptions)).resolves.toBeInstanceOf(Blob)
    await expect(generateQrCodeSvgBlob(baseOptions)).resolves.toBeInstanceOf(Blob)
    await expect(generateQrCodePdfBlob(baseOptions)).resolves.toBeInstanceOf(Blob)
  })

  it('dispara download PNG', async () => {
    await downloadQrCodePng(baseOptions)
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
  })

  it('dispara download SVG', async () => {
    await downloadQrCodeSvg(baseOptions)
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled()
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
  })

  it('gera PDF apenas com QR Code e slug', async () => {
    const { jsPDF } = await import('jspdf')
    await downloadQrCodePdf(baseOptions)

    expect(jsPDF).toHaveBeenCalled()
    const pdfInstance = vi.mocked(jsPDF).mock.results[0]?.value
    expect(pdfInstance.text).toHaveBeenCalledTimes(1)
    expect(pdfInstance.text).toHaveBeenCalledWith('abc', 105, 120, { align: 'center' })
    expect(pdfInstance.text).not.toHaveBeenCalledWith('Card-pio', expect.any(Number), expect.any(Number))
  })

  it('gera ZIP com arquivos selecionados', async () => {
    await downloadQrCodesZip([baseOptions], 'png', 'qr-codes-png.zip')

    expect(globalThis.URL.createObjectURL).toHaveBeenCalled()
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
  })

  it('falha quando não há itens para ZIP', async () => {
    await expect(downloadQrCodesZip([], 'png')).rejects.toThrow(
      'Nenhum QR Code selecionado para download.',
    )
  })
})
