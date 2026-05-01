// TEST EVIDENCE TABLE
// ID     | Description                                              | Input / Action                        | Expected Output          | Notes
// --------|----------------------------------------------------------|---------------------------------------|--------------------------|---------------------------------------------
// TC-U-16 | Set then get within default maxAge returns data          | set → get (no time advance)           | original data object     | Default maxAge is 10 minutes
// TC-U-17 | Get after maxAge exceeded returns null                   | set → advance 11 min → get            | null                     | vi.useFakeTimers() controls Date.now()
// TC-U-18 | clearWeatherCache removes all weather_ prefixed entries  | set two cities → clear → get both     | null for both            | Non-weather_ keys must survive
// TC-U-19 | Missing key returns null                                 | get on key never set                  | null                     | sessionStorage.getItem returns null
// TC-U-20 | Custom maxAge respected                                  | set → advance 4 min → get(maxAge=3)   | null                     | 4 min > 3 min custom maxAge
// TC-U-21 | Stored data survives just under the default maxAge       | set → advance 9.9 min → get           | original data object     | 9 min 54 s < 10 min threshold
// TC-U-22 | clearWeatherCache leaves non-weather_ keys untouched     | set weather_ + other_ key → clear     | other_ key still present | Prefix filter must be exact

import { setCachedWeather, getCachedWeather, clearWeatherCache } from '../../../src/utils/cache.js'

const SAMPLE_DATA = { city: 'London', temp: 15, humidity: 72 }
const TEN_MIN_MS = 10 * 60 * 1000

beforeEach(() => {
  sessionStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('setCachedWeather + getCachedWeather', () => {
  it('TC-U-16: returns stored data when retrieved immediately', () => {
    setCachedWeather('london_metric', SAMPLE_DATA)
    const result = getCachedWeather('london_metric')
    expect(result).toEqual(SAMPLE_DATA)
  })

  it('TC-U-17: returns null after the default 10-minute maxAge has elapsed', () => {
    setCachedWeather('london_metric', SAMPLE_DATA)
    vi.advanceTimersByTime(TEN_MIN_MS + 60_000) // 11 minutes
    expect(getCachedWeather('london_metric')).toBeNull()
  })

  it('TC-U-19: returns null for a key that was never set', () => {
    expect(getCachedWeather('nonexistent_key')).toBeNull()
  })

  it('TC-U-20: respects a custom maxAge passed to getCachedWeather', () => {
    setCachedWeather('london_metric', SAMPLE_DATA)
    vi.advanceTimersByTime(4 * 60 * 1000) // 4 minutes
    // custom maxAge of 3 minutes means 4 minutes elapsed → stale
    expect(getCachedWeather('london_metric', 3)).toBeNull()
  })

  it('TC-U-21: returns data when just under the default maxAge threshold', () => {
    setCachedWeather('london_metric', SAMPLE_DATA)
    vi.advanceTimersByTime(TEN_MIN_MS - 6_000) // 9 minutes 54 seconds
    expect(getCachedWeather('london_metric')).toEqual(SAMPLE_DATA)
  })

  it('stores and retrieves multiple independent city keys', () => {
    const parisData = { city: 'Paris', temp: 10 }
    setCachedWeather('london_metric', SAMPLE_DATA)
    setCachedWeather('paris_metric', parisData)
    expect(getCachedWeather('london_metric')).toEqual(SAMPLE_DATA)
    expect(getCachedWeather('paris_metric')).toEqual(parisData)
  })

  it('overwrites a previously cached entry with fresh data', () => {
    const freshData = { city: 'London', temp: 20 }
    setCachedWeather('london_metric', SAMPLE_DATA)
    setCachedWeather('london_metric', freshData)
    expect(getCachedWeather('london_metric')).toEqual(freshData)
  })
})

describe('clearWeatherCache', () => {
  it('TC-U-18: removes all entries for both cached cities', () => {
    setCachedWeather('london_metric', SAMPLE_DATA)
    setCachedWeather('paris_metric', { city: 'Paris', temp: 10 })

    clearWeatherCache()

    expect(getCachedWeather('london_metric')).toBeNull()
    expect(getCachedWeather('paris_metric')).toBeNull()
  })

  it('TC-U-22: does not remove sessionStorage keys without the weather_ prefix', () => {
    setCachedWeather('london_metric', SAMPLE_DATA)
    sessionStorage.setItem('user_prefs', 'dark-mode')
    sessionStorage.setItem('other_app_key', 'some-value')

    clearWeatherCache()

    expect(sessionStorage.getItem('user_prefs')).toBe('dark-mode')
    expect(sessionStorage.getItem('other_app_key')).toBe('some-value')
    expect(getCachedWeather('london_metric')).toBeNull()
  })

  it('is a no-op when the cache is already empty', () => {
    expect(() => clearWeatherCache()).not.toThrow()
  })
})
