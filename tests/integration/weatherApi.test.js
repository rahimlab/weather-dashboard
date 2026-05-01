// TEST EVIDENCE TABLE
// ID     | Description                                                    | Input / Action                              | Expected Output                                           | Notes
// --------|----------------------------------------------------------------|---------------------------------------------|-----------------------------------------------------------|----------------------------------------------------------
// TC-I-01 | getCurrentWeatherByCity resolves with correct fixture shape    | 'London' → MSW default handler              | { name:'London', main:{temp:15,humidity:72}, wind:{...} } | MSW returns currentWeatherFixture; toMatchObject used
// TC-I-02 | Invalid city → thrown Error containing '404'                  | 'InvalidCity999' → MSW returns 404           | rejects with /404/                                        | fetchJSON throws on !response.ok; statusText 'Not Found'
// TC-I-03 | getFiveDayForecast resolves with list of length 40             | 'London' → server.use override               | data.list.length === 40                                   | Real OWM API returns 40 3-hourly slots; override fixture
// TC-I-04 | getCurrentWeatherByCoords resolves with weather data           | (51.5, -0.12) → MSW default handler         | data.name === 'London'                                    | Coords endpoint reuses /weather; same MSW handler
// TC-I-05 | Missing API key → throws 'API key not configured'             | vi.stubEnv VITE_OPENWEATHER_API_KEY=''       | rejects with 'API key not configured'                     | Guard added to apiKey(); throws before fetch is called
// TC-I-06 | getForecastByCoords resolves with a list array                 | (51.5, -0.12) → MSW default handler         | Array.isArray(data.list) === true                         | Coords forecast endpoint; same MSW /forecast handler
// TC-I-07 | fetchJSON error message includes status code and statusText    | server.use → 500 Internal Server Error       | error message matches /500.*Internal Server Error/        | Verifies error format from fetchJSON throw

import { vi, describe, it, expect, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../setup.js'
import {
  getCurrentWeatherByCity,
  getCurrentWeatherByCoords,
  getFiveDayForecast,
  getForecastByCoords,
} from '../../src/api/weatherApi.js'
import { currentWeatherFixture, forecastFixture } from '../fixtures/weatherFixtures.js'

// build a 40-item list that mirrors the real OWM 5-day/3-hour response shape
const fortyItemForecast = {
  ...forecastFixture,
  cnt: 40,
  list: Array.from({ length: 40 }, (_, i) => ({
    ...forecastFixture.list[i % forecastFixture.list.length],
    dt: forecastFixture.list[0].dt + i * 10800, // 3-hour intervals
    dt_txt: `2026-04-28 ${String((i * 3) % 24).padStart(2, '0')}:00:00`,
  })),
}

describe('weatherApi — integration (MSW intercepts real fetch calls)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // ── current weather by city ──────────────────────────────────────────────

  it('TC-I-01: getCurrentWeatherByCity resolves with the correct weather shape', async () => {
    const data = await getCurrentWeatherByCity('London')

    expect(data).toMatchObject({
      name: 'London',
      main: { temp: 15, humidity: 72 },
      wind: { speed: 5.2 },
    })
  })

  it('TC-I-02: getCurrentWeatherByCity throws an Error containing "404" for an invalid city', async () => {
    // override the default handler to return 404 for this test only
    server.use(
      http.get('https://api.openweathermap.org/data/2.5/weather', () =>
        new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    )

    await expect(getCurrentWeatherByCity('InvalidCity999')).rejects.toThrow(/404/)
  })

  // ── five-day forecast ────────────────────────────────────────────────────

  it('TC-I-03: getFiveDayForecast resolves with a list array of length 40', async () => {
    // OWM returns 40 slots (5 days × 8 three-hour intervals); override fixture to match
    server.use(
      http.get('https://api.openweathermap.org/data/2.5/forecast', () =>
        HttpResponse.json(fortyItemForecast),
      ),
    )

    const data = await getFiveDayForecast('London')

    expect(Array.isArray(data.list)).toBe(true)
    expect(data.list).toHaveLength(40)
  })

  // ── coord-based endpoints ────────────────────────────────────────────────

  it('TC-I-04: getCurrentWeatherByCoords resolves with weather data for given coordinates', async () => {
    // /weather with lat/lon params is intercepted by the same MSW handler as city
    const data = await getCurrentWeatherByCoords(51.5, -0.12)

    expect(data).toMatchObject({ name: 'London' })
    expect(typeof data.main.temp).toBe('number')
  })

  it('TC-I-06: getForecastByCoords resolves with a list array', async () => {
    const data = await getForecastByCoords(51.5, -0.12)

    expect(Array.isArray(data.list)).toBe(true)
    expect(data.list.length).toBeGreaterThan(0)
  })

  // ── API key guard ────────────────────────────────────────────────────────

  it('TC-I-05: throws "API key not configured" when VITE_OPENWEATHER_API_KEY is empty', async () => {
    // vi.stubEnv patches import.meta.env for the duration of this test
    vi.stubEnv('VITE_OPENWEATHER_API_KEY', '')

    await expect(getCurrentWeatherByCity('London')).rejects.toThrow(
      'API key not configured',
    )
  })

  // ── error message format ─────────────────────────────────────────────────

  it('TC-I-07: error message includes status code and statusText on server error', async () => {
    server.use(
      http.get('https://api.openweathermap.org/data/2.5/weather', () =>
        new HttpResponse(null, {
          status: 500,
          statusText: 'Internal Server Error',
        }),
      ),
    )

    await expect(getCurrentWeatherByCity('London')).rejects.toThrow(
      /500.*Internal Server Error/,
    )
  })
})
