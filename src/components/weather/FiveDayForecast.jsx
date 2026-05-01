import ForecastCard from './ForecastCard.jsx'
import LoadingSpinner from '../ui/LoadingSpinner.jsx'
import styles from './FiveDayForecast.module.css'

export default function FiveDayForecast({ forecast = [], city, loading = false }) {
  if (loading) return <LoadingSpinner />
  if (!forecast.length) return null

  return (
    <section aria-label={`5-day weather forecast${city ? ` for ${city}` : ''}`}>
      {city && <h2 className={styles.heading}>{city}</h2>}
      <ul className={styles.grid}>
        {forecast.map((day) => (
          <li key={day.date}>
            <ForecastCard
              dt={day.dt}
              icon={day.icon}
              description={day.description}
              maxTemp={day.tempMax}
              minTemp={day.tempMin}
              hourlyEntries={day.entries ?? []}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
