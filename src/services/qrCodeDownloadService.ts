import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

type DownloadOptions = {
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

function triggerDataUrlDownload(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.click()
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

export async function downloadQrCodePng({
  publicUrl,
  color,
  fileName,
  slug,
}: DownloadOptions): Promise<void> {
  const dataUrl = await QRCode.toDataURL(publicUrl, {
    width: 512,
    margin: 2,
    color: getQrColors(color),
  })

  const labeledDataUrl = await addSlugToPng(dataUrl, slug)
  triggerDataUrlDownload(labeledDataUrl, `${normalizeFileName(fileName)}-${normalizeFileName(slug)}.png`)
}

export async function downloadQrCodeSvg({
  publicUrl,
  color,
  fileName,
  slug,
}: DownloadOptions): Promise<void> {
  const svg = await QRCode.toString(publicUrl, {
    type: 'svg',
    margin: 2,
    color: getQrColors(color),
  })

  const labeledSvg = svg.replace(
    '</svg>',
    `<text x="50%" y="99%" text-anchor="middle" font-family="sans-serif" font-size="16">${slug}</text></svg>`,
  )
  const blob = new Blob([labeledSvg], { type: 'image/svg+xml;charset=utf-8' })
  triggerBlobDownload(blob, `${normalizeFileName(fileName)}.svg`)
}

export async function downloadQrCodePdf({
  publicUrl,
  color,
  fileName,
  slug,
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
  pdf.setFontSize(12)
  pdf.text(slug, 60, 115, { align: 'center' })
  pdf.save(`${normalizeFileName(fileName)}.pdf`)
}
