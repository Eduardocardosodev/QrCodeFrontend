import clsx from 'clsx'
import type { FolderFilter as FolderFilterValue } from '../../hooks/useQrCodes.ts'

type FolderFilterProps = {
  folders: string[]
  selectedFolder: FolderFilterValue
  onChange: (folder: FolderFilterValue) => void
}

export function FolderFilter({ folders, selectedFolder, onChange }: FolderFilterProps) {
  const options: Array<{ value: FolderFilterValue; label: string }> = [
    { value: 'all', label: 'Todos' },
    ...folders.map((folder) => ({ value: folder, label: folder })),
  ]

  return (
    <div className="folder-filter" role="tablist" aria-label="Filtrar por pasta">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={selectedFolder === option.value}
          className={clsx(
            'folder-filter__button',
            selectedFolder === option.value && 'folder-filter__button--active',
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
