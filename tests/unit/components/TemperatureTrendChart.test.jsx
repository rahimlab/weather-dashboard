// TEST EVIDENCE TABLE
// ID     | Description                                                          | Input / Action                       | Expected Output                                     | Notes
// --------|----------------------------------------------------------------------|--------------------------------------|-----------------------------------------------------|----------------------------------------------
// TC-C-22 | Renders chart title "5-Day Temperature Trend"                        | dailyForecast with 5 days            | text "5-Day Temperature Trend" in DOM               | recharts fully mocked with div stubs
// TC-C-23 | Passes correct number of data points to LineChart (5)                | dailyForecast with 5 days            | data-testid="line-chart" has data-points="5"        | uses data-points attribute on mocked div
// TC-C-24 | Renders loading text when dailyForecast is empty array               | dailyForecast=[]                     | "Loading forecast data..." visible; no line chart   | fallback path when hook hasn't resolved yet

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useWeatherContext } from '../../../src/context/WeatherContext.jsx'

vi.mock('../../../src/context/WeatherContext.jsx', () => ({
  useWeatherContext: vi.fn(),
}))

// replacing all recharts components with testable divs so jsdom doesn't choke
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ data, children }) => (
    <div data-testid="line-chart" data-points={data?.length}>{children}</div>
  ),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}))

import TemperatureTrendChart from '../../../src/components/weather/TemperatureTrendChart.jsx'

// minimal daily forecast entries — just the fields the chart actually reads
function makeDay(dt, tempMax, tempMin) {
  return { date: '2026-04-28', dt, tempMax, tempMin, condition: 'Clouds', icon: '04d', description: 'overcast clouds', entries: [] }
}

const fiveDayForecast = [
  makeDay(1745841600, 16, 10),
  makeDay(1745928000, 14, 9),
  makeDay(1746014400, 12, 8),
  makeDay(1746100800, 15, 11),
  makeDay(1746187200, 18, 12),
]

describe('TemperatureTrendChart', () => {
  beforeEach(() => {
    vi.mocked(useWeatherContext).mockReturnValue({ units: 'metric' })
  })

  it('TC-C-22: renders chart title "5-Day Temperature Trend"', () => {
    render(<TemperatureTrendChart dailyForecast={fiveDayForecast} />)
    expect(screen.getByText('5-Day Temperature Trend')).toBeTruthy()
  })

  it('TC-C-23: passes 5 data points to LineChart', () => {
    render(<TemperatureTrendChart dailyForecast={fiveDayForecast} />)
    const chart = screen.getByTestId('line-chart')
    expect(chart.getAttribute('data-points')).toBe('5')
  })

  it('TC-C-24: renders loading text and no chart when dailyForecast is empty', () => {
    render(<TemperatureTrendChart dailyForecast={[]} />)
    expect(screen.getByText(/loading forecast data/i)).toBeTruthy()
    expect(screen.queryByTestId('line-chart')).toBeNull()
  })
})
