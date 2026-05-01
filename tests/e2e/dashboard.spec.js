// TEST EVIDENCE TABLE
// ID     | Description                                                         | Input / Action                                   | Expected Output                                    | Notes
// --------|---------------------------------------------------------------------|--------------------------------------------------|----------------------------------------------------|-------------------------------------------------------------
// TC-E-01 | page loads at '/' with title containing "WeatherNow"               | page.goto('/')                                   | page title matches /WeatherNow/                    | Checks <title> in index.html
// TC-E-02 | searching "London" + Enter shows weather for London                  | fill searchbox; press Enter                       | article "Current weather for London" visible        | Sets selectedCity via context; MSW returns fixture
// TC-E-03 | current temperature "15°C" visible on screen                        | fill searchbox; press Enter                       | text "15°C" visible                                | fixture temp:15, formatTemperature → "15°C"
// TC-E-04 | humidity and wind speed stats visible                                | fill searchbox; press Enter                       | "72%" and "5.2 m/s" visible                        | WeatherStats renders fixture values
// TC-E-05 | "View 5-Day Forecast" link navigates to /forecast                   | click forecast link after search                 | URL contains /forecast                             | React Router Link click; context preserved
// TC-E-06 | toggling °C/°F button changes temperature display format            | click units toggle after search                  | "15°F" visible                                     | context.units switches; app re-fetches; same fixture → "15°F"
// TC-E-07 | DynamicBackground container has data-theme attribute set            | page.goto('/')                                   | [data-theme] present and non-empty                 | CSS Module class names are scoped; data-theme is the testable proxy

import { test, expect } from '@playwright/test'
import { currentWeatherFixture, forecastFixture } from '../fixtures/weatherFixtures.js'

test.beforeEach(async ({ page }) => {
  // deny geolocation immediately so the auto-trigger on mount never fetches
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (_success, error) =>
          error({ code: 1, message: 'Permission denied' }),
      },
      writable: true,
      configurable: true,
    })
  })

  await page.route('**/api.openweathermap.org/data/2.5/weather**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentWeatherFixture),
    }),
  )

  await page.route('**/api.openweathermap.org/data/2.5/forecast**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(forecastFixture),
    }),
  )

  // prevent real Supabase calls from leaking out of dashboard tests
  await page.route('**/rest/v1/saved_locations**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  )
})

// ── TC-E-01 ──────────────────────────────────────────────────────────────────

test('TC-E-01: page loads at "/" with title containing "WeatherNow"', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/WeatherNow/i)
})

// ── TC-E-02 ──────────────────────────────────────────────────────────────────

test('TC-E-02: typing "London" and pressing Enter shows weather data for London', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox').fill('London')
  await page.getByRole('combobox').press('Enter')

  await expect(
    page.getByRole('article', { name: /Current weather for London/i }),
  ).toBeVisible({ timeout: 5000 })
})

// ── TC-E-03 ──────────────────────────────────────────────────────────────────

test('TC-E-03: current temperature "15°C" is visible after searching London', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox').fill('London')
  await page.getByRole('combobox').press('Enter')

  // the temp span has aria-label "Temperature: 15°C"; the text content is "15°C"
  await expect(page.getByLabel(/^Temperature:/i)).toBeVisible({ timeout: 5000 })
  await expect(page.getByLabel(/^Temperature:/i)).toHaveText('15°C')
})

// ── TC-E-04 ──────────────────────────────────────────────────────────────────

test('TC-E-04: humidity and wind speed stats are visible after searching London', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox').fill('London')
  await page.getByRole('combobox').press('Enter')

  // wait for weather card to confirm data loaded
  await expect(
    page.getByRole('article', { name: /Current weather for London/i }),
  ).toBeVisible({ timeout: 5000 })

  // WeatherStats renders humidity (72%) and wind speed (5.2 m/s)
  await expect(page.getByText('72%').first()).toBeVisible()
  await expect(page.getByText('5.2 m/s')).toBeVisible()
})

// ── TC-E-05 ──────────────────────────────────────────────────────────────────

test('TC-E-05: "View 5-Day Forecast" link navigates to /forecast', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox').fill('London')
  await page.getByRole('combobox').press('Enter')
  await expect(
    page.getByRole('article', { name: /Current weather for London/i }),
  ).toBeVisible({ timeout: 5000 })

  await page.getByRole('link', { name: /View 5-Day Forecast/i }).click()

  await expect(page).toHaveURL(/\/forecast/)
})

// ── TC-E-06 ──────────────────────────────────────────────────────────────────

test('TC-E-06: toggling the °C/°F button changes the temperature display format', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox').fill('London')
  await page.getByRole('combobox').press('Enter')
  await expect(page.getByLabel(/^Temperature:/i)).toHaveText('15°C', { timeout: 5000 })

  // the button aria-label is "Temperature unit: Celsius. Click to switch."
  await page.getByRole('button', { name: /Temperature unit/i }).click()

  // mock returns temp:15 regardless of units; formatTemperature(15,'imperial') → '15°F'
  await expect(page.getByLabel(/^Temperature:/i)).toHaveText('15°F', { timeout: 3000 })
})

// ── TC-E-07 ──────────────────────────────────────────────────────────────────

test('TC-E-07: DynamicBackground container has a data-theme attribute set to a theme value', async ({ page }) => {
  await page.goto('/')

  // data-theme is our testable proxy for the CSS-Module-scoped bg/theme class pair
  const bg = page.locator('[data-theme]').first()
  await expect(bg).toBeVisible()

  const theme = await bg.getAttribute('data-theme')
  expect(theme).toBeTruthy()
  // before a city is selected the default theme is 'cloudy'
  expect(theme).toBe('cloudy')
})
