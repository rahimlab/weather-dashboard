import { useState } from 'react'
import { useWeatherContext } from '../../context/WeatherContext.jsx'
import { formatTemperature, formatDate, formatTime } from '../../utils/formatters.js'
import styles from './ForecastCard.module.css'

export default function ForecastCard({ dt, icon, description, maxTemp, minTemp, hourlyEntries = [] }) {
  const { units } = useWeatherContext()
  const [expanded, setExpanded] = useState(false)

  const hasHourly = hourlyEntries.length > 0

  return (
    <article className={styles.card} aria-label={`Forecast for ${formatDate(dt)}`}>
      <p className={styles.date}>{formatDate(dt)}</p>
      <img
        src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
        alt={description}
        className={styles.icon}
        width="56"
        height="56"
      />
      <p className={styles.description}>{description}</p>
      <div className={styles.temps}>
        <span className={styles.high} aria-label={`High: ${formatTemperature(maxTemp, units)}`}>
          {formatTemperature(maxTemp, units)}
        </span>
        <span className={styles.sep} aria-hidden="true">/</span>
        <span className={styles.low} aria-label={`Low: ${formatTemperature(minTemp, units)}`}>
          {formatTemperature(minTemp, units)}
        </span>
      </div>

      {hasHourly && (
        <>
          <button
            className={styles.toggle}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={`hourly-${dt}`}
          >
            <span
              className={`${styles.chevron} ${expanded ? styles.chevronUp : ''}`}
              aria-hidden="true"
            >
              ›
            </span>
            {expanded ? 'Less' : 'Hourly'}
          </button>

          <div
            id={`hourly-${dt}`}
            className={`${styles.detail} ${expanded ? styles.detailOpen : ''}`}
          >
            <ul className={styles.hourlyList}>
              {hourlyEntries.map((entry) => (
                <li key={entry.dt} className={styles.hourSlot}>
                  <span className={styles.slotTime}>{formatTime(entry.dt)}</span>
                  <img
                    src={`https://openweathermap.org/img/wn/${entry.weather[0].icon}.png`}
                    alt={entry.weather[0].description}
                    className={styles.slotIcon}
                    width="24"
                    height="24"
                  />
                  <span className={styles.slotTemp}>
                    {formatTemperature(entry.main.temp, units)}
                  </span>
                  {entry.pop > 0 && (
                    <span className={styles.slotPop} aria-label={`${Math.round(entry.pop * 100)}% chance of rain`}>
                      {Math.round(entry.pop * 100)}%
                    </span>
                  )}
                  <span className={styles.slotHumidity} aria-label={`${entry.main.humidity}% humidity`}>
                    {entry.main.humidity}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </article>
  )
}
