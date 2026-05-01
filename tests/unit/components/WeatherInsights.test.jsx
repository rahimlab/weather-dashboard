// TEST EVIDENCE TABLE
// ID     | Description                                                           | Input / Action                                                | Expected Output                                         | Notes
// --------|-----------------------------------------------------------------------|---------------------------------------------------------------|----------------------------------------------------------|----------------------------------------------------------
// TC-C-25 | Renders dropping temperature insight when last day is much cooler    | day[0].tempMax=20 day[4].tempMax=14 (diff=-6)                 | "Temperatures are dropping over the next few days."      | diff < -3 triggers drop branch
// TC-C-26 | Renders rain expected insight when 3 or more days have rain codes    | 3 days with entries containing weather id 501 (rain)          | "Rain expected for most of the week."                    | codes 300-531 count as rainy days
// TC-C-27 | Renders dry week insight when no days have rain codes                | all days with entries containing weather id 800 (clear)       | "No rain in the forecast, looking dry all week."         | 0 rainy days
// TC-C-28 | Renders heat warning when any day max temp exceeds 28 celsius        | one day with tempMax=32 units=metric                          | "A warm spell coming, could get quite hot."              | threshold is 28 for metric, 82 for imperial

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useWeatherContext } from '../../../src/context/WeatherContext.jsx'

vi.mock('../../../src/context/WeatherContext.jsx', () => ({
  useWeatherContext: vi.fn(),
}))

import WeatherInsights from '../../../src/components/weather/WeatherInsights.jsx'

// entries field is what the rain detection reads — weather[0].id is the OWM code
function makeDay(tempMax, tempMin, weatherId) {
  return {
    date: '2026-04-28',
    dt: 1745841600,
    tempMax,
    tempMin,
    condition: 'Clouds',
    icon: '04d',
    description: 'overcast clouds',
    entries: [
      { weather: [{ id: weatherId, main: 'Clouds', description: 'overcast' }] },
    ],
  }
}

describe('WeatherInsights', () => {
  beforeEach(() => {
    vi.mocked(useWeatherContext).mockReturnValue({ units: 'metric' })
  })

  it('TC-C-25: shows dropping temperature insight when last day is significantly colder', () => {
    // day[0]=20, day[4]=14 so diff=-6 which is < -3
    const forecast = [
      makeDay(20, 14, 800),
      makeDay(18, 12, 800),
      makeDay(16, 11, 800),
      makeDay(15, 10, 800),
      makeDay(14, 9, 800),
    ]
    render(<WeatherInsights dailyForecast={forecast} />)
    expect(screen.getByText(/temperatures are dropping over the next few days/i)).toBeTruthy()
  })

  it('TC-C-26: shows "rain expected for most of the week" when 3 or more days are rainy', () => {
    // three days with code 501 (moderate rain), two days clear
    const forecast = [
      makeDay(15, 10, 501),
      makeDay(14, 9, 501),
      makeDay(13, 8, 501),
      makeDay(16, 11, 800),
      makeDay(17, 12, 800),
    ]
    render(<WeatherInsights dailyForecast={forecast} />)
    expect(screen.getByText(/rain expected for most of the week/i)).toBeTruthy()
  })

  it('TC-C-27: shows dry week insight when no days have rain codes', () => {
    const forecast = [
      makeDay(20, 14, 800),
      makeDay(22, 15, 800),
      makeDay(21, 14, 800),
      makeDay(19, 13, 800),
      makeDay(18, 12, 800),
    ]
    render(<WeatherInsights dailyForecast={forecast} />)
    expect(screen.getByText(/no rain in the forecast, looking dry all week/i)).toBeTruthy()
  })

  it('TC-C-28: shows heat warning when any day exceeds 28 celsius', () => {
    // day 3 hits 32 which is above the 28 metric threshold
    const forecast = [
      makeDay(22, 16, 800),
      makeDay(25, 18, 800),
      makeDay(32, 22, 800),
      makeDay(28, 20, 800),
      makeDay(24, 17, 800),
    ]
    render(<WeatherInsights dailyForecast={forecast} />)
    expect(screen.getByText(/a warm spell coming, could get quite hot/i)).toBeTruthy()
  })
})
