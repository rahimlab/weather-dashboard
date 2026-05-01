// TEST EVIDENCE TABLE
// ID     | Description                                         | Input / Action                     | Expected Output                        | Notes
// --------|-----------------------------------------------------|------------------------------------|----------------------------------------|--------------------------------------------------
// TC-C-14 | Renders exactly 5 ForecastCard children             | mockForecast (5 days)              | 5 <li> elements inside the grid        | One <li> per day; ForecastCard inside each
// TC-C-15 | Each card shows a date string                       | mockForecast with known timestamps | date text present in each card         | formatDate(dt) returns 'Mon D Mon' shape
// TC-C-16 | Renders loading spinner when loading prop is true   | loading={true}                     | role='status' element visible          | LoadingSpinner has role='status'
// TC-C-17 | Renders nothing when forecast is empty              | forecast=[]                        | container is empty                     | Early return when length===0
// TC-C-18 | Renders city heading when city prop is provided     | city='London'                      | heading with 'London' text visible     | <h2> only rendered when city truthy
// TC-C-19 | Renders section with accessible aria-label          | city='London'                      | section aria-label includes 'London'   | aria-label="5-day weather forecast for London"

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useWeatherContext } from '../../../src/context/WeatherContext.jsx'
import FiveDayForecast from '../../../src/components/weather/FiveDayForecast.jsx'
import { forecastFixture } from '../../fixtures/weatherFixtures.js'

vi.mock('../../../src/context/WeatherContext.jsx', () => ({
  useWeatherContext: vi.fn(),
}))

// build the forecast shape that FiveDayForecast expects from the raw fixture entries
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

describe('FiveDayForecast', () => {
  beforeEach(() => {
    vi.mocked(useWeatherContext).mockReturnValue({ units: 'metric' })
  })

  it('TC-C-14: renders exactly 5 forecast card list items', () => {
    render(<FiveDayForecast forecast={mockForecast} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(5)
  })

  it('TC-C-15: each card renders a date string', () => {
    render(<FiveDayForecast forecast={mockForecast} />)
    // ForecastCard calls formatDate(dt) → 'Mon D Mon' shape; there must be exactly 5 articles
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(5)
    // each article's aria-label starts with 'Forecast for' — confirms a date string was produced
    cards.forEach((card) => {
      expect(card.getAttribute('aria-label')).toMatch(/^Forecast for /)
    })
  })

  it('TC-C-16: renders loading spinner when loading prop is true', () => {
    render(<FiveDayForecast forecast={[]} loading={true} />)
    // LoadingSpinner has role='status' and aria-label='Loading weather data'
    expect(screen.getByRole('status')).toBeTruthy()
    expect(screen.getByLabelText('Loading weather data')).toBeTruthy()
  })

  it('TC-C-17: renders nothing when forecast array is empty', () => {
    const { container } = render(<FiveDayForecast forecast={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('TC-C-18: renders city heading when city prop is provided', () => {
    render(<FiveDayForecast forecast={mockForecast} city="London" />)
    expect(screen.getByRole('heading', { name: 'London' })).toBeTruthy()
  })

  it('TC-C-19: section has aria-label that includes the city name', () => {
    render(<FiveDayForecast forecast={mockForecast} city="London" />)
    expect(
      screen.getByRole('region', { name: '5-day weather forecast for London' }),
    ).toBeTruthy()
  })
})
