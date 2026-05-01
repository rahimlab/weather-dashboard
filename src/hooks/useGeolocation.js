import { useCallback, useState } from 'react'

const GEO_ERROR_MESSAGES = {
  1: 'Location access denied. Please search manually.',
  2: 'Your location could not be determined. Try searching by city name instead.',
  3: 'Location request timed out. Please try again.',
}

export default function useGeolocation() {
  const [lat, setLat] = useState(null)
  const [lon, setLon] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude)
        setLon(position.coords.longitude)
        setLoading(false)
      },
      (err) => {
        setError(GEO_ERROR_MESSAGES[err.code] ?? 'An unknown location error occurred.')
        setLoading(false)
      },
      { timeout: 10000 },
    )
  }, [])

  // lat and lon are always numeric once a position resolves — null until then
  return { lat, lon, loading, error, getLocation }
}
