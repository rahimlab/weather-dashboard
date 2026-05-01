import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWeatherContext } from '../context/WeatherContext.jsx'
import {
  fetchSavedLocations,
  deleteLocation,
} from '../hooks/useSavedLocations.js'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import styles from './SavedLocationsPage.module.css'

function formatSavedDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function PinIllustration() {
  return (
    <svg
      className={styles.emptyIcon}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="28" r="18" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="28" r="7" fill="currentColor" opacity="0.3" />
      <line x1="32" y1="46" x2="32" y2="58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default function SavedLocationsPage() {
  const { setSelectedCity } = useWeatherContext()
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error: err } = await fetchSavedLocations()
      if (err) setError(err.message)
      else setLocations(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleDelete(id, cityName) {
    if (!window.confirm(`Remove ${cityName} from saved locations?`)) return
    setDeletingId(id)
    const { error: err } = await deleteLocation(id)
    if (!err) setLocations((prev) => prev.filter((l) => l.id !== id))
    else setError(err.message)
    setDeletingId(null)
  }

  function handleLoad(location) {
    setSelectedCity(location.city_name)
    navigate('/')
  }

  const count = locations.length

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.heading}>Saved Locations</h1>

        {loading && <LoadingSpinner />}
        {!loading && error && <ErrorMessage message={error} />}

        {!loading && !error && count === 0 && (
          <div className={styles.emptyState}>
            <PinIllustration />
            <p>No saved cities yet.</p>
            <p className={styles.emptyHint}>
              Search for a city on the dashboard and save it.
            </p>
          </div>
        )}

        {!loading && !error && count > 0 && (
          <>
            <p className={styles.countLine}>
              {count === 1 ? 'You have 1 saved location.' : `You have ${count} saved locations.`}
            </p>

            {/* desktop table */}
            <div className={styles.tableWrapper} role="region" aria-label="Saved locations table">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">City</th>
                    <th scope="col">Country</th>
                    <th scope="col">Date Saved</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc) => (
                    <tr key={loc.id}>
                      <td className={styles.tdCity}>{loc.city_name}</td>
                      <td className={styles.tdCountry}>{loc.country_code}</td>
                      <td className={styles.tdDate}>{formatSavedDate(loc.created_at)}</td>
                      <td className={styles.tdActions}>
                        <button
                          className={styles.loadBtn}
                          onClick={() => handleLoad(loc)}
                        >
                          Load weather
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(loc.id, loc.city_name)}
                          disabled={deletingId === loc.id}
                          aria-label={`Delete ${loc.city_name}`}
                        >
                          {deletingId === loc.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile card list */}
            <ul className={styles.cardList}>
              {locations.map((loc) => (
                <li key={loc.id} className={styles.card}>
                  <div className={styles.cardInfo}>
                    <span className={styles.cityName}>{loc.city_name}</span>
                    <span className={styles.countryCode}>{loc.country_code}</span>
                    <span className={styles.savedDate}>{formatSavedDate(loc.created_at)}</span>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.loadBtn}
                      onClick={() => handleLoad(loc)}
                    >
                      Load
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(loc.id, loc.city_name)}
                      disabled={deletingId === loc.id}
                      aria-label={`Delete ${loc.city_name}`}
                    >
                      {deletingId === loc.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
