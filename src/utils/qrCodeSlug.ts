export function getQrCodeSlug(publicUrl: string): string {
  try {
    const pathname = new URL(publicUrl).pathname
    return pathname.split('/').filter(Boolean).pop() ?? publicUrl
  } catch {
    return publicUrl.split('/').filter(Boolean).pop() ?? publicUrl
  }
}
