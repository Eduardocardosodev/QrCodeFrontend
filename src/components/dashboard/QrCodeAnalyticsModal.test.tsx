import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { QrCodeAnalyticsModal } from './QrCodeAnalyticsModal.tsx'

describe('QrCodeAnalyticsModal', () => {
  it('exibe resumo e lista de scans', () => {
    render(
      <QrCodeAnalyticsModal
        isOpen
        dateRange={{ preset: 'last30days' }}
        detail={{
          qrCodeId: '1',
          name: 'Cardápio',
          totalScans: 820,
        }}
        metrics={{
          totalScans: 820,
          byDevice: { mobile: 500, desktop: 320 },
          byBrowser: { Safari: 400, Chrome: 420 },
          byOperatingSystem: { iOS: 400, Android: 420 },
          byCountry: { Brasil: 700 },
          byState: { SP: 500 },
          byCity: { 'São Paulo': 350 },
          timeline: [{ date: '2026-09-09', totalScans: 820 }],
        }}
        scans={{
          items: [
            {
              id: 'scan-1',
              qrCodeId: '1',
              occurredAt: '2026-09-09T18:30:00.000Z',
              deviceType: 'mobile',
              operatingSystem: 'iOS',
              browser: 'Safari',
              userAgent: 'Mozilla/5.0',
              referer: null,
              country: 'Brasil',
              state: 'SP',
              city: 'São Paulo',
            },
          ],
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        }}
        isLoading={false}
        error={null}
        page={1}
        onClose={vi.fn()}
        onPageChange={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getByText('Analytics: Cardápio')).toBeInTheDocument()
    expect(screen.getByText('820')).toBeInTheDocument()
    expect(screen.getByText('Celular')).toBeInTheDocument()
  })
})
