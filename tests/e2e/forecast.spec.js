// TEST EVIDENCE TABLE
// ID     | Description                                                              | Input / Action                                    | Expected Output                                            | Notes
// --------|--------------------------------------------------------------------------|---------------------------------------------------|------------------------------------------------------------|-----------------------------------------------------------
// TC-E-08 | navigating to /forecast without a city shows "Search for a city first"   | page.goto('/forecast')                            | empty-state paragraph visible                              | selectedCity=null in fresh context; ForecastPage renders empty state
// TC-E-09 | after searching London, navigating to /forecast shows 5 forecast cards   | search → click forecast link                      | 5 article[aria-label^="Forecast for"] elements             | forecastFixture has 5 entries (1 per day); groupByDay → 5 cards
// TC-E-10 | clicking a forecast card's "Hourly" button expands its hourly detail      | click Hourly button on first card                 | aria-expanded="true" on button; "Less" text shown          | ForecastCard toggles expanded state; hourlyEntries.length > 0
// TC-E-11 | clicking "← Back to Dashboard" on /forecast returns to "/"              | page.goto('/forecast'); click back link           | page URL === '/'                                           | React Router Link; no selectedCity needed

import { test, expect } from '@playwright/test'
import { currentWeatherFixture, forecastFixture } from '../fixtures/weatherFixtures.js'

test.beforeEach(async ({ page }) => {
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

  await page.route('**/rest/v1/saved_locations**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  )
})

// ── TC-E-08 ──────────────────────────────────────────────────────────────────

test('TC-E-08: navigating to /forecast without a city shows the empty-state message', async ({ page }) => {
  // fresh page load at /forecast → React Context has no selectedCity
  await page.goto('/forecast')

  await expect(
    page.getByText('Search for a city on the dashboard first to see its forecast.'),
  ).toBeVisible()
})

// ── TC-E-09 ──────────────────────────────────────────────────────────────────

test('TC-E-09: after searching London and clicking the forecast link, 5 cards appear', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox').fill('London')
  await page.getByRole('combobox').press('Enter')

  // wait for weather to load before clicking the link
  await expect(
    page.getByRole('article', { name: /Current weather for London/i }),
  ).toBeVisible({ timeout: 5000 })

  // client-side navigation preserves React Context (selectedCity stays 'London')
  await page.getByRole('link', { name: /View 5-Day Forecast/i }).click()
  await expect(page).toHaveURL(/\/forecast/)

  // forecastFixture has 5 entries across 5 distinct days → groupByDay produces 5 cards
  const cards = page.locator('article[aria-label^="Forecast for"]')
  await expect(cards).toHaveCount(5, { timeout: 5000 })
})

// ── TC-E-10 ──────────────────────────────────────────────────────────────────

test('TC-E-10: clicking a forecast card\'s "Hourly" button expands the hourly detail section', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox').fill('London')
  await page.getByRole('combobox').press('Enter')
  await expect(
    page.getByRole('article', { name: /Current weather for London/i }),
  ).toBeVisible({ timeout: 5000 })

  await page.getByRole('link', { name: /View 5-Day Forecast/i }).click()

  const firstCard = page.locator('article[aria-label^="Forecast for"]').first()
  await expect(firstCard).toBeVisible({ timeout: 5000 })

  // each card has 1 hourlyEntry from the fixture → "Hourly" toggle button renders
  const hourlyBtn = firstCard.getByRole('button', { name: /Hourly/i })
  await expect(hourlyBtn).toBeVisible()
  await hourlyBtn.click()

  // after click: text changes to "Less" and aria-expanded flips to "true"
  const lessBtn = firstCard.getByRole('button', { name: /Less/i })
  await expect(lessBtn).toHaveAttribute('aria-expanded', 'true')
})

// ── TC-E-11 ──────────────────────────────────────────────────────────────────

test('TC-E-11: clicking "← Back to Dashboard" on the forecast page returns to "/"', async ({ page }) => {
  await page.goto('/forecast')

  await page.getByRole('link', { name: /← Back to Dashboard/i }).click()

  await expect(page).toHaveURL('http://localhost:5173/')
})
