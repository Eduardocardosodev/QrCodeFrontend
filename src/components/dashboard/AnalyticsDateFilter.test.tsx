import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AnalyticsDateFilter } from './AnalyticsDateFilter.tsx'

describe('AnalyticsDateFilter', () => {
  it('dispara mudança de preset', async () => {
    const user = userEvent.setup()
    const onPresetChange = vi.fn()

    render(
      <AnalyticsDateFilter
        dateRange={{ preset: 'last30days' }}
        onPresetChange={onPresetChange}
        onCustomRangeChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Hoje' }))

    expect(onPresetChange).toHaveBeenCalledWith('today')
  })

  it('exibe campos personalizados e aplica intervalo', async () => {
    const user = userEvent.setup()
    const onCustomRangeChange = vi.fn()

    render(
      <AnalyticsDateFilter
        dateRange={{ preset: 'custom' }}
        onPresetChange={vi.fn()}
        onCustomRangeChange={onCustomRangeChange}
      />,
    )

    await user.type(screen.getByLabelText('Data inicial'), '2026-09-01')
    await user.type(screen.getByLabelText('Data final'), '2026-09-09')
    await user.click(screen.getByRole('button', { name: 'Aplicar período' }))

    expect(onCustomRangeChange).toHaveBeenCalled()
  })
})
