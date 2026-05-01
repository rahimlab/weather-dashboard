import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useWeatherContext } from '../context/WeatherContext.jsx'
import { getBackgroundTheme, isDaytime } from '../utils/weatherConditions.js'
import { getCurrentWeatherByCoords } from '../api/weatherApi.js'
import useGeolocation from '../hooks/useGeolocation.js'
import DynamicBackground from '../components/weather/DynamicBackground.jsx'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import SearchBar from '../components/search/SearchBar.jsx'
import LocationButton from '../components/ui/LocationButton.jsx'
import CurrentWeather from '../components/weather/CurrentWeather.jsx'
import WeatherStats from '../components/weather/WeatherStats.jsx'
import WeatherMap from '../components/map/WeatherMap.jsx'
import SkeletonCard from '../components/ui/SkeletonCard.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { currentWeather, loading, error, selectedCity, setSelectedCity, units, refreshWeather } =
    useWeatherContext()
  const { lat, lon, loading: geoLoading, getLocation } = useGeolocation()
  const triedGeoRef = useRef(false)
  const prevCoordsRef = useRef(null)

  // auto-trigger once on mount — silently falls back to welcome state if denied
  useEffect(() => {
    if (!selectedCity && !triedGeoRef.current && navigator.geolocation) {
      triedGeoRef.current = true
      getLocation()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // when useGeolocation gives fresh coords, resolve to city name
  useEffect(() => {
    if (lat === null || lon === null) return
    const key = `${lat},${lon}`
    if (prevCoordsRef.current === key) return
    prevCoordsRef.current = key

    let cancelled = false
    async function resolveCity() {
      try {
        const data = await getCurrentWeatherByCoords(lat, lon, units)
        if (!cancelled) setSelectedCity(data.name)
      } catch {
        // silently ignore — user can search manually
      }
    }
    resolveCity()
    return () => { cancelled = true }
  }, [lat, lon, units, setSelectedCity])

  const theme = currentWeather
    ? getBackgroundTheme(
        currentWeather.weather[0].id,
        isDaytime(currentWeather.dt, currentWeather.sys.sunrise, currentWeather.sys.sunset),
      )
    : 'cloudy'

  const showSkeleton = loading || geoLoading
  const showWelcome = !showSkeleton && !selectedCity
  const showWeather = !loading && !error && selectedCity && currentWeather

  return (
    <DynamicBackground theme={theme}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.srOnly}>WeatherNow Dashboard</h1>

        {showSkeleton && (
          <div className={styles.skeletonWrapper}>
            <SkeletonCard />
          </div>
        )}

        {!showSkeleton && error && (
          <ErrorMessage message={error} onRetry={refreshWeather} />
        )}

        {showWelcome && (
          <div className={styles.welcome}>
            <h2 className={styles.welcomeTitle}>Check the weather anywhere</h2>
            <p className={styles.welcomeSub}>
              Search for a city or use your current location to get started.
            </p>
            <div className={styles.searchRow}>
              <SearchBar />
              <LocationButton />
            </div>
          </div>
        )}

        {showWeather && (
          <div className={styles.weatherContent}>
            <div className={styles.searchRow}>
              <SearchBar />
              <LocationButton />
            </div>
            <div className={styles.weatherGrid}>
              <CurrentWeather data={currentWeather} />
              <WeatherStats data={currentWeather} />
            </div>
            <WeatherMap
              lat={currentWeather.coord.lat}
              lon={currentWeather.coord.lon}
              cityName={currentWeather.name}
              weatherDescription={currentWeather.weather[0].description}
            />
            <Link to="/forecast" className={styles.forecastLink}>
              View 5-Day Forecast
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </DynamicBackground>
  )
}
