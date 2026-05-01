// TEST EVIDENCE TABLE
// ID     | Description                                                                    | Input / Action                                           | Expected Output                                                  | Notes
// --------|--------------------------------------------------------------------------------|----------------------------------------------------------|------------------------------------------------------------------|----------------------------------------------------------
// TC-E-12 | /saved shows empty-state message when no saved locations                       | page.goto('/saved'); GET mock → []                       | "No saved cities yet." visible                                   | Supabase GET returns empty array; count===0 renders empty state
// TC-E-13 | clicking "Save this city" after searching London adds it to the saved list     | search → click Save; POST mock captures; navigate /saved | "London" visible in saved list                                   | stateful mock: POST sets savedData; GET returns it on /saved load
// TC-E-14 | clicking Delete with window.confirm adds confirmation removes the city         | /saved with London; click Delete; accept confirm         | "No saved cities yet." visible after deletion                    | component filters locally after DELETE; empty state re-appears
// TC-E-15 | clicking "Load weather" on a saved city navigates to "/" with weather shown    | /saved with London; click "Load weather"                 | URL=='/'; article "Current weather for London" visible           | handleLoad calls setSelectedCity + navigate('/'); OWM mock returns fixture

import { test, expect } from '@playwright/test'
import { currentWeatherFixture, forecastFixture } from '../fixtures/weatherFixtures.js'

const londonRecord = {
  id: 'loc-1',
  city_name: 'London',
  country_code: 'GB',
  lat: 51.5085,
  lon: -0.1257,
  created_at: '2026-04-28T12:00:00.000Z',
}

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
})

// ── TC-E-12 ──────────────────────────────────────────────────────────────────

test('TC-E-12: /saved shows the empty-state message when there are no saved locations', async ({ page }) => {
  await page.route('**/rest/v1/saved_locations**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  )

  await page.goto('/saved')

  await expect(page.getByText('No saved cities yet.')).toBeVisible()
})

// ── TC-E-13 ──────────────────────────────────────────────────────────────────

test('TC-E-13: clicking "Save this city" after searching London adds London to the saved list', async ({ page }) => {
  // stateful mock: POST inserts the record; subsequent GETs return it
  let savedData = []

  await page.route('**/rest/v1/saved_locations**', async (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(savedData),
      })
    } else if (method === 'POST') {
      savedData = [londonRecord]
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([londonRecord]),
      })
    } else {
      await route.continue()
    }
  })

  // search London and wait for weather card
  await page.goto('/')
  await page.getByRole('combobox').fill('London')
  await page.getByRole('combobox').press('Enter')
  await expect(
    page.getByRole('article', { name: /Current weather for London/i }),
  ).toBeVisible({ timeout: 5000 })

  // click the save button — aria-label is "Save London to your saved locations"
  const saveBtn = page.getByRole('button', { name: /Save London to your saved locations/i })
  await saveBtn.click()

  // wait for the saved-state feedback (button text transitions to "✓ Saved!")
  await expect(saveBtn).toContainText('Saved', { timeout: 3000 })

  // navigate to Saved Locations; GET now returns [londonRecord]
  await page.getByRole('link', { name: /Saved Locations/i }).click()
  await expect(page).toHaveURL(/\/saved/)

  await expect(page.getByRole('cell', { name: 'London', exact: true })).toBeVisible({ timeout: 3000 })
})

// ── TC-E-14 ──────────────────────────────────────────────────────────────────

test('TC-E-14: clicking Delete and confirming removes the city from the saved list', async ({ page }) => {
  await page.route('**/rest/v1/saved_locations**', async (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([londonRecord]),
      })
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    } else {
      await route.continue()
    }
  })

  await page.goto('/saved')
  await expect(page.getByRole('cell', { name: 'London', exact: true })).toBeVisible({ timeout: 3000 })

  // accept the window.confirm dialog before clicking Delete so it doesn't block
  page.on('dialog', (dialog) => dialog.accept())

  // aria-label is "Delete London" on both table and card buttons; table is visible at desktop
  await page.getByRole('button', { name: 'Delete London' }).first().click()

  // component calls setLocations(prev => prev.filter(...)) locally after DELETE — no refetch needed
  await expect(page.getByText('No saved cities yet.')).toBeVisible({ timeout: 3000 })
})

// ── TC-E-15 ──────────────────────────────────────────────────────────────────

test('TC-E-15: clicking "Load weather" on a saved city navigates to "/" and shows its weather', async ({ page }) => {
  await page.route('**/rest/v1/saved_locations**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([londonRecord]),
    }),
  )

  await page.goto('/saved')
  await expect(page.getByRole('cell', { name: 'London', exact: true })).toBeVisible({ timeout: 3000 })

  // "Load weather" button in the desktop table row
  await page.getByRole('button', { name: 'Load weather' }).click()

  // handleLoad calls setSelectedCity('London') then navigate('/'); context is preserved
  await expect(page).toHaveURL('http://localhost:5173/')
  await expect(
    page.getByRole('article', { name: /Current weather for London/i }),
  ).toBeVisible({ timeout: 5000 })
})
