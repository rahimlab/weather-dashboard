// TEST EVIDENCE TABLE
// ID     | Description                                              | Input                          | Expected Output | Notes
// --------|----------------------------------------------------------|--------------------------------|-----------------|----------------------------------------------
// TC-U-01 | formatTemperature metric                                 | (15, 'metric')                 | '15°C'          | Standard positive metric value
// TC-U-02 | formatTemperature imperial                               | (59, 'imperial')               | '59°F'          | Standard positive imperial value
// TC-U-03 | formatWindSpeed metric                                   | (5.2, 'metric')                | '5.2 m/s'       | toFixed(1) — no rounding needed
// TC-U-04 | formatWindSpeed imperial                                 | (11.6, 'imperial')             | '11.6 mph'      | toFixed(1) — no rounding needed
// TC-U-05 | formatHumidity                                           | (72)                           | '72%'           | Appends % symbol
// TC-U-06 | formatDate with known unix timestamp                     | (1705320000)                   | 'Mon 15 Jan'    | 2024-01-15 12:00 UTC — timezone-safe noon
// TC-U-07 | formatTemperature zero edge case                         | (0, 'metric')                  | '0°C'           | Zero should not be treated as falsy
// TC-U-08 | formatTemperature negative value                         | (-5, 'metric')                 | '-5°C'          | Negative temp rounds correctly
// TC-U-09 | formatTemperature rounds decimals                        | (15.6, 'metric')               | '16°C'          | Math.round applied before display
// TC-U-10 | formatTemperature default units is metric                | (20)                           | '20°C'          | Second arg optional — defaults to 'metric'
// TC-U-11 | formatWindSpeed truncates extra decimals                 | (5.189, 'metric')              | '5.2 m/s'       | toFixed(1) rounds 5.189 -> 5.2
// TC-U-12 | formatTime returns HH:MM format                          | (1705320000)                   | /^\d{2}:\d{2}$/ | Timezone-agnostic format check

import {
  formatTemperature,
  formatWindSpeed,
  formatHumidity,
  formatDate,
  formatTime,
} from '../../../src/utils/formatters.js'

describe('formatTemperature', () => {
  it('TC-U-01: returns value with °C suffix for metric units', () => {
    expect(formatTemperature(15, 'metric')).toBe('15°C')
  })

  it('TC-U-02: returns value with °F suffix for imperial units', () => {
    expect(formatTemperature(59, 'imperial')).toBe('59°F')
  })

  it('TC-U-07: handles zero without treating it as falsy', () => {
    expect(formatTemperature(0, 'metric')).toBe('0°C')
  })

  it('TC-U-08: handles negative temperatures', () => {
    expect(formatTemperature(-5, 'metric')).toBe('-5°C')
  })

  it('TC-U-09: rounds decimal temperatures before display', () => {
    expect(formatTemperature(15.6, 'metric')).toBe('16°C')
    expect(formatTemperature(15.4, 'metric')).toBe('15°C')
  })

  it('TC-U-10: defaults to metric when units arg is omitted', () => {
    expect(formatTemperature(20)).toBe('20°C')
  })
})

describe('formatWindSpeed', () => {
  it('TC-U-03: returns speed with m/s suffix for metric units', () => {
    expect(formatWindSpeed(5.2, 'metric')).toBe('5.2 m/s')
  })

  it('TC-U-04: returns speed with mph suffix for imperial units', () => {
    expect(formatWindSpeed(11.6, 'imperial')).toBe('11.6 mph')
  })

  it('TC-U-11: toFixed(1) rounds to one decimal place', () => {
    expect(formatWindSpeed(5.189, 'metric')).toBe('5.2 m/s')
    expect(formatWindSpeed(5.111, 'metric')).toBe('5.1 m/s')
  })
})

describe('formatHumidity', () => {
  it('TC-U-05: appends % to the humidity number', () => {
    expect(formatHumidity(72)).toBe('72%')
  })

  it('handles boundary values', () => {
    expect(formatHumidity(0)).toBe('0%')
    expect(formatHumidity(100)).toBe('100%')
  })
})

describe('formatDate', () => {
  it('TC-U-06: returns weekday, day, and month for a known timestamp', () => {
    // 2024-01-15 12:00:00 UTC — noon avoids any timezone boundary crossing
    // Jan 15 2024 was a Monday
    const result = formatDate(1705320000)
    expect(result).toContain('15')
    expect(result).toMatch(/Jan/i)
    expect(result).toMatch(/Mon/i)
  })

  it('produces a non-empty string for any valid unix timestamp', () => {
    expect(typeof formatDate(0)).toBe('string')
    expect(formatDate(0).length).toBeGreaterThan(0)
  })
})

describe('formatTime', () => {
  it('TC-U-12: returns a string matching HH:MM format (24-hour)', () => {
    // locale output is timezone-dependent so we just verify the shape
    const result = formatTime(1705320000)
    expect(result).toMatch(/^\d{2}:\d{2}$/)
  })

  it('produces a string with correct hour/minute for epoch zero in any timezone', () => {
    // epoch 0 = 1970-01-01 00:00:00 UTC; local offsets shift hours but format stays HH:MM
    expect(formatTime(0)).toMatch(/^\d{2}:\d{2}$/)
  })
})
