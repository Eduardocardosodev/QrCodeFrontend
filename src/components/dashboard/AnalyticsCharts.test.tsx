import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AnalyticsCharts } from './AnalyticsCharts.tsx'

describe('AnalyticsCharts', () => {
  it('exibe os quatro grupos de métricas agregadas', () => {
    render(
      <AnalyticsCharts
        isLoading={false}
        error={null}
        metrics={{
          totalScans: 1250,
          byDevice: { mobile: 800, desktop: 350 },
          byBrowser: { Safari: 500, Chrome: 600 },
          byOperatingSystem: { iOS: 480, Android: 320 },
          byCountry: { Brasil: 900 },
          byState: { SP: 500 },
          byCity: { 'São Paulo': 350 },
          timeline: [{ date: '2026-09-09', totalScans: 125 }],
        }}
      />,
    )

    expect(screen.getByText('Scans por dia')).toBeInTheDocument()
    expect(screen.getByText('Dispositivos')).toBeInTheDocument()
    expect(screen.getByText('Navegadores')).toBeInTheDocument()
    expect(screen.getByText('Países')).toBeInTheDocument()
    expect(screen.getByText('Estados')).toBeInTheDocument()
    expect(screen.getByText('Cidades')).toBeInTheDocument()
    expect(screen.getByText('Sistemas operacionais')).toBeInTheDocument()
  })

  it('não cria gráficos quando não há scans', () => {
    render(
      <AnalyticsCharts
        isLoading={false}
        error={null}
        metrics={{
          totalScans: 0,
          byDevice: {},
          byBrowser: {},
          byOperatingSystem: {},
          byCountry: {},
          byState: {},
          byCity: {},
          timeline: [],
        }}
      />,
    )

    expect(
      screen.getByText('Ainda não houve scans neste período.'),
    ).toBeInTheDocument()
  })

  it('informa quando não há dados de localização', () => {
    render(
      <AnalyticsCharts
        isLoading={false}
        error={null}
        metrics={{
          totalScans: 10,
          byDevice: { mobile: 10 },
          byBrowser: { Safari: 10 },
          byOperatingSystem: { iOS: 10 },
          byCountry: {},
          byState: {},
          byCity: {},
          timeline: [],
        }}
      />,
    )

    expect(screen.getAllByText('Sem dados de localização')).toHaveLength(3)
  })
})
