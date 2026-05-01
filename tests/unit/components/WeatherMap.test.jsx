// TEST EVIDENCE TABLE
// ID     | Description                                                          | Input / Action                          | Expected Output                              | Notes
// --------|----------------------------------------------------------------------|-----------------------------------------|----------------------------------------------|------------------------------------------------------
// TC-C-20 | Renders map container when lat and lon are provided                  | lat=51.5085 lon=-0.1257 cityName=London | element with data-testid="map-container"     | react-leaflet fully mocked with div stubs
// TC-C-20 | Renders city name and description inside the popup                   | lat=51.5085 lon=-0.1257                 | 'London' and 'overcast clouds' in DOM        | mocked Popup renders children as plain div
// TC-C-21 | Does not render anything when lat is null                            | lat=null lon=-0.1257                    | container.firstChild is null                 | component returns null on missing coords
// TC-C-21 | Does not render anything when lon is null                            | lat=51.5085 lon=null                    | container.firstChild is null                 | component returns null on missing coords
// TC-C-29 | Clicking the map calls getCurrentWeatherByCoords then setSelectedCity | captured click handler called with coords | getCurrentWeatherByCoords called; setSelectedCity('Paris') called | handler captured from useMapEvents mock

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'

vi.mock('leaflet/dist/leaflet.css', () => ({}))
vi.mock('leaflet/dist/images/marker-icon.png', () => ({ default: 'marker-icon.png' }))
vi.mock('leaflet/dist/images/marker-shadow.png', () => ({ default: 'marker-shadow.png' }))

vi.mock('leaflet', () => {
  const markerPrototype = { options: {} }
  return {
    default: {
      icon: vi.fn(() => ({})),
      Marker: { prototype: markerPrototype },
    },
  }
})

// useMapEvents is now included so MapClickHandler doesn't blow up
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMapEvents: vi.fn(),
}))

vi.mock('../../../src/context/WeatherContext.jsx', () => ({
  useWeatherContext: vi.fn(),
}))

vi.mock('../../../src/api/weatherApi.js', () => ({
  getCurrentWeatherByCoords: vi.fn(),
  getCurrentWeatherByCity: vi.fn(),
  getFiveDayForecast: vi.fn(),
  getForecastByCoords: vi.fn(),
  getCitySuggestions: vi.fn(),
}))

import { useMapEvents } from 'react-leaflet'
import { useWeatherContext } from '../../../src/context/WeatherContext.jsx'
import { getCurrentWeatherByCoords } from '../../../src/api/weatherApi.js'
import WeatherMap from '../../../src/components/map/WeatherMap.jsx'

let capturedHandlers = {}

beforeEach(() => {
  capturedHandlers = {}
  const mockSetSelectedCity = vi.fn()
  vi.mocked(useWeatherContext).mockReturnValue({ units: 'metric', setSelectedCity: mockSetSelectedCity })
  // capture whatever event handlers MapClickHandler registers
  vi.mocked(useMapEvents).mockImplementation((handlers) => {
    capturedHandlers = handlers
    return {}
  })
  vi.mocked(getCurrentWeatherByCoords).mockResolvedValue({ name: 'Paris' })
})

describe('WeatherMap', () => {
  it('TC-C-20: renders map container when lat and lon props are provided', () => {
    render(
      <WeatherMap lat={51.5085} lon={-0.1257} cityName="London" weatherDescription="overcast clouds" />,
    )
    expect(screen.getByTestId('map-container')).toBeTruthy()
  })

  it('TC-C-20: renders city name inside the popup', () => {
    render(
      <WeatherMap lat={51.5085} lon={-0.1257} cityName="London" weatherDescription="overcast clouds" />,
    )
    expect(screen.getByText('London')).toBeTruthy()
    expect(screen.getByText('overcast clouds')).toBeTruthy()
  })

  it('TC-C-21: does not render when lat is null', () => {
    const { container } = render(
      <WeatherMap lat={null} lon={-0.1257} cityName="London" weatherDescription="clear sky" />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('TC-C-21: does not render when lon is null', () => {
    const { container } = render(
      <WeatherMap lat={51.5085} lon={null} cityName="London" weatherDescription="clear sky" />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('TC-C-29: clicking the map calls getCurrentWeatherByCoords and then setSelectedCity', async () => {
    const mockSetSelectedCity = vi.fn()
    vi.mocked(useWeatherContext).mockReturnValue({ units: 'metric', setSelectedCity: mockSetSelectedCity })

    render(
      <WeatherMap lat={51.5085} lon={-0.1257} cityName="London" weatherDescription="overcast clouds" />,
    )

    // fire the captured click handler as if the user clicked on Paris
    await act(async () => {
      await capturedHandlers.click({ latlng: { lat: 48.8566, lng: 2.3522 } })
    })

    expect(getCurrentWeatherByCoords).toHaveBeenCalledWith(48.8566, 2.3522, 'metric')
    expect(mockSetSelectedCity).toHaveBeenCalledWith('Paris')
  })
})
