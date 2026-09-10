import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AnalyticsSummary } from './AnalyticsSummary.tsx'

describe('AnalyticsSummary', () => {
  it('mostra total de scans', () => {
    render(
      <AnalyticsSummary
        totalScans={1250}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getByText('Total de scans')).toBeInTheDocument()
    expect(screen.getByText('1250')).toBeInTheDocument()
  })

  it('mostra erro e permite tentar novamente', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(
      <AnalyticsSummary
        totalScans={0}
        isLoading={false}
        error="Não foi possível carregar os dados de analytics."
        onRetry={onRetry}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalled()
  })
})
