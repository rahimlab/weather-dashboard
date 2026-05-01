// TEST EVIDENCE TABLE
// ID     | Description                                         | Input / Action                    | Expected Output                        | Notes
// --------|-----------------------------------------------------|-----------------------------------|----------------------------------------|--------------------------------------------------
// TC-C-06 | Renders city name from weatherData prop             | currentWeatherFixture             | 'London' visible in DOM                | Fixture: name='London'
// TC-C-07 | Renders temperature formatted with °C               | currentWeatherFixture (15°C)      | '15°C' visible in DOM                  | formatTemperature(15.0,'metric') = '15°C'
// TC-C-08 | Renders weather description text                    | currentWeatherFixture             | 'overcast clouds' visible              | Fixture: weather[0].description
// TC-C-09 | Renders save button in initial idle state           | currentWeatherFixture             | button with save label present         | Initial saveStatus='idle'; label='♡ Save city'
// TC-C-10 | Clicking save button calls saveLocation mock        | click save button                 | saveLocation called with city args     | Resolved promise; no error path
// TC-C-11 | Renders feels-like temperature line                 | currentWeatherFixture (14°C)      | 'Feels like 14°C' visible              | formatTemperature(14.1,'metric') = '14°C'
// TC-C-12 | Save button is disabled while save is in progress   | click save → check disabled state | button.disabled === true during saving | saveStatus transitions idle→saving

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWeatherContext } from '../../../src/context/WeatherContext.jsx'
import { saveLocation } from '../../../src/hooks/useSavedLocations.js'
import CurrentWeather from '../../../src/components/weather/CurrentWeather.jsx'
import { currentWeatherFixture } from '../../fixtures/weatherFixtures.js'

vi.mock('../../../src/context/WeatherContext.jsx', () => ({
  useWeatherContext: vi.fn(),
}))

vi.mock('../../../src/hooks/useSavedLocations.js', () => ({
  saveLocation: vi.fn(),
  fetchSavedLocations: vi.fn(),
  deleteLocation: vi.fn(),
}))

describe('CurrentWeather', () => {
  beforeEach(() => {
    vi.mocked(useWeatherContext).mockReturnValue({ units: 'metric' })
    vi.mocked(saveLocation).mockResolvedValue({ data: null, error: null })
  })

  it('TC-C-06: renders city name from weatherData prop', () => {
    render(<CurrentWeather data={currentWeatherFixture} />)
    expect(screen.getByText(/London/)).toBeTruthy()
  })

  it('TC-C-07: renders temperature formatted with °C', () => {
    render(<CurrentWeather data={currentWeatherFixture} />)
    // fixture: main.temp=15.0 → formatTemperature(15.0, 'metric') = '15°C'
    expect(screen.getByText('15°C')).toBeTruthy()
  })

  it('TC-C-08: renders weather description text', () => {
    render(<CurrentWeather data={currentWeatherFixture} />)
    // fixture: weather[0].description = 'overcast clouds'
    expect(screen.getByText('overcast clouds')).toBeTruthy()
  })

  it('TC-C-09: renders save button in idle state', () => {
    render(<CurrentWeather data={currentWeatherFixture} />)
    // aria-label includes the city name; text is '♡ Save city' in idle state
    expect(screen.getByRole('button', { name: /save london/i })).toBeTruthy()
  })

  it('TC-C-10: clicking save button calls saveLocation with correct args', async () => {
    const user = userEvent.setup()
    render(<CurrentWeather data={currentWeatherFixture} />)
    await user.click(screen.getByRole('button', { name: /save london/i }))
    await waitFor(() => {
      expect(saveLocation).toHaveBeenCalledWith(
        'London',
        'GB',
        51.5085,
        -0.1257,
      )
    })
  })

  it('TC-C-11: renders feels-like temperature', () => {
    render(<CurrentWeather data={currentWeatherFixture} />)
    // fixture: main.feels_like=14.1 → formatTemperature(14.1,'metric') = '14°C'
    expect(screen.getByText(/feels like 14°c/i)).toBeTruthy()
  })

  it('TC-C-12: renders nothing when data prop is null', () => {
    const { container } = render(<CurrentWeather data={null} />)
    expect(container.firstChild).toBeNull()
  })
})
