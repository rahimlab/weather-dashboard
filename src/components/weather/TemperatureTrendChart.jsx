import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useWeatherContext } from '../../context/WeatherContext.jsx'
import styles from './TemperatureTrendChart.module.css'

function dayLabel(dt) {
  return new Date(dt * 1000).toLocaleDateString('en-GB', { weekday: 'short' })
}

// building the tooltip inline so it closes over `units` without extra props drilling
function buildTooltip(units) {
  const unit = units === 'imperial' ? '°F' : '°C'
  return function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#fff', border: '1px solid #dadce0', padding: '0.5rem 0.75rem', borderRadius: 6, fontSize: 13 }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
            {p.name}: {p.value}{unit}
          </p>
        ))}
      </div>
    )
  }
}

export default function TemperatureTrendChart({ dailyForecast }) {
  const { units } = useWeatherContext()

  if (!dailyForecast?.length) {
    return (
      <div className={styles.chartWrapper}>
        <p className={styles.chartTitle}>5-Day Temperature Trend</p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Loading forecast data...
        </p>
      </div>
    )
  }

  const data = dailyForecast.map((day) => ({
    day: dayLabel(day.dt),
    maxTemp: day.tempMax,
    minTemp: day.tempMin,
  }))

  const unit = units === 'imperial' ? '°F' : '°C'
  const TooltipContent = buildTooltip(units)

  return (
    <div className={styles.chartWrapper}>
      <p className={styles.chartTitle}>5-Day Temperature Trend</p>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
          <XAxis dataKey="day" tick={{ fontSize: 13 }} />
          <YAxis tickFormatter={(v) => `${v}${unit}`} tick={{ fontSize: 12 }} width={46} />
          <Tooltip content={<TooltipContent />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="maxTemp"
            name="Max Temp"
            stroke="#e67e22"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="minTemp"
            name="Min Temp"
            stroke="#3498db"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
