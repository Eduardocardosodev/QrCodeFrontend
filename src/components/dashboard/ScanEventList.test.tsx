import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ScanEventList } from './ScanEventList.tsx'

const mockEvent = {
  id: 'scan-1',
  qrCodeId: 'qr-1',
  occurredAt: '2026-09-09T18:30:00.000Z',
  deviceType: 'mobile' as const,
  operatingSystem: 'iOS',
  browser: 'Safari',
  userAgent: 'Mozilla/5.0',
  referer: null,
  country: 'Brasil',
  state: 'SP',
  city: 'São Paulo',
}

describe('ScanEventList', () => {
  it('renderiza evento de scan', () => {
    render(
      <ScanEventList
        items={[mockEvent]}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getAllByText('Celular').length).toBeGreaterThan(0)
    expect(screen.getAllByText('iOS').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Safari').length).toBeGreaterThan(0)
  })

  it('mostra estado vazio', () => {
    render(
      <ScanEventList
        items={[]}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Ainda não houve scans neste período.'),
    ).toBeInTheDocument()
  })
})
