// TEST EVIDENCE TABLE
// ID     | Description                                              | Input                 | Expected Output  | Notes
// --------|----------------------------------------------------------|-----------------------|------------------|--------------------------------------------
// TC-U-09 | Clear sky daytime                                        | (800, true)           | 'sunny'          | Only clear-sky + day → sunny
// TC-U-10 | Clear sky night                                          | (800, false)          | 'night-clear'    | Same code, isDay flips the result
// TC-U-11 | Rain daytime (5xx range)                                 | (500, true)           | 'rainy'          | Light rain
// TC-U-12 | Thunderstorm daytime (2xx range)                         | (200, true)           | 'stormy'         | Bottom of the storm range
// TC-U-13 | Snow daytime (6xx range)                                 | (600, true)           | 'snowy'          | Bottom of the snow range
// TC-U-14 | Few clouds daytime (801)                                 | (801, true)           | 'cloudy'         | 801-804 maps to cloudy/night-cloudy
// TC-U-15 | Fog daytime (741 in 7xx atmosphere range)                | (741, true)           | 'foggy'          | All 7xx atmosphere codes → foggy
// TC-U-16 | Drizzle (3xx) maps to rainy                              | (300, true)           | 'rainy'          | 3xx falls in the 300-599 rainy band
// TC-U-17 | Top of storm range (299)                                 | (299, true)           | 'stormy'         | Boundary check — 299 is still 2xx
// TC-U-18 | Top of snow range (699)                                  | (699, true)           | 'snowy'          | Boundary check — 699 is still 6xx
// TC-U-19 | Overcast night (804)                                     | (804, false)          | 'night-cloudy'   | 801-804 at night → night-cloudy
// TC-U-20 | isDaytime: current time between sunrise and sunset       | (noon, 6am, 8pm)      | true             | Daytime check
// TC-U-21 | isDaytime: current time before sunrise                   | (3am, 6am, 8pm)       | false            | Pre-sunrise is not day
// TC-U-22 | isDaytime: current time exactly at sunset                | (sunset, 6am, 8pm)    | false            | Sunset itself is exclusive (< not <=)

import { getBackgroundTheme, isDaytime } from '../../../src/utils/weatherConditions.js'

describe('getBackgroundTheme', () => {
  describe('clear sky (code 800)', () => {
    it('TC-U-09: returns sunny during the day', () => {
      expect(getBackgroundTheme(800, true)).toBe('sunny')
    })

    it('TC-U-10: returns night-clear at night', () => {
      expect(getBackgroundTheme(800, false)).toBe('night-clear')
    })
  })

  describe('rain band (3xx–5xx)', () => {
    it('TC-U-11: 500 (light rain) returns rainy', () => {
      expect(getBackgroundTheme(500, true)).toBe('rainy')
    })

    it('TC-U-16: 300 (light drizzle) returns rainy', () => {
      expect(getBackgroundTheme(300, true)).toBe('rainy')
    })

    it('handles top of rain range (599)', () => {
      expect(getBackgroundTheme(599, true)).toBe('rainy')
    })
  })

  describe('thunderstorm band (2xx)', () => {
    it('TC-U-12: 200 (thunderstorm) returns stormy', () => {
      expect(getBackgroundTheme(200, true)).toBe('stormy')
    })

    it('TC-U-17: 299 (top of storm range) returns stormy', () => {
      expect(getBackgroundTheme(299, true)).toBe('stormy')
    })
  })

  describe('snow band (6xx)', () => {
    it('TC-U-13: 600 (light snow) returns snowy', () => {
      expect(getBackgroundTheme(600, true)).toBe('snowy')
    })

    it('TC-U-18: 699 (top of snow range) returns snowy', () => {
      expect(getBackgroundTheme(699, true)).toBe('snowy')
    })
  })

  describe('atmosphere band (7xx — fog/haze/mist)', () => {
    it('TC-U-15: 741 (fog) returns foggy', () => {
      expect(getBackgroundTheme(741, true)).toBe('foggy')
    })

    it('handles 701 (mist) returning foggy', () => {
      expect(getBackgroundTheme(701, true)).toBe('foggy')
    })
  })

  describe('partly cloudy to overcast (801–804)', () => {
    it('TC-U-14: 801 (few clouds) returns cloudy during the day', () => {
      expect(getBackgroundTheme(801, true)).toBe('cloudy')
    })

    it('TC-U-19: 804 (overcast) returns night-cloudy at night', () => {
      expect(getBackgroundTheme(804, false)).toBe('night-cloudy')
    })

    it('802 returns cloudy during the day', () => {
      expect(getBackgroundTheme(802, true)).toBe('cloudy')
    })
  })
})

describe('isDaytime', () => {
  // unix timestamps for a representative day
  const SUNRISE = 1705296000  // 2024-01-15 06:00:00 UTC
  const SUNSET  = 1705327200  // 2024-01-15 15:00:00 UTC
  const NOON    = 1705312800  // 2024-01-15 11:00:00 UTC
  const BEFORE  = 1705288800  // 2024-01-15 04:00:00 UTC
  const AFTER   = 1705334400  // 2024-01-15 17:00:00 UTC

  it('TC-U-20: returns true when current time is between sunrise and sunset', () => {
    expect(isDaytime(NOON, SUNRISE, SUNSET)).toBe(true)
  })

  it('TC-U-21: returns false when current time is before sunrise', () => {
    expect(isDaytime(BEFORE, SUNRISE, SUNSET)).toBe(false)
  })

  it('TC-U-22: returns false when current time equals sunset (exclusive upper bound)', () => {
    expect(isDaytime(SUNSET, SUNRISE, SUNSET)).toBe(false)
  })

  it('returns true when current time equals sunrise (inclusive lower bound)', () => {
    expect(isDaytime(SUNRISE, SUNRISE, SUNSET)).toBe(true)
  })

  it('returns false when current time is after sunset', () => {
    expect(isDaytime(AFTER, SUNRISE, SUNSET)).toBe(false)
  })
})
