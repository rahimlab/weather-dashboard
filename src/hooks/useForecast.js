import { useEffect, useState } from 'react'
import { getFiveDayForecast } from '../api/weatherApi.js'
import { getCachedWeather } from '../utils/cache.js'

// exported so ForecastPage can call it directly on context data
export function groupByDay(list) {
  const days = {}

  for (const entry of list) {
    const day = entry.dt_txt.split(' ')[0]
    if (!days[day]) days[day] = { entries: [], dt: entry.dt }
    days[day].entries.push(entry)
  }

  return Object.entries(days).map(([date, { entries, dt }]) => {
    const temps = entries.map((e) => e.main.temp)

    const freq = {}
    for (const e of entries) {
      const cond = e.weather[0].main
      freq[cond] = (freq[cond] || 0) + 1
    }
    const modalCondition = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]

    const representative =
      entries.find(
        (e) => e.weather[0].main === modalCondition && e.weather[0].icon.endsWith('d'),
      ) ?? entries.find((e) => e.weather[0].main === modalCondition)

    return {
      date,
      dt,
      tempMax: Math.round(Math.max(...temps)),
      tempMin: Math.round(Math.min(...temps)),
      condition: modalCondition,
      icon: representative.weather[0].icon,
      description: representative.weather[0].description,
      entries, // raw 3-hour slots for hourly breakdown in ForecastCard
    }
  })
}

export default function useForecast(cityName, units = 'metric') {
  const [dailyForecast, setDailyForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!cityName) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      // check the cache with the same key WeatherContext uses — avoids a
      // redundant fetch when navigating from Dashboard to ForecastPage
      const cached = getCachedWeather(`forecast_${cityName}_${units}`)
      if (cached) {
        if (!cancelled) {
          setDailyForecast(groupByDay(cached.list))
          setLoading(false)
        }
        return
      }

      try {
        const result = await getFiveDayForecast(cityName, units)
        if (!cancelled) setDailyForecast(groupByDay(result.list))
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setDailyForecast([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [cityName, units])

  return { dailyForecast, loading, error }
}
