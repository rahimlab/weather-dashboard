// TEST EVIDENCE TABLE
// ID     | Description                                              | Input / Action                          | Expected Output                          | Notes
// --------|----------------------------------------------------------|-----------------------------------------|------------------------------------------|------------------------------------------------------
// TC-H-01 | loading=true on initial call before fetch resolves       | renderHook with cityName='London'        | result.current.loading === true          | setLoading(true) runs sync before first await
// TC-H-02 | returns weather data after successful fetch              | renderHook; wait for loading=false       | data.name === 'London'; error === null   | MSW intercepts and returns currentWeatherFixture
// TC-H-03 | returns error string when API returns 404                | server.use override → 404; wait          | error matches /404/; data === null       | fetchJSON throws 'OpenWeatherMap error 404'
// TC-H-04 | uses cached data and does NOT call fetch                 | setCachedWeather first; spy global.fetch | fetch not called; data from cache        | Cache check returns early before setLoading
// TC-H-05 | refetch() bypasses cache and triggers a new API call     | pre-populate cache; call refetch()       | fetch IS called after refetch            | force=true added to refetch; MSW responds OK
// TC-H-06 | returns error when cityName is null/undefined            | renderHook with no city                  | loading=false; data=null; no fetch       | Early return guard: if (!city) return
// TC-H-07 | data is null initially before any city is set            | renderHook with no city                  | data === null, error === null            | Initial state check

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../../setup.js'
import { setCachedWeather } from '../../../src/utils/cache.js'
import { currentWeatherFixture } from '../../fixtures/weatherFixtures.js'
import useWeather from '../../../src/hooks/useWeather.js'

describe('useWeather', () => {
  beforeEach(() => {
    // clear cache so each test starts with a fresh sessionStorage
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('TC-H-01: returns loading=true on initial call before the fetch resolves', () => {
    // renderHook flushes effects synchronously via act(); setLoading(true) runs
    // before the first await in fetchWeather, so loading is true here
    const { result } = renderHook(() => useWeather('London'))
    expect(result.current.loading).toBe(true)
  })

  it('TC-H-02: returns weather data after successful fetch (MSW intercepts)', async () => {
    const { result } = renderHook(() => useWeather('London'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toMatchObject({ name: 'London' })
    expect(result.current.error).toBeNull()
  })

  it('TC-H-03: returns error string when API returns 404', async () => {
    server.use(
      http.get('https://api.openweathermap.org/data/2.5/weather', () =>
        new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    )

    const { result } = renderHook(() => useWeather('NoSuchCity'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toMatch(/404/)
    expect(result.current.data).toBeNull()
  })

  it('TC-H-04: uses cached data and does NOT call fetch when cache is fresh', () => {
    // pre-warm the cache with the exact key useWeather builds
    setCachedWeather('current_London_metric', currentWeatherFixture)

    const fetchSpy = vi.spyOn(global, 'fetch')

    const { result } = renderHook(() => useWeather('London'))

    // cache hit is fully synchronous — data is available immediately after renderHook
    expect(result.current.data).toMatchObject({ name: 'London' })
    expect(result.current.loading).toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('TC-H-05: refetch() triggers a new API call bypassing cache', async () => {
    // populate cache so the initial render does NOT call fetch
    setCachedWeather('current_London_metric', currentWeatherFixture)

    const { result } = renderHook(() => useWeather('London'))
    // confirm cache was used (data already there, no fetch needed)
    await waitFor(() =>
      expect(result.current.data).toMatchObject({ name: 'London' }),
    )

    // start spying AFTER the cache hit so we only catch the refetch call
    const fetchSpy = vi.spyOn(global, 'fetch')

    // refetch() passes force=true internally, skipping the cache
    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fetchSpy).toHaveBeenCalled()
    expect(result.current.data).toMatchObject({ name: 'London' })
  })

  it('TC-H-06: does not fetch and stays idle when no city is provided', () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
    const { result } = renderHook(() => useWeather(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('TC-H-07: data and error are null in initial state before any city is set', () => {
    const { result } = renderHook(() => useWeather(undefined))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
