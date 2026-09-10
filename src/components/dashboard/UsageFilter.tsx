import clsx from 'clsx'
import type { UsageFilter as UsageFilterValue } from '../../hooks/useQrCodes.ts'

type UsageFilterProps = {
  value: UsageFilterValue
  onChange: (value: UsageFilterValue) => void
}

const options: Array<{ value: UsageFilterValue; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'inUse', label: 'Em uso' },
  { value: 'available', label: 'Disponíveis' },
]

export function UsageFilter({ value, onChange }: UsageFilterProps) {
  return (
    <div className="folder-filter" role="tablist" aria-label="Filtrar por uso">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={clsx(
            'folder-filter__button',
            value === option.value && 'folder-filter__button--active',
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
