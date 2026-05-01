// maps OWM weather codes to the CSS theme names I use for background styling,
// and works out whether it's daytime so I can pick the right night variant
// OWM condition code ranges: 2xx storm, 3xx drizzle, 5xx rain, 6xx snow,
// 7xx atmosphere (fog/haze/etc), 800 clear, 801-804 clouds
export function getBackgroundTheme(weatherCode, isDay) {
  if (weatherCode >= 200 && weatherCode < 300) return 'stormy'
  if (weatherCode >= 300 && weatherCode < 600) return 'rainy'
  if (weatherCode >= 600 && weatherCode < 700) return 'snowy'
  if (weatherCode >= 700 && weatherCode < 800) return 'foggy'

  if (weatherCode === 800) return isDay ? 'sunny' : 'night-clear'

  // 801-804: partly cloudy to overcast
  return isDay ? 'cloudy' : 'night-cloudy'
}

// convenience: derive isDay from OWM sys.sunrise / sys.sunset unix timestamps
export function isDaytime(currentDt, sunrise, sunset) {
  return currentDt >= sunrise && currentDt < sunset
}
