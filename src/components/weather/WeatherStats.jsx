import { useWeatherContext } from '../../context/WeatherContext.jsx'
import { formatHumidity, formatWindSpeed, formatTime } from '../../utils/formatters.js'
import styles from './WeatherStats.module.css'

// minimal inline SVGs — all 24x24 viewBox, strokeWidth 2, no fill
function HumidityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2C8.5 7 5 10.7 5 14a7 7 0 0 0 14 0c0-3.3-3.5-7-7-12z" />
    </svg>
  )
}

function WindIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2" />
      <path d="M10.59 19.41A2 2 0 1 0 14 16H2" />
      <path d="M15.73 8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PressureIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function SunriseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M17 18a5 5 0 0 0-10 0" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <line x1="1" y1="18" x2="3" y2="18" />
      <line x1="21" y1="18" x2="23" y2="18" />
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <polyline points="8 6 12 2 16 6" />
    </svg>
  )
}

function SunsetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M17 18a5 5 0 0 0-10 0" />
      <line x1="12" y1="9" x2="12" y2="2" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <line x1="1" y1="18" x2="3" y2="18" />
      <line x1="21" y1="18" x2="23" y2="18" />
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <polyline points="16 5 12 9 8 5" />
    </svg>
  )
}

export default function WeatherStats({ data }) {
  const { units } = useWeatherContext()
  if (!data) return null

  const { main, wind, visibility, sys } = data

  const stats = [
    {
      key: 'humidity',
      label: 'Humidity',
      value: formatHumidity(main.humidity),
      Icon: HumidityIcon,
    },
    {
      key: 'wind',
      label: 'Wind speed',
      value: formatWindSpeed(wind.speed, units),
      Icon: WindIcon,
    },
    {
      key: 'visibility',
      label: 'Visibility',
      value: `${(visibility / 1000).toFixed(1)} km`,
      Icon: EyeIcon,
    },
    {
      key: 'pressure',
      label: 'Pressure',
      value: `${main.pressure} hPa`,
      Icon: PressureIcon,
    },
    {
      key: 'sunrise',
      label: 'Sunrise',
      value: formatTime(sys.sunrise),
      Icon: SunriseIcon,
    },
    {
      key: 'sunset',
      label: 'Sunset',
      value: formatTime(sys.sunset),
      Icon: SunsetIcon,
    },
  ]

  return (
    <ul className={styles.grid} aria-label="Weather statistics">
      {stats.map(({ key, label, value, Icon }) => (
        <li key={key} className={styles.stat}>
          <span className={styles.iconWrap}>
            <Icon />
          </span>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
        </li>
      ))}
    </ul>
  )
}
