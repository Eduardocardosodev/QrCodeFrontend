export type DateRangePreset =
  | 'today'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'custom'

export type AnalyticsDateRange = {
  preset: DateRangePreset
  from?: string
  to?: string
}

function startOfUtcDay(date: Date): Date {
  const result = new Date(date)
  result.setUTCHours(0, 0, 0, 0)
  return result
}

function endOfUtcDay(date: Date): Date {
  const result = new Date(date)
  result.setUTCHours(23, 59, 59, 999)
  return result
}

function subtractUtcDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() - days)
  return result
}

export function getDateRangeForPreset(
  preset: DateRangePreset,
  referenceDate = new Date(),
  custom?: { from: Date; to: Date },
): { from?: string; to?: string } {
  switch (preset) {
    case 'today': {
      const from = startOfUtcDay(referenceDate)
      const to = endOfUtcDay(referenceDate)
      return { from: from.toISOString(), to: to.toISOString() }
    }
    case 'last7days': {
      const to = endOfUtcDay(referenceDate)
      const from = startOfUtcDay(subtractUtcDays(referenceDate, 6))
      return { from: from.toISOString(), to: to.toISOString() }
    }
    case 'last30days': {
      const to = endOfUtcDay(referenceDate)
      const from = startOfUtcDay(subtractUtcDays(referenceDate, 29))
      return { from: from.toISOString(), to: to.toISOString() }
    }
    case 'thisMonth': {
      const from = new Date(
        Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1),
      )
      const to = endOfUtcDay(referenceDate)
      return { from: from.toISOString(), to: to.toISOString() }
    }
    case 'custom': {
      if (!custom) {
        return {}
      }
      return {
        from: startOfUtcDay(custom.from).toISOString(),
        to: endOfUtcDay(custom.to).toISOString(),
      }
    }
    default:
      return {}
  }
}

export function resolveAnalyticsDateRange(
  range: AnalyticsDateRange,
  referenceDate = new Date(),
): { from?: string; to?: string } {
  if (range.preset === 'custom') {
    if (!range.from || !range.to) {
      return {}
    }
    return {
      from: range.from,
      to: range.to,
    }
  }

  return getDateRangeForPreset(range.preset, referenceDate)
}

export function getPresetLabel(preset: DateRangePreset): string {
  switch (preset) {
    case 'today':
      return 'Hoje'
    case 'last7days':
      return 'Últimos 7 dias'
    case 'last30days':
      return 'Últimos 30 dias'
    case 'thisMonth':
      return 'Este mês'
    case 'custom':
      return 'Personalizado'
    default:
      return preset
  }
}
