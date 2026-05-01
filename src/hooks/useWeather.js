import { useCallback, useEffect, useState } from 'react'
import { getCurrentWeatherByCity } from '../api/weatherApi.js'
import { getCachedWeather, setCachedWeather } from '../utils/cache.js'

export default function useWeather(cityName, units = 'metric') {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // the full OWM response always includes coord: { lat, lon } — WeatherMap depends on it
  const fetchWeather = useCallback(async (city, unitSystem, force = false) => {
    if (!city) return

    const cacheKey = `current_${city}_${unitSystem}`

    if (!force) {
      const cached = getCachedWeather(cacheKey)
      if (cached) {
        setData(cached)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getCurrentWeatherByCity(city, unitSystem)
      setCachedWeather(cacheKey, result)
      setData(result)
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeather(cityName, units)
  }, [cityName, units, fetchWeather])

  // force=true skips the cache so callers always get a fresh API response
  const refetch = useCallback(
    () => fetchWeather(cityName, units, true),
    [cityName, units, fetchWeather],
  )

  return { data, loading, error, refetch }
}
