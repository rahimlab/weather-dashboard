import { useEffect, useRef, useState } from 'react'
import { useWeatherContext } from '../../context/WeatherContext.jsx'
import useGeolocation from '../../hooks/useGeolocation.js'
import { getCurrentWeatherByCoords } from '../../api/weatherApi.js'
import styles from './LocationButton.module.css'

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
    >
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export default function LocationButton() {
  const { setSelectedCity, units } = useWeatherContext()
  const { lat, lon, loading: geoLoading, error: geoError, getLocation } = useGeolocation()
  const [resolving, setResolving] = useState(false)
  const [resolveError, setResolveError] = useState(null)
  const prevCoordsRef = useRef(null)

  // when useGeolocation gives us fresh coords, resolve them to a city name
  useEffect(() => {
    if (lat === null || lon === null) return

    // skip if coords haven't changed since last resolution
    const key = `${lat},${lon}`
    if (prevCoordsRef.current === key) return
    prevCoordsRef.current = key

    let cancelled = false

    async function resolveCity() {
      setResolving(true)
      setResolveError(null)
      try {
        const data = await getCurrentWeatherByCoords(lat, lon, units)
        if (!cancelled) setSelectedCity(data.name)
      } catch (err) {
        if (!cancelled) setResolveError(err.message)
      } finally {
        if (!cancelled) setResolving(false)
      }
    }

    resolveCity()
    return () => { cancelled = true }
  }, [lat, lon, units, setSelectedCity])

  const isLoading = geoLoading || resolving
  const errorMsg = resolveError ?? geoError

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.button}
        onClick={getLocation}
        disabled={isLoading}
        aria-label="Use my current location to find weather"
        title="Use my current location"
      >
        {isLoading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          <PinIcon />
        )}
        Use My Location
      </button>
      {errorMsg && (
        <p className={styles.error} role="alert">{errorMsg}</p>
      )}
    </div>
  )
}
