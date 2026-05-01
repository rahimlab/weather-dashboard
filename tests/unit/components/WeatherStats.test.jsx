// TEST EVIDENCE TABLE
// ID     | Description                                         | Input / Action                    | Expected Output                        | Notes
// --------|-----------------------------------------------------|-----------------------------------|----------------------------------------|--------------------------------------------------
// TC-C-11 | Renders humidity value from weatherData prop        | currentWeatherFixture (72%)       | '72%' visible in DOM                   | formatHumidity(72) = '72%'
// TC-C-12 | Renders wind speed value                            | currentWeatherFixture (5.2 m/s)   | '5.2 m/s' visible in DOM               | formatWindSpeed(5.2,'metric') = '5.2 m/s'
// TC-C-13 | All stat labels are visible in the DOM              | currentWeatherFixture             | each label text visible                | Visible text labels used (aria-label removed from icon span — axe aria-prohibited-attr fix)
// TC-C-14 | Renders pressure value                              | currentWeatherFixture (1012 hPa)  | '1012 hPa' visible in DOM              | Direct string interpolation in component
// TC-C-15 | Renders visibility formatted in km                  | currentWeatherFixture (10000 m)   | '10.0 km' visible in DOM               | (10000/1000).toFixed(1) = '10.0'
// TC-C-16 | Returns null when data prop is null                 | data={null}                       | container renders nothing              | Guard at top of component
// TC-C-17 | Renders correct number of stat items (6)            | currentWeatherFixture             | 6 list items in the grid               | humidity/wind/visibility/pressure/sunrise/sunset

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useWeatherContext } from '../../../src/context/WeatherContext.jsx'
import WeatherStats from '../../../src/components/weather/WeatherStats.jsx'
import { currentWeatherFixture } from '../../fixtures/weatherFixtures.js'

vi.mock('../../../src/context/WeatherContext.jsx', () => ({
  useWeatherContext: vi.fn(),
}))

describe('WeatherStats', () => {
  beforeEach(() => {
    vi.mocked(useWeatherContext).mockReturnValue({ units: 'metric' })
  })

  it('TC-C-11: renders humidity value from weatherData prop', () => {
    render(<WeatherStats data={currentWeatherFixture} />)
    // fixture: main.humidity = 72 → formatHumidity(72) = '72%'
    expect(screen.getByText('72%')).toBeTruthy()
  })

  it('TC-C-12: renders wind speed value', () => {
    render(<WeatherStats data={currentWeatherFixture} />)
    // fixture: wind.speed = 5.2 → formatWindSpeed(5.2, 'metric') = '5.2 m/s'
    expect(screen.getByText('5.2 m/s')).toBeTruthy()
  })

  it('TC-C-13: all stat label texts are visible in the DOM', () => {
    render(<WeatherStats data={currentWeatherFixture} />)
    // visible <span class="label"> text is the accessible name; no aria-label on icon spans
    const expectedLabels = ['Humidity', 'Wind speed', 'Visibility', 'Pressure', 'Sunrise', 'Sunset']
    expectedLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy()
    })
  })

  it('TC-C-14: renders pressure value', () => {
    render(<WeatherStats data={currentWeatherFixture} />)
    // fixture: main.pressure = 1012
    expect(screen.getByText('1012 hPa')).toBeTruthy()
  })

  it('TC-C-15: renders visibility formatted as km', () => {
    render(<WeatherStats data={currentWeatherFixture} />)
    // fixture: visibility = 10000 → (10000/1000).toFixed(1) = '10.0 km'
    expect(screen.getByText('10.0 km')).toBeTruthy()
  })

  it('TC-C-16: returns null when data prop is null', () => {
    const { container } = render(<WeatherStats data={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('TC-C-17: renders exactly 6 stat items', () => {
    render(<WeatherStats data={currentWeatherFixture} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(6)
  })
})
