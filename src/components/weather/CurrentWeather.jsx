import { useState } from 'react'
import { useWeatherContext } from '../../context/WeatherContext.jsx'
import { saveLocation } from '../../hooks/useSavedLocations.js'
import { formatTemperature, formatDate } from '../../utils/formatters.js'
import styles from './CurrentWeather.module.css'

export default function CurrentWeather({ data }) {
  const { units } = useWeatherContext()
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | error

  if (!data) return null

  const { name, sys, coord, weather, main, dt } = data

  async function handleSave() {
    setSaveStatus('saving')
    const { error } = await saveLocation(name, sys.country, coord.lat, coord.lon)
    if (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } else {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    }
  }

  const saveLabel = {
    idle: '♡ Save city',
    saving: 'Saving…',
    saved: '✓ Saved!',
    error: '✗ Save failed',
  }[saveStatus]

  return (
    <article className={styles.card} aria-label={`Current weather for ${name}`}>
      <div className={styles.top}>
        <div className={styles.location}>
          <h2 className={styles.city}>
            {name}
            <span className={styles.country}>, {sys.country}</span>
          </h2>
          <p className={styles.date}>{formatDate(dt)}</p>
        </div>
        <button
          className={`${styles.saveBtn} ${styles[`save_${saveStatus}`]}`}
          onClick={handleSave}
          disabled={saveStatus !== 'idle'}
          aria-label={`Save ${name} to your saved locations`}
        >
          {saveLabel}
        </button>
      </div>

      <div className={styles.tempRow}>
        <img
          src={`https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
          alt={weather[0].description}
          className={styles.icon}
          width="80"
          height="80"
        />
        <span className={styles.temp} aria-label={`Temperature: ${formatTemperature(main.temp, units)}`}>
          {formatTemperature(main.temp, units)}
        </span>
      </div>

      <p className={styles.description}>{weather[0].description}</p>
      <p className={styles.feelsLike}>
        Feels like {formatTemperature(main.feels_like, units)}
      </p>
    </article>
  )
}
