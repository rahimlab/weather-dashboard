import { useWeatherContext } from '../../context/WeatherContext.jsx'
import styles from './ToggleUnits.module.css'

export default function ToggleUnits() {
  const { units, setUnits } = useWeatherContext()
  const isMetric = units === 'metric'

  return (
    <button
      className={styles.toggle}
      onClick={() => setUnits(isMetric ? 'imperial' : 'metric')}
      aria-pressed={isMetric}
      aria-label={`Temperature unit: ${isMetric ? 'Celsius' : 'Fahrenheit'}. Click to switch.`}
    >
      <span className={isMetric ? styles.active : styles.inactive} aria-hidden="true">
        °C
      </span>
      <span className={styles.divider} aria-hidden="true">/</span>
      <span className={!isMetric ? styles.active : styles.inactive} aria-hidden="true">
        °F
      </span>
    </button>
  )
}
