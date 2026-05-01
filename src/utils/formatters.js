export function formatTemperature(temp, units = 'metric') {
  const rounded = Math.round(temp)
  return units === 'imperial' ? `${rounded}°F` : `${rounded}°C`
}

export function formatWindSpeed(speed, units = 'metric') {
  if (units === 'imperial') {
    // OWM already returns mph when units=imperial
    return `${speed.toFixed(1)} mph`
  }
  return `${speed.toFixed(1)} m/s`
}

export function formatHumidity(h) {
  return `${h}%`
}

export function formatDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000)
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}
