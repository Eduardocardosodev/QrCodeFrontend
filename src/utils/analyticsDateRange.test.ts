import { describe, expect, it } from 'vitest'
import {
  getDateRangeForPreset,
  getPresetLabel,
  resolveAnalyticsDateRange,
} from './analyticsDateRange.ts'

const referenceDate = new Date('2026-09-09T15:30:00.000Z')

describe('analyticsDateRange', () => {
  it('gera intervalo de hoje em ISO UTC', () => {
    const range = getDateRangeForPreset('today', referenceDate)

    expect(range.from).toBe('2026-09-09T00:00:00.000Z')
    expect(range.to).toBe('2026-09-09T23:59:59.999Z')
  })

  it('gera intervalo dos últimos 7 dias', () => {
    const range = getDateRangeForPreset('last7days', referenceDate)

    expect(range.from).toBe('2026-09-03T00:00:00.000Z')
    expect(range.to).toBe('2026-09-09T23:59:59.999Z')
  })

  it('gera intervalo personalizado', () => {
    const range = getDateRangeForPreset('custom', referenceDate, {
      from: new Date('2026-09-01T00:00:00.000Z'),
      to: new Date('2026-09-05T00:00:00.000Z'),
    })

    expect(range.from).toBe('2026-09-01T00:00:00.000Z')
    expect(range.to).toBe('2026-09-05T23:59:59.999Z')
  })

  it('resolve intervalo customizado salvo no estado', () => {
    const range = resolveAnalyticsDateRange({
      preset: 'custom',
      from: '2026-09-01T00:00:00.000Z',
      to: '2026-09-30T23:59:59.999Z',
    })

    expect(range.from).toBe('2026-09-01T00:00:00.000Z')
    expect(range.to).toBe('2026-09-30T23:59:59.999Z')
  })

  it('retorna labels em português', () => {
    expect(getPresetLabel('last30days')).toBe('Últimos 30 dias')
    expect(getPresetLabel('custom')).toBe('Personalizado')
  })
})
