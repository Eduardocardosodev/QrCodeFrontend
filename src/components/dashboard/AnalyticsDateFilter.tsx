import { useEffect, useState } from 'react'
import {
  getPresetLabel,
  type AnalyticsDateRange,
  type DateRangePreset,
} from '../../utils/analyticsDateRange.ts'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Input.tsx'

const PRESETS: DateRangePreset[] = [
  'today',
  'last7days',
  'last30days',
  'thisMonth',
  'custom',
]

type AnalyticsDateFilterProps = {
  dateRange: AnalyticsDateRange
  onPresetChange: (preset: DateRangePreset) => void
  onCustomRangeChange: (from: Date, to: Date) => void
}

function toDateInputValue(isoDate?: string): string {
  if (!isoDate) {
    return ''
  }

  return isoDate.slice(0, 10)
}

export function AnalyticsDateFilter({
  dateRange,
  onPresetChange,
  onCustomRangeChange,
}: AnalyticsDateFilterProps) {
  const [customFrom, setCustomFrom] = useState(toDateInputValue(dateRange.from))
  const [customTo, setCustomTo] = useState(toDateInputValue(dateRange.to))
  const [customError, setCustomError] = useState<string | null>(null)

  useEffect(() => {
    if (dateRange.preset !== 'custom') {
      return
    }

    setCustomFrom(toDateInputValue(dateRange.from))
    setCustomTo(toDateInputValue(dateRange.to))
  }, [dateRange])

  function handleApplyCustomRange() {
    if (!customFrom || !customTo) {
      setCustomError('Informe as datas inicial e final.')
      return
    }

    const from = new Date(`${customFrom}T00:00:00.000Z`)
    const to = new Date(`${customTo}T00:00:00.000Z`)

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      setCustomError('Informe datas válidas.')
      return
    }

    if (from > to) {
      setCustomError('A data inicial deve ser anterior ou igual à data final.')
      return
    }

    setCustomError(null)
    onCustomRangeChange(from, to)
  }

  return (
    <section className="analytics-filter" aria-label="Filtro de período">
      <div className="analytics-filter__presets">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={
              dateRange.preset === preset
                ? 'analytics-filter__button analytics-filter__button--active'
                : 'analytics-filter__button'
            }
            onClick={() => onPresetChange(preset)}
          >
            {getPresetLabel(preset)}
          </button>
        ))}
      </div>

      {dateRange.preset === 'custom' ? (
        <div className="analytics-filter__custom">
          <Input
            label="Data inicial"
            name="analytics-from"
            type="date"
            value={customFrom}
            onChange={(event) => setCustomFrom(event.target.value)}
          />
          <Input
            label="Data final"
            name="analytics-to"
            type="date"
            value={customTo}
            onChange={(event) => setCustomTo(event.target.value)}
          />
          <Button type="button" onClick={handleApplyCustomRange}>
            Aplicar período
          </Button>
          {customError ? (
            <p className="analytics-filter__error" role="alert">{customError}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
