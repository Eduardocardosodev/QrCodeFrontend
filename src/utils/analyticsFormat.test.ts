import { describe, expect, it } from 'vitest'
import {
  formatDeviceType,
  formatNullableValue,
  formatScanDateTime,
} from './analyticsFormat.ts'

describe('analyticsFormat', () => {
  it('formata tipo de dispositivo', () => {
    expect(formatDeviceType('mobile')).toBe('Celular')
    expect(formatDeviceType('unknown')).toBe('Desconhecido')
  })

  it('formata data e hora em pt-BR', () => {
    const formatted = formatScanDateTime('2026-09-09T18:30:00.000Z')
    expect(formatted).toContain('09')
    expect(formatted).toContain('2026')
  })

  it('usa fallback para valores nulos', () => {
    expect(formatNullableValue(null)).toBe('—')
    expect(formatNullableValue('Safari')).toBe('Safari')
  })
})
