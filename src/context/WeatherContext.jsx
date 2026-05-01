// global state for the whole app — selected city, current weather, forecast,
// units toggle, and loading/error status all live here so any component can
// reach them via useWeatherContext() without prop drilling
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getCurrentWeatherByCity, getFiveDayForecast } from '../api/weatherApi.js'
import { getCachedWeather, setCachedWeather } from '../utils/cache.js'

const WeatherContext = createContext(null)

export function WeatherProvider({ children }) {
  const [selectedCity, setSelectedCity] = useState(null)
  const [units, setUnits] = useState('metric')
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async (city, unitSystem, force = false) => {
    if (!city) return

    const weatherKey = `current_${city}_${unitSystem}`
    const forecastKey = `forecast_${city}_${unitSystem}`

    if (!force) {
      const cachedWeather = getCachedWeather(weatherKey)
      const cachedForecast = getCachedWeather(forecastKey)
      if (cachedWeather && cachedForecast) {
        setCurrentWeather(cachedWeather)
        setForecast(cachedForecast)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeatherByCity(city, unitSystem),
        getFiveDayForecast(city, unitSystem),
      ])
      setCachedWeather(weatherKey, weatherData)
      setCachedWeather(forecastKey, forecastData)
      setCurrentWeather(weatherData)
      setForecast(forecastData)
    } catch (err) {
      setError(err.message)
      setCurrentWeather(null)
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeather(selectedCity, units)
  }, [selectedCity, units, fetchWeather])

  const refreshWeather = useCallback(() => {
    fetchWeather(selectedCity, units, true)
  }, [selectedCity, units, fetchWeather])

  return (
    <WeatherContext.Provider
      value={{
        currentWeather,
        forecast,
        selectedCity,
        units,
        loading,
        error,
        setUnits,
        setSelectedCity,
        refreshWeather,
      }}
    >
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeatherContext() {
  const ctx = useContext(WeatherContext)
  if (!ctx) throw new Error('useWeatherContext must be used inside <WeatherProvider>')
  return ctx
}
