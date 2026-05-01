// TEST EVIDENCE TABLE
// ID     | Description                                                    | Input                                                          | Expected Output                                              | Notes
// --------|----------------------------------------------------------------|----------------------------------------------------------------|--------------------------------------------------------------|---------------------------------------------
// TC-U-01 | formatTemperature returns °C for metric units                  | (15, 'metric')                                                 | '15°C'                                                       | Curated regression — formatters.js
// TC-U-09 | getBackgroundTheme returns 'sunny' for clear-sky daytime       | (800, true)                                                    | 'sunny'                                                      | Curated regression — weatherConditions.js
// TC-U-16 | getCachedWeather returns stored data within maxAge              | setCachedWeather → getCachedWeather immediately                | original data object                                         | Curated regression — cache.js
// TC-C-01 | SearchBar renders searchbox with correct aria-label            | render <SearchBar />                                           | searchbox name="Search for a city"                           | Curated regression — SearchBar.jsx
// TC-C-06 | CurrentWeather renders city name from data prop                | render <CurrentWeather data={fixture} />                       | 'London' visible                                             | Curated regression — CurrentWeather.jsx
// TC-C-14 | FiveDayForecast renders exactly 5 list items                   | render <FiveDayForecast forecast={5-day fixture} />            | 5 listitem elements                                          | Curated regression — FiveDayForecast.jsx
// TC-H-01 | useWeather returns loading=true synchronously on first call    | renderHook(() => useWeather('London'))                         | result.current.loading === true                              | Curated regression — useWeather.js
// TC-H-04 | useWeather uses cache and skips fetch when cache is warm       | setCachedWeather then renderHook                               | fetch not called; data matches fixture                       | Curated regression — useWeather.js
// TC-I-01 | getCurrentWeatherByCity resolves with correct fixture shape     | getCurrentWeatherByCity('London')                              | { name:'London', main:{temp:15,humidity:72}, wind:{...} }    | Curated regression — weatherApi.js + MSW
// TC-I-03 | getFiveDayForecast resolves with list of length 40             | getFiveDayForecast('London') with MSW 40-slot override         | data.list.length === 40                                      | Curated regression — weatherApi.js + MSW
// TC-I-06 | getForecastByCoords resolves with a list array                 | getForecastByCoords(51.5, -0.12)                               | Array.isArray(data.list) === true                            | Curated regression — weatherApi.js + MSW

import { vi, describe, it, expect, afterEach, afterAll, beforeEach } from 'vitest'
import { render, screen, renderHook } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

// utility imports
import { formatTemperature } from '../../src/utils/formatters.js'
import { getBackgroundTheme } from '../../src/utils/weatherConditions.js'
import { setCachedWeather, getCachedWeather } from '../../src/utils/cache.js'

// API layer imports (MSW intercepts their fetch calls)
import {
  getCurrentWeatherByCity,
  getFiveDayForecast,
  getForecastByCoords,
} from '../../src/api/weatherApi.js'

// hook imports
import useWeather from '../../src/hooks/useWeather.js'

// component imports — mocks below must be declared before these imports hoist
import { useWeatherContext } from '../../src/context/WeatherContext.jsx'
import { saveLocation } from '../../src/hooks/useSavedLocations.js'
import SearchBar from '../../src/components/search/SearchBar.jsx'
import CurrentWeather from '../../src/components/weather/CurrentWeather.jsx'
import FiveDayForecast from '../../src/components/weather/FiveDayForecast.jsx'

// shared test data
import { server } from '../setup.js'
import { currentWeatherFixture, forecastFixture } from '../fixtures/weatherFixtures.js'

// context mock — needed for SearchBar, CurrentWeather, FiveDayForecast
vi.mock('../../src/context/WeatherContext.jsx', () => ({
  useWeatherContext: vi.fn(),
}))

// saved-locations mock — needed so CurrentWeather's save flow doesn't hit Supabase
vi.mock('../../src/hooks/useSavedLocations.js', () => ({
  saveLocation: vi.fn(),
  fetchSavedLocations: vi.fn(),
  deleteLocation: vi.fn(),
}))

// 40-slot forecast used by TC-I-03
const fortyItemForecast = {
  ...forecastFixture,
  cnt: 40,
  list: Array.from({ length: 40 }, (_, i) => ({
    ...forecastFixture.list[i % forecastFixture.list.length],
    dt: forecastFixture.list[0].dt + i * 10800,
    dt_txt: `2026-04-28 ${String((i * 3) % 24).padStart(2, '0')}:00:00`,
  })),
}

// five-day data in the shape FiveDayForecast expects (from groupByDay output)
const mockForecast = forecastFixture.list.map((entry) => ({
  date: entry.dt_txt.split(' ')[0],
  dt: entry.dt,
  tempMax: Math.round(entry.main.temp_max),
  tempMin: Math.round(entry.main.temp_min),
  condition: entry.weather[0].main,
  icon: entry.weather[0].icon,
  description: entry.weather[0].description,
  entries: [],
}))

// result collection — afterEach pushes a record for every curated test
const results = []
let _meta = null  // set at start of each test
let _actual = ''  // set just before the main assertion

afterEach(({ task }) => {
  if (!_meta) return
  const passed = task.result?.state === 'pass'
  results.push({
    id: _meta.id,
    description: _meta.description,
    input: _meta.input,
    expected: _meta.expected,
    actual: passed
      ? _actual
      : (task.result?.errors?.[0]?.message?.replace(/\n/g, ' ').slice(0, 120) ?? 'Test failed'),
    status: passed ? 'PASS' : 'FAIL',
    timestamp: new Date().toISOString(),
  })
  _meta = null
  _actual = ''
})

afterAll(() => {
  const pass = results.filter((r) => r.status === 'PASS').length
  const fail = results.filter((r) => r.status === 'FAIL').length
  console.log(`\n[regression] ${pass} PASS  ${fail} FAIL  (${results.length} total)\n`)
  results.forEach((r) => {
    const icon = r.status === 'PASS' ? '✓' : '✗'
    console.log(`  ${icon} ${r.id}: ${r.actual}`)
  })
})

// ── Utilities ─────────────────────────────────────────────────────────────────

describe('regression — utilities', () => {
  it('TC-U-01: formatTemperature returns "15°C" for (15, metric)', () => {
    _meta = {
      id: 'TC-U-01',
      description: 'formatTemperature returns °C suffix for metric units',
      input: "(15, 'metric')",
      expected: "'15°C'",
    }
    const result = formatTemperature(15, 'metric')
    _actual = result
    expect(result).toBe('15°C')
  })

  it('TC-U-09: getBackgroundTheme returns "sunny" for clear-sky daytime (800, true)', () => {
    _meta = {
      id: 'TC-U-09',
      description: 'getBackgroundTheme returns "sunny" for clear-sky daytime (code 800)',
      input: '(800, true)',
      expected: "'sunny'",
    }
    const result = getBackgroundTheme(800, true)
    _actual = result
    expect(result).toBe('sunny')
  })

  it('TC-U-16: getCachedWeather returns stored data when retrieved within maxAge', () => {
    _meta = {
      id: 'TC-U-16',
      description: 'getCachedWeather returns stored data when retrieved immediately (within maxAge)',
      input: "setCachedWeather('key', data) → getCachedWeather('key')",
      expected: 'deep-equal to original data object',
    }
    vi.useFakeTimers()
    sessionStorage.clear()
    try {
      const SAMPLE = { city: 'London', temp: 15, humidity: 72 }
      setCachedWeather('reg_test_key', SAMPLE)
      const result = getCachedWeather('reg_test_key')
      _actual = JSON.stringify(result)
      expect(result).toEqual(SAMPLE)
    } finally {
      vi.useRealTimers()
      sessionStorage.clear()
    }
  })
})

// ── Components ────────────────────────────────────────────────────────────────

describe('regression — components', () => {
  beforeEach(() => {
    vi.mocked(useWeatherContext).mockReturnValue({ units: 'metric' })
    vi.mocked(saveLocation).mockResolvedValue({ data: null, error: null })
  })

  it('TC-C-01: SearchBar renders a searchbox with aria-label "Search for a city"', () => {
    _meta = {
      id: 'TC-C-01',
      description: 'SearchBar renders input with accessible name "Search for a city"',
      input: 'render(<SearchBar />)',
      expected: 'element with role=combobox, name="Search for a city"',
    }
    render(<SearchBar />)
    const input = screen.getByRole('combobox', { name: 'Search for a city' })
    _actual = input ? 'combobox found — aria-label correct' : 'not found'
    expect(input).toBeTruthy()
  })

  it('TC-C-06: CurrentWeather renders city name "London" from the data prop', () => {
    _meta = {
      id: 'TC-C-06',
      description: 'CurrentWeather renders city name from weatherData prop',
      input: 'render(<CurrentWeather data={currentWeatherFixture} />)',
      expected: '"London" visible in DOM',
    }
    render(<CurrentWeather data={currentWeatherFixture} />)
    const el = screen.getByText(/London/)
    _actual = `"${el.textContent}" found in DOM`
    expect(el).toBeTruthy()
  })

  it('TC-C-14: FiveDayForecast renders exactly 5 forecast-card list items', () => {
    _meta = {
      id: 'TC-C-14',
      description: 'FiveDayForecast renders exactly 5 ForecastCard list items',
      input: 'render(<FiveDayForecast forecast={mockForecast} />) — 5-day grouped fixture',
      expected: '5 listitem elements',
    }
    render(<FiveDayForecast forecast={mockForecast} />)
    const items = screen.getAllByRole('listitem')
    _actual = `${items.length} listitem(s) rendered`
    expect(items).toHaveLength(5)
  })
})

// ── Hooks ─────────────────────────────────────────────────────────────────────

describe('regression — hooks', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('TC-H-01: useWeather returns loading=true synchronously before first fetch resolves', () => {
    _meta = {
      id: 'TC-H-01',
      description: 'useWeather loading=true on initial call before fetch resolves',
      input: "renderHook(() => useWeather('London'))",
      expected: 'result.current.loading === true',
    }
    const { result } = renderHook(() => useWeather('London'))
    _actual = `loading=${result.current.loading}`
    expect(result.current.loading).toBe(true)
  })

  it('TC-H-04: useWeather uses cached data and does NOT call fetch when cache is warm', () => {
    _meta = {
      id: 'TC-H-04',
      description: 'useWeather uses cached data; fetch not called on cache hit',
      input: "setCachedWeather('current_London_metric', fixture) → renderHook(() => useWeather('London'))",
      expected: 'global.fetch not called; result.current.data matches fixture',
    }
    setCachedWeather('current_London_metric', currentWeatherFixture)
    const fetchSpy = vi.spyOn(global, 'fetch')
    const { result } = renderHook(() => useWeather('London'))
    _actual = fetchSpy.mock.calls.length === 0
      ? 'fetch not called — cache hit confirmed'
      : `fetch called ${fetchSpy.mock.calls.length} time(s) — unexpected`
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result.current.data).toMatchObject({ name: 'London' })
  })
})

// ── Integration ───────────────────────────────────────────────────────────────

describe('regression — integration (MSW intercepts fetch)', () => {
  it('TC-I-01: getCurrentWeatherByCity resolves with correct weather fixture shape', async () => {
    _meta = {
      id: 'TC-I-01',
      description: 'getCurrentWeatherByCity resolves with correct weather shape',
      input: "getCurrentWeatherByCity('London')",
      expected: "{ name:'London', main:{ temp:15, humidity:72 }, wind:{ speed:5.2 } }",
    }
    const data = await getCurrentWeatherByCity('London')
    _actual = `name=${data.name} temp=${data.main.temp} humidity=${data.main.humidity} wind=${data.wind.speed}`
    expect(data).toMatchObject({
      name: 'London',
      main: { temp: 15, humidity: 72 },
      wind: { speed: 5.2 },
    })
  })

  it('TC-I-03: getFiveDayForecast resolves with list of exactly 40 slots', async () => {
    _meta = {
      id: 'TC-I-03',
      description: 'getFiveDayForecast resolves with list of length 40 (MSW per-test override)',
      input: "getFiveDayForecast('London') + server.use(40-item fixture)",
      expected: 'data.list.length === 40',
    }
    server.use(
      http.get('https://api.openweathermap.org/data/2.5/forecast', () =>
        HttpResponse.json(fortyItemForecast),
      ),
    )
    const data = await getFiveDayForecast('London')
    _actual = `list.length=${data.list.length}`
    expect(data.list).toHaveLength(40)
  })

  it('TC-I-06: getForecastByCoords resolves with a non-empty list array', async () => {
    _meta = {
      id: 'TC-I-06',
      description: 'getForecastByCoords resolves with a list array',
      input: 'getForecastByCoords(51.5, -0.12)',
      expected: 'Array.isArray(data.list) === true && data.list.length > 0',
    }
    const data = await getForecastByCoords(51.5, -0.12)
    _actual = `isArray=${Array.isArray(data.list)}, length=${data.list.length}`
    expect(Array.isArray(data.list)).toBe(true)
    expect(data.list.length).toBeGreaterThan(0)
  })
})
