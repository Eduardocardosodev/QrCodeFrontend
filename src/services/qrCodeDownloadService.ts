import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'
import JSZip from 'jszip'

export type QrCodeDownloadFormat = 'png' | 'svg' | 'pdf'

export type DownloadOptions = {
  publicUrl: string
  color: string
  fileName: string
  slug: string
}

function normalizeFileName(name: string): string {
  return name.trim().replace(/[^\w\-]+/g, '-').replace(/-+/g, '-') || 'qr-code'
}

function getQrColors(color: string) {
  const dark = color.startsWith('#') ? color : `#${color}`
  return {
    dark,
    light: '#ffffff',
  }
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new Blob([bytes], { type: mime })
}

async function addSlugToPng(dataUrl: string, slug: string): Promise<string> {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    return dataUrl
  }

  const image = new Image()
  image.src = dataUrl
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Não foi possível preparar a imagem.'))
  })

  canvas.width = image.width
  canvas.height = image.height + 48
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0)
  context.fillStyle = '#000000'
  context.font = '20px sans-serif'
  context.textAlign = 'center'
  context.fillText(slug, canvas.width / 2, image.height + 32)
  return canvas.toDataURL('image/png')
}

export function buildQrCodeDownloadFileName(
  fileName: string,
  slug: string,
  format: QrCodeDownloadFormat,
): string {
  return `${normalizeFileName(fileName)}-${normalizeFileName(slug)}.${format}`
}

export function buildUniqueDownloadFileNames(
  items: DownloadOptions[],
  format: QrCodeDownloadFormat,
): string[] {
  const usedCounts = new Map<string, number>()

  return items.map((item) => {
    const baseName = buildQrCodeDownloadFileName(item.fileName, item.slug, format)
    const currentCount = usedCounts.get(baseName) ?? 0
    usedCounts.set(baseName, currentCount + 1)

    if (currentCount === 0) {
      return baseName
    }

    const suffix = `-${currentCount + 1}`
    const extension = `.${format}`
    return baseName.replace(extension, `${suffix}${extension}`)
  })
}

async function createQrCodeDataUrl(publicUrl: string, color: string): Promise<string> {
  return QRCode.toDataURL(publicUrl, {
    width: 512,
    margin: 2,
    color: getQrColors(color),
  })
}

export async function generateQrCodePngBlob({
  publicUrl,
  color,
  slug,
}: DownloadOptions): Promise<Blob> {
  const dataUrl = await createQrCodeDataUrl(publicUrl, color)
  const labeledDataUrl = await addSlugToPng(dataUrl, slug)
  return dataUrlToBlob(labeledDataUrl)
}

export async function generateQrCodeSvgBlob({
  publicUrl,
  color,
  slug,
}: DownloadOptions): Promise<Blob> {
  const svg = await QRCode.toString(publicUrl, {
    type: 'svg',
    margin: 2,
    color: getQrColors(color),
  })

  const labeledSvg = svg.replace(
    '</svg>',
    `<text x="50%" y="99%" text-anchor="middle" font-family="sans-serif" font-size="16">${slug}</text></svg>`,
  )

  return new Blob([labeledSvg], { type: 'image/svg+xml;charset=utf-8' })
}

export async function generateQrCodePdfBlob({
  publicUrl,
  color,
  slug,
}: DownloadOptions): Promise<Blob> {
  const dataUrl = await createQrCodeDataUrl(publicUrl, color)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const qrSize = 80
  const qrX = (pageWidth - qrSize) / 2

  pdf.addImage(dataUrl, 'PNG', qrX, 30, qrSize, qrSize)
  pdf.setFontSize(12)
  pdf.text(slug, pageWidth / 2, 30 + qrSize + 10, { align: 'center' })

  return pdf.output('blob')
}

async function generateQrCodeBlob(
  options: DownloadOptions,
  format: QrCodeDownloadFormat,
): Promise<Blob> {
  if (format === 'png') {
    return generateQrCodePngBlob(options)
  }

  if (format === 'svg') {
    return generateQrCodeSvgBlob(options)
  }

  return generateQrCodePdfBlob(options)
}

export async function downloadQrCodesZip(
  items: DownloadOptions[],
  format: QrCodeDownloadFormat,
  zipFileName = 'qr-codes.zip',
): Promise<void> {
  if (items.length === 0) {
    throw new Error('Nenhum QR Code selecionado para download.')
  }

  const zip = new JSZip()
  const fileNames = buildUniqueDownloadFileNames(items, format)

  for (let index = 0; index < items.length; index += 1) {
    const blob = await generateQrCodeBlob(items[index], format)
    zip.file(fileNames[index], blob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  triggerBlobDownload(zipBlob, zipFileName)
}

export async function downloadQrCodePng(options: DownloadOptions): Promise<void> {
  const blob = await generateQrCodePngBlob(options)
  triggerBlobDownload(blob, buildQrCodeDownloadFileName(options.fileName, options.slug, 'png'))
}

export async function downloadQrCodeSvg(options: DownloadOptions): Promise<void> {
  const blob = await generateQrCodeSvgBlob(options)
  triggerBlobDownload(blob, buildQrCodeDownloadFileName(options.fileName, options.slug, 'svg'))
}

export async function downloadQrCodePdf(options: DownloadOptions): Promise<void> {
  const blob = await generateQrCodePdfBlob(options)
  triggerBlobDownload(blob, buildQrCodeDownloadFileName(options.fileName, options.slug, 'pdf'))
}
