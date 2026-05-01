import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { useWeatherContext } from '../../context/WeatherContext.jsx'
import { getCurrentWeatherByCoords } from '../../api/weatherApi.js'
import styles from './WeatherMap.module.css'

// Leaflet's default icon breaks with bundlers because the image URLs get
// rewritten, so I just point it at the imported paths directly
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow })
L.Marker.prototype.options.icon = DefaultIcon

// disable drag on touch so the map doesn't hijack page scrolling
const isTouchDevice =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0)

// sits inside MapContainer so it can access the map's event system
function MapClickHandler({ onLookup }) {
  useMapEvents({
    click: (e) => onLookup(e.latlng.lat, e.latlng.lng),
  })
  return null
}

export default function WeatherMap({ lat, lon, cityName, weatherDescription }) {
  const { units, setSelectedCity } = useWeatherContext()
  const [status, setStatus] = useState(null) // null | 'loading' | 'error'

  if (lat == null || lon == null) return null

  async function handleMapClick(clickLat, clickLon) {
    if (status === 'loading') return
    setStatus('loading')
    try {
      const data = await getCurrentWeatherByCoords(clickLat, clickLon, units)
      setSelectedCity(data.name)
      setStatus(null)
    } catch {
      setStatus('error')
      // clear the error after a few seconds so it doesn't just sit there
      setTimeout(() => setStatus(null), 3000)
    }
  }

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.mapLabelRow}>
        <p className={styles.mapLabel}>Current Location</p>
        {status === 'loading' && (
          <p className={styles.mapStatus}>Looking up location...</p>
        )}
        {status === 'error' && (
          <p className={styles.mapStatusError}>Could not find a city here, try another spot.</p>
        )}
      </div>
      <div className={styles.mapContainer}>
        {/* key forces a full remount when the city changes so the center updates */}
        <MapContainer
          key={`${lat},${lon}`}
          center={[lat, lon]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          dragging={!isTouchDevice}
          tap={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          <Marker position={[lat, lon]} alt={`Map marker for ${cityName}`}>
            <Popup>
              <strong>{cityName}</strong>
              <br />
              {weatherDescription}
            </Popup>
          </Marker>
          <MapClickHandler onLookup={handleMapClick} />
        </MapContainer>
      </div>
      <p className={styles.mapHint}>Click anywhere on the map to load weather for that location</p>
    </div>
  )
}
