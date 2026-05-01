// simple sessionStorage cache with a 10-minute TTL — cuts down on API calls
// when the user navigates back and forth between pages during a session
const PREFIX = 'weather_'

export function setCachedWeather(cityKey, data) {
  const entry = { data, cachedAt: Date.now() }
  sessionStorage.setItem(`${PREFIX}${cityKey}`, JSON.stringify(entry))
}

export function getCachedWeather(cityKey, maxAgeMinutes = 10) {
  const raw = sessionStorage.getItem(`${PREFIX}${cityKey}`)
  if (!raw) return null

  const { data, cachedAt } = JSON.parse(raw)
  const ageMs = Date.now() - cachedAt
  if (ageMs > maxAgeMinutes * 60 * 1000) return null

  return data
}

export function clearWeatherCache() {
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => sessionStorage.removeItem(key))
}
