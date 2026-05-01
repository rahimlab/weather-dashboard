// all OpenWeatherMap fetch calls live here — components should never hit the
// OWM API directly, they import from this file so there's one place to change
// if the endpoint or auth approach ever needs updating
const BASE = 'https://api.openweathermap.org/data/2.5'

function apiKey() {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY
  if (!key) throw new Error('API key not configured. Set VITE_OPENWEATHER_API_KEY.')
  return key
}

async function fetchJSON(url, params) {
  const qs = new URLSearchParams({ appid: apiKey(), ...params }).toString()
  const response = await fetch(`${url}?${qs}`)
  if (!response.ok) {
    throw new Error(`OpenWeatherMap error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

export async function getCurrentWeatherByCity(cityName, units = 'metric') {
  return fetchJSON(`${BASE}/weather`, { q: cityName, units })
}

export async function getCurrentWeatherByCoords(lat, lon, units = 'metric') {
  return fetchJSON(`${BASE}/weather`, { lat, lon, units })
}

export async function getFiveDayForecast(cityName, units = 'metric') {
  return fetchJSON(`${BASE}/forecast`, { q: cityName, units })
}

export async function getForecastByCoords(lat, lon, units = 'metric') {
  return fetchJSON(`${BASE}/forecast`, { lat, lon, units })
}

export async function getCitySuggestions(query) {
  return fetchJSON('https://api.openweathermap.org/geo/1.0/direct', { q: query, limit: 5 })
}
