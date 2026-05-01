import { useWeatherContext } from '../../context/WeatherContext.jsx'
import styles from './TemperatureTrendChart.module.css'

// OWM codes 300-321 are drizzle, 500-531 are rain
function dayHasRain(day) {
  return day.entries.some((e) => {
    const id = e.weather[0].id
    return (id >= 300 && id <= 321) || (id >= 500 && id <= 531)
  })
}

function buildInsights(dailyForecast, units) {
  const insights = []

  // temperature trend: first day vs last day max temp
  const firstMax = dailyForecast[0].tempMax
  const lastMax = dailyForecast[dailyForecast.length - 1].tempMax
  const diff = lastMax - firstMax
  if (diff < -3) insights.push('Temperatures are dropping over the next few days.')
  else if (diff > 3) insights.push('Temperatures are rising through the week.')
  else insights.push('Temperatures are staying fairly stable this week.')

  // rain: count days where any 3-hour slot is drizzle or rain
  const rainyDays = dailyForecast.filter(dayHasRain).length
  if (rainyDays >= 3) insights.push('Rain expected for most of the week.')
  else if (rainyDays >= 1) insights.push('Some rain likely mid-week, keep an umbrella handy.')
  else insights.push('No rain in the forecast, looking dry all week.')

  // heat: threshold depends on whichever unit the API returned temps in
  const heatThreshold = units === 'imperial' ? 82 : 28
  if (dailyForecast.some((day) => day.tempMax > heatThreshold)) {
    insights.push('A warm spell coming, could get quite hot.')
  }

  return insights
}

// simple inline lightbulb so I don't need a separate asset file
function LightbulbIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6H8.3A7.05 7.05 0 0 1 5 9a7 7 0 0 1 7-7z" />
    </svg>
  )
}

export default function WeatherInsights({ dailyForecast }) {
  const { units } = useWeatherContext()

  if (!dailyForecast?.length) return null

  const insights = buildInsights(dailyForecast, units)

  return (
    <div className={styles.insightsCard}>
      <div className={styles.insightsHeader}>
        <LightbulbIcon />
        <span className={styles.insightsTitle}>Weather Insights</span>
      </div>
      {insights.map((text, i) => (
        <p key={i} className={styles.insightItem}>
          &bull; {text}
        </p>
      ))}
    </div>
  )
}
