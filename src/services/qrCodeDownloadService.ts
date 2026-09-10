import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

type DownloadOptions = {
  publicUrl: string
  color: string
  fileName: string
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

function triggerDataUrlDownload(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.click()
}

export async function downloadQrCodePng({
  publicUrl,
  color,
  fileName,
}: DownloadOptions): Promise<void> {
  const dataUrl = await QRCode.toDataURL(publicUrl, {
    width: 512,
    margin: 2,
    color: getQrColors(color),
  })

  triggerDataUrlDownload(dataUrl, `${normalizeFileName(fileName)}.png`)
}

export async function downloadQrCodeSvg({
  publicUrl,
  color,
  fileName,
}: DownloadOptions): Promise<void> {
  const svg = await QRCode.toString(publicUrl, {
    type: 'svg',
    margin: 2,
    color: getQrColors(color),
  })

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  triggerBlobDownload(blob, `${normalizeFileName(fileName)}.svg`)
}

export async function downloadQrCodePdf({
  publicUrl,
  color,
  fileName,
}: DownloadOptions): Promise<void> {
  const dataUrl = await QRCode.toDataURL(publicUrl, {
    width: 512,
    margin: 2,
    color: getQrColors(color),
  })

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  pdf.setFontSize(16)
  pdf.text(normalizeFileName(fileName), 20, 20)
  pdf.addImage(dataUrl, 'PNG', 20, 30, 80, 80)
  pdf.save(`${normalizeFileName(fileName)}.pdf`)
}
