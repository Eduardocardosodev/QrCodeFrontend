import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnalyticsMetrics, DeviceType } from '../../types/analytics.ts'

type AnalyticsChartsProps = {
  metrics: AnalyticsMetrics | null
  isLoading: boolean
  error?: string | null
}

const DEVICE_LABELS: Record<DeviceType, string> = {
  mobile: 'Celular',
  tablet: 'Tablet',
  desktop: 'Desktop',
  unknown: 'Desconhecido',
}

function toChartData(values: Record<string, number>) {
  return Object.entries(values)
    .map(([name, totalScans]) => ({ name, totalScans }))
    .sort((a, b) => b.totalScans - a.totalScans)
}

function LocationChart({
  title,
  data,
  fill,
}: {
  title: string
  data: Array<{ name: string; totalScans: number }>
  fill: string
}) {
  return (
    <div className="analytics-chart-card">
      <h2 className="analytics-chart-card__title">{title}</h2>
      {data.length === 0 ? (
        <p className="analytics-charts__state">Sem dados de localização</p>
      ) : (
        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="totalScans" name="Scans" fill={fill} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export function AnalyticsCharts({
  metrics,
  isLoading,
  error,
}: AnalyticsChartsProps) {
  if (isLoading) {
    return <div className="analytics-charts__state">Carregando gráficos...</div>
  }

  if (error) {
    return null
  }

  if (!metrics || metrics.totalScans === 0) {
    return (
      <div className="analytics-charts__state">
        Ainda não houve scans neste período.
      </div>
    )
  }

  const deviceData = Object.entries(metrics.byDevice).map(([name, totalScans]) => ({
    name: DEVICE_LABELS[name as DeviceType] ?? name,
    totalScans: totalScans ?? 0,
  }))

  const browserData = toChartData(metrics.byBrowser)
  const operatingSystemData = toChartData(metrics.byOperatingSystem)
  const countryData = toChartData(metrics.byCountry ?? {})
  const stateData = toChartData(metrics.byState ?? {})
  const cityData = toChartData(metrics.byCity ?? {})

  return (
    <section className="analytics-charts" aria-label="Gráficos de analytics">
      <div className="analytics-chart-card analytics-chart-card--timeline">
        <h2 className="analytics-chart-card__title">Scans por dia</h2>
        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={metrics.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="totalScans"
                name="Scans"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-chart-card">
        <h2 className="analytics-chart-card__title">Dispositivos</h2>
        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deviceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={90} />
              <Tooltip />
              <Bar dataKey="totalScans" name="Scans" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-chart-card">
        <h2 className="analytics-chart-card__title">Navegadores</h2>
        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={browserData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="totalScans" name="Scans" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <LocationChart title="Países" data={countryData} fill="#0f766e" />
      <LocationChart title="Estados" data={stateData} fill="#ca8a04" />
      <LocationChart title="Cidades" data={cityData} fill="#db2777" />

      <div className="analytics-chart-card">
        <h2 className="analytics-chart-card__title">Sistemas operacionais</h2>
        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={operatingSystemData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="totalScans" name="Scans" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
