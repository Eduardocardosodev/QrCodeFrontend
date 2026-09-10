import { DEFAULT_QR_COLOR } from '../types/qrCode.ts'

function normalizeColor(color: string): string {
  return color.replace('#', '')
}

export function buildQrCodeImageUrl(publicUrl: string, color = DEFAULT_QR_COLOR): string {
  const params = new URLSearchParams({
    size: '180x180',
    data: publicUrl,
    color: normalizeColor(color),
    bgcolor: 'ffffff',
    margin: '8',
  })

  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
}
