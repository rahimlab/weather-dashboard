// TEST EVIDENCE TABLE
// ID     | Description                                              | Input / Action                                    | Expected Output                                           | Notes
// --------|----------------------------------------------------------|---------------------------------------------------|-----------------------------------------------------------|----------------------------------------------------------
// TC-H-06 | loading=true while geolocation request is pending        | getLocation(); mock never calls back               | loading === true                                          | setLoading(true) fires sync; callback never resolves
// TC-H-07 | returns lat/lon after successful geolocation             | successCallback({ coords: {51.5, -0.12} })         | lat===51.5, lon===-0.12, loading===false                 | Success path; setLat/setLon/setLoading(false) all called
// TC-H-08 | returns error message when geolocation is denied         | errorCallback({ code: 1 })                         | error truthy; loading===false; lat/lon still null        | Error path; setError called with GEO_ERROR_MESSAGES[1]
// TC-H-09 | exact error message for code=1 is the denied string      | errorCallback({ code: 1 })                         | error === 'Location access denied. Please search manually.'| GEO_ERROR_MESSAGES[1] updated to match spec
// TC-H-10 | initial state: lat/lon/error null, loading false         | renderHook only, no getLocation call               | all null/false                                            | No side-effects before getLocation is called
// TC-H-11 | code=2 returns "could not be determined" message         | errorCallback({ code: 2 })                         | error matches /could not be determined/i                 | Different code → different GEO_ERROR_MESSAGES branch
// TC-H-12 | code=3 returns timeout message                           | errorCallback({ code: 3 })                         | error matches /timed out/i                               | Timeout branch
// TC-H-13 | unknown code falls back to generic message               | errorCallback({ code: 99 })                        | error matches /unknown location error/i                  | Nullish-coalescing fallback in hook

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import useGeolocation from '../../../src/hooks/useGeolocation.js'

describe('useGeolocation', () => {
  let mockGetCurrentPosition

  beforeEach(() => {
    mockGetCurrentPosition = vi.fn()
    // jsdom doesn't provide navigator.geolocation — install a fresh mock per test
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true,
    })
  })

  it('TC-H-10: initial state has lat/lon/error null and loading false', () => {
    const { result } = renderHook(() => useGeolocation())
    expect(result.current.lat).toBeNull()
    expect(result.current.lon).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('TC-H-06: loading is true while the geolocation request is pending', async () => {
    // mock that never calls either callback — simulates a pending browser prompt
    mockGetCurrentPosition.mockImplementation(() => {})

    const { result } = renderHook(() => useGeolocation())

    await act(async () => {
      result.current.getLocation()
    })

    expect(result.current.loading).toBe(true)
    expect(result.current.lat).toBeNull()
    expect(result.current.lon).toBeNull()
  })

  it('TC-H-07: returns lat and lon after a successful geolocation response', async () => {
    mockGetCurrentPosition.mockImplementation((successCb) => {
      successCb({ coords: { latitude: 51.5, longitude: -0.12 } })
    })

    const { result } = renderHook(() => useGeolocation())

    await act(async () => {
      result.current.getLocation()
    })

    await waitFor(() => {
      expect(result.current.lat).toBe(51.5)
      expect(result.current.lon).toBe(-0.12)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('TC-H-08: returns an error message when geolocation permission is denied', async () => {
    mockGetCurrentPosition.mockImplementation((_success, errorCb) => {
      errorCb({ code: 1 })
    })

    const { result } = renderHook(() => useGeolocation())

    await act(async () => {
      result.current.getLocation()
    })

    await waitFor(() => expect(result.current.error).toBeTruthy())

    expect(result.current.loading).toBe(false)
    expect(result.current.lat).toBeNull()
    expect(result.current.lon).toBeNull()
  })

  it('TC-H-09: code=1 error message is "Location access denied. Please search manually."', async () => {
    mockGetCurrentPosition.mockImplementation((_success, errorCb) => {
      errorCb({ code: 1 })
    })

    const { result } = renderHook(() => useGeolocation())

    await act(async () => {
      result.current.getLocation()
    })

    await waitFor(() =>
      expect(result.current.error).toBe(
        'Location access denied. Please search manually.',
      ),
    )
  })

  it('TC-H-11: code=2 returns the "could not be determined" message', async () => {
    mockGetCurrentPosition.mockImplementation((_success, errorCb) => {
      errorCb({ code: 2 })
    })

    const { result } = renderHook(() => useGeolocation())

    await act(async () => {
      result.current.getLocation()
    })

    await waitFor(() =>
      expect(result.current.error).toMatch(/could not be determined/i),
    )
  })

  it('TC-H-12: code=3 returns the timeout message', async () => {
    mockGetCurrentPosition.mockImplementation((_success, errorCb) => {
      errorCb({ code: 3 })
    })

    const { result } = renderHook(() => useGeolocation())

    await act(async () => {
      result.current.getLocation()
    })

    await waitFor(() =>
      expect(result.current.error).toMatch(/timed out/i),
    )
  })

  it('TC-H-13: unknown error code falls back to the generic message', async () => {
    mockGetCurrentPosition.mockImplementation((_success, errorCb) => {
      errorCb({ code: 99 })
    })

    const { result } = renderHook(() => useGeolocation())

    await act(async () => {
      result.current.getLocation()
    })

    await waitFor(() =>
      expect(result.current.error).toMatch(/unknown location error/i),
    )
  })
})
