import { Button } from '../ui/Button.tsx'

type PaginationProps = {
  page: number
  totalPages: number
  isLoading?: boolean
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  isLoading = false,
  onPageChange,
}: PaginationProps) {
  const canGoBack = page > 1
  const canGoForward = page < totalPages

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className="pagination" aria-label="Paginação de scans">
      <Button
        type="button"
        variant="secondary"
        disabled={!canGoBack || isLoading}
        onClick={() => onPageChange(page - 1)}
      >
        Página anterior
      </Button>
      <span className="pagination__info">
        Página {page} de {totalPages}
      </span>
      <Button
        type="button"
        variant="secondary"
        disabled={!canGoForward || isLoading}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima página
      </Button>
    </nav>
  )
}
