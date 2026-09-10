import type { DeviceType } from '../types/analytics.ts'

export function formatDeviceType(deviceType: DeviceType): string {
  switch (deviceType) {
    case 'mobile':
      return 'Celular'
    case 'tablet':
      return 'Tablet'
    case 'desktop':
      return 'Desktop'
    case 'unknown':
      return 'Desconhecido'
    default:
      return deviceType
  }
}

export function formatScanDateTime(occurredAt: string): string {
  const date = new Date(occurredAt)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatNullableValue(value: string | null, fallback = '—'): string {
  return value?.trim() ? value : fallback
}
