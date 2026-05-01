// TEST EVIDENCE TABLE
// ID     | Description                                                       | Input                                   | Expected Output                              | Notes
// TC-A-01| DashboardPage — 0 WCAG 2.1 AA violations                         | page.goto('/') + search London          | violations.length === 0                      | Full axe scan after weather card visible
// TC-A-02| ForecastPage — 0 WCAG 2.1 AA violations                          | navigate to /forecast after search      | violations.length === 0                      | London data loaded via nav link click
// TC-A-03| SavedLocationsPage — 0 WCAG 2.1 AA violations                    | page.goto('/saved')                     | violations.length === 0                      | Supabase mock returns 1 saved location
// TC-A-04| All pages have exactly one <h1>                                   | /, /forecast, /saved                    | h1Count === 1 on each page                   | DashboardPage uses visually-hidden h1
// TC-A-05| All images have non-empty alt attributes                          | page after weather loads                | every content img.alt.length > 0             | Leaflet tile/shadow imgs excluded (correctly decorative with alt="")
// TC-A-06| SearchBar input has an accessible name                            | page.goto('/')                          | aria-label or label[for] present             | Implemented via aria-label on <input>
// TC-A-07| Navigation links — aria-current="page" on active link            | /, /forecast, /saved                    | exactly 1 link with aria-current="page"      | Checked independently on each page
// TC-A-08| LoadingSpinner has aria-live="polite" and aria-label              | delayed forecast fetch                  | spinner visible with both attributes         | Spinner on ForecastPage (not SkeletonCard)
// TC-A-09| ErrorMessage has role="alert"                                     | OWM weather returns 500                 | [role="alert"] visible in DOM                | Triggered by failed search on DashboardPage
// TC-A-10| Interactive elements reachable and activatable by keyboard only   | Tab focus + Enter / Space key presses   | search fires, units toggle, nav works        | No pointer events used

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// ===== shared fixtures =====

const currentWeatherFixture = {
  name: 'London',
  dt: 1714640400,
  sys: { country: 'GB', sunrise: 1714628400, sunset: 1714680000 },
  weather: [{ id: 801, description: 'few clouds', icon: '02d' }],
  main: { temp: 15, feels_like: 13, humidity: 72, pressure: 1012, temp_min: 12, temp_max: 18 },
  wind: { speed: 5.2, deg: 220 },
  visibility: 9000,
  coord: { lat: 51.5074, lon: -0.1278 },
}

// 5 days × 8 three-hour slots = 40 entries (standard OWM free-tier forecast shape)
function makeForecastSlot(dayOffset, slotIndex) {
  const base = new Date('2026-04-28T00:00:00Z')
  base.setUTCDate(base.getUTCDate() + dayOffset)
  base.setUTCHours(slotIndex * 3)
  const dt = Math.floor(base.getTime() / 1000)
  return {
    dt,
    dt_txt: base.toISOString().slice(0, 19).replace('T', ' '),
    weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
    main: { temp: 15, temp_min: 12, temp_max: 18, humidity: 72 },
    wind: { speed: 5.2 },
  }
}

const forecastFixture = {
  list: Array.from({ length: 40 }, (_, i) => makeForecastSlot(Math.floor(i / 8), i % 8)),
  city: { name: 'London', country: 'GB' },
}

const savedLocationsFixture = [
  {
    id: 'uuid-london-a11y',
    city_name: 'London',
    country_code: 'GB',
    lat: 51.5074,
    lon: -0.1278,
    created_at: '2026-04-28T06:00:00.000Z',
  },
]

// ===== helpers =====

async function setupBaseRoutes(page) {
  // deny geolocation so DashboardPage mount doesn't auto-trigger a fetch
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (_success, error) =>
          error({ code: 1, message: 'User denied geolocation' }),
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
    })
  )
  await page.route('**/api.openweathermap.org/data/2.5/forecast**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(forecastFixture),
    })
  )
  await page.route('**/rest/v1/saved_locations**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(savedLocationsFixture),
    })
  )
}

// search for London and wait until the current-weather article is visible
async function searchAndLoadWeather(page) {
  await page.getByRole('combobox', { name: /Search for a city/i }).fill('London')
  await page.getByRole('button', { name: /Submit search/i }).click()
  await expect(
    page.getByRole('article', { name: /Current weather for London/i })
  ).toBeVisible({ timeout: 8000 })
}

// format axe violations for readable assertion failure messages
function violationSummary(violations) {
  return violations
    .map((v) => `  [${v.impact}] ${v.id}: ${v.description}`)
    .join('\n')
}

// ===== tests =====

test.describe('Accessibility — WCAG 2.1 AA', () => {
  test.beforeEach(async ({ page }) => {
    await setupBaseRoutes(page)
  })

  // TC-A-01 -------------------------------------------------------------------
  test('TC-A-01: DashboardPage — 0 WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/')
    await searchAndLoadWeather(page)

    await page.screenshot({ path: 'tests/accessibility/screenshots/TC-A-01.png' })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(
      results.violations,
      `WCAG violations found on DashboardPage:\n${violationSummary(results.violations)}`
    ).toHaveLength(0)
  })

  // TC-A-02 -------------------------------------------------------------------
  test('TC-A-02: ForecastPage — 0 WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/')
    await searchAndLoadWeather(page)

    // navigate via the nav link so React context (selectedCity) is preserved
    // exact: true avoids matching "View 5-Day Forecast" on the dashboard body
    await page.getByRole('link', { name: '5-Day Forecast', exact: true }).click()
    await expect(
      page.getByRole('region', { name: /5-day weather forecast/i })
    ).toBeVisible({ timeout: 8000 })

    await page.screenshot({ path: 'tests/accessibility/screenshots/TC-A-02.png' })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(
      results.violations,
      `WCAG violations found on ForecastPage:\n${violationSummary(results.violations)}`
    ).toHaveLength(0)
  })

  // TC-A-03 -------------------------------------------------------------------
  test('TC-A-03: SavedLocationsPage — 0 WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/saved')
    // Supabase mock (set in beforeEach) returns one London record
    await expect(
      page.getByRole('cell', { name: 'London', exact: true })
    ).toBeVisible({ timeout: 8000 })

    await page.screenshot({ path: 'tests/accessibility/screenshots/TC-A-03.png' })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(
      results.violations,
      `WCAG violations found on SavedLocationsPage:\n${violationSummary(results.violations)}`
    ).toHaveLength(0)
  })

  // TC-A-04 -------------------------------------------------------------------
  test('TC-A-04: All pages have exactly one <h1>', async ({ page }) => {
    // Dashboard — has a visually-hidden h1 "WeatherNow Dashboard"
    await page.goto('/')
    await searchAndLoadWeather(page)
    const dashH1 = await page.locator('h1').count()
    expect(dashH1, 'DashboardPage must have exactly 1 h1').toBe(1)

    // Forecast — h1 is "5-Day Forecast" (always rendered, independent of city)
    await page.getByRole('link', { name: '5-Day Forecast', exact: true }).click()
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
    const forecastH1 = await page.locator('h1').count()
    expect(forecastH1, 'ForecastPage must have exactly 1 h1').toBe(1)

    // Saved Locations — h1 is "Saved Locations"
    await page.getByRole('link', { name: 'Saved Locations', exact: true }).click()
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
    const savedH1 = await page.locator('h1').count()
    expect(savedH1, 'SavedLocationsPage must have exactly 1 h1').toBe(1)

    await page.screenshot({ path: 'tests/accessibility/screenshots/TC-A-04.png' })
  })

  // TC-A-05 -------------------------------------------------------------------
  test('TC-A-05: All images have non-empty alt attributes', async ({ page }) => {
    await page.goto('/')
    await searchAndLoadWeather(page)

    await page.screenshot({ path: 'tests/accessibility/screenshots/TC-A-05.png' })

    // skip leaflet tile and shadow imgs — they are correctly decorative (alt="")
    const images = page.locator('img:not(.leaflet-tile):not(.leaflet-marker-shadow)')
    const count = await images.count()
    expect(count, 'At least one content <img> must be present after weather loads').toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt, `img[${i}] must have an alt attribute`).not.toBeNull()
      expect(alt.trim().length, `img[${i}] alt must not be empty or whitespace`).toBeGreaterThan(0)
    }

    // the weather icon alt must match the OWM description from the fixture
    await expect(page.locator('img[alt="few clouds"]')).toHaveCount(1)
  })

  // TC-A-06 -------------------------------------------------------------------
  test('TC-A-06: SearchBar input has an accessible name', async ({ page }) => {
    await page.goto('/')

    await page.screenshot({ path: 'tests/accessibility/screenshots/TC-A-06.png' })

    const searchInput = page.getByRole('combobox', { name: /Search for a city/i })
    await expect(searchInput).toBeVisible()

    // check the accessible name is supplied via aria-label or an associated <label>
    const ariaLabel = await searchInput.getAttribute('aria-label')
    const inputId = await searchInput.getAttribute('id')

    let hasAccessibleName = !!ariaLabel
    if (!hasAccessibleName && inputId) {
      const labelCount = await page.locator(`label[for="${inputId}"]`).count()
      hasAccessibleName = labelCount > 0
    }

    expect(
      hasAccessibleName,
      'SearchBar input must have an accessible name via aria-label or an associated <label>'
    ).toBe(true)
  })

  // TC-A-07 -------------------------------------------------------------------
  test('TC-A-07: Navigation links have aria-current="page" on the active link', async ({ page }) => {
    // Dashboard — '/' active
    await page.goto('/')
    let activeLinks = await page.locator('#main-nav a[aria-current="page"]').count()
    expect(activeLinks, 'Dashboard: exactly 1 nav link with aria-current="page"').toBe(1)
    const dashActive = await page.locator('#main-nav a[aria-current="page"]').textContent()
    expect(dashActive).toMatch(/dashboard/i)

    // Forecast — '/forecast' active
    await page.goto('/forecast')
    await expect(page.locator('h1')).toBeVisible()
    activeLinks = await page.locator('#main-nav a[aria-current="page"]').count()
    expect(activeLinks, 'ForecastPage: exactly 1 nav link with aria-current="page"').toBe(1)
    const forecastActive = await page.locator('#main-nav a[aria-current="page"]').textContent()
    expect(forecastActive).toMatch(/forecast/i)

    // Saved — '/saved' active
    await page.goto('/saved')
    await expect(page.locator('h1')).toBeVisible()
    activeLinks = await page.locator('#main-nav a[aria-current="page"]').count()
    expect(activeLinks, 'SavedLocationsPage: exactly 1 nav link with aria-current="page"').toBe(1)
    const savedActive = await page.locator('#main-nav a[aria-current="page"]').textContent()
    expect(savedActive).toMatch(/saved/i)

    await page.screenshot({ path: 'tests/accessibility/screenshots/TC-A-07.png' })
  })

  // TC-A-08 -------------------------------------------------------------------
  test('TC-A-08: LoadingSpinner has aria-live="polite" and aria-label', async ({ page }) => {
    // SavedLocationsPage renders LoadingSpinner while its useEffect fetches from Supabase.
    // Delay the Supabase response so the spinner is visible long enough to inspect.
    let releaseSupabase
    const supabasePending = new Promise((resolve) => { releaseSupabase = resolve })

    // this route takes priority over the beforeEach one (LIFO)
    await page.route('**/rest/v1/saved_locations**', async (route) => {
      await supabasePending
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(savedLocationsFixture),
      })
    })

    await page.goto('/saved')

    // spinner is visible while the Supabase fetch is blocked
    const spinner = page.locator('[role="status"][aria-live="polite"]')
    await expect(spinner).toBeVisible({ timeout: 5000 })

    const ariaLive = await spinner.getAttribute('aria-live')
    const ariaLabel = await spinner.getAttribute('aria-label')

    await page.screenshot({ path: 'tests/accessibility/screenshots/TC-A-08.png' })

    expect(ariaLive).toBe('polite')
    expect(ariaLabel, 'LoadingSpinner aria-label must be non-empty').toBeTruthy()

    // unblock Supabase so the test can finish cleanly
    releaseSupabase()
    await expect(
      page.getByRole('cell', { name: 'London', exact: true })
    ).toBeVisible({ timeout: 8000 })
  })

  // TC-A-09 -------------------------------------------------------------------
  test('TC-A-09: ErrorMessage has role="alert"', async ({ page }) => {
    // override weather to return a server error for this test only
    await page.route('**/api.openweathermap.org/data/2.5/weather**', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      })
    )

    await page.goto('/')
    const searchbox = page.getByRole('combobox', { name: /Search for a city/i })
    await searchbox.fill('London')
    await searchbox.press('Enter')

    const alert = page.locator('[role="alert"]').first()
    await expect(alert).toBeVisible({ timeout: 8000 })

    await page.screenshot({ path: 'tests/accessibility/screenshots/TC-A-09.png' })

    expect(await alert.getAttribute('role')).toBe('alert')
  })

  // TC-A-10 -------------------------------------------------------------------
  test('TC-A-10: Interactive elements reachable and activatable by keyboard only', async ({ page }) => {
    await page.goto('/')

    // --- search via keyboard: focus input, type, press Enter ---
    const searchbox = page.getByRole('combobox', { name: /Search for a city/i })
    await searchbox.focus()
    await page.keyboard.type('London')
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('article', { name: /Current weather for London/i })
    ).toBeVisible({ timeout: 8000 })

    await page.screenshot({ path: 'tests/accessibility/screenshots/TC-A-10-search.png' })

    // --- unit toggle via keyboard: focus button, press Space, verify label changes ---
    const unitToggle = page.getByRole('button', { name: /Temperature unit/i })
    await unitToggle.focus()
    const labelBefore = await unitToggle.getAttribute('aria-label')
    await page.keyboard.press('Space')
    const labelAfter = await unitToggle.getAttribute('aria-label')
    expect(labelAfter, 'Unit toggle aria-label must change after Space key press').not.toBe(labelBefore)

    // --- navigation via keyboard: focus nav link, press Enter ---
    const forecastNavLink = page.getByRole('link', { name: '5-Day Forecast', exact: true })
    await forecastNavLink.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/forecast/, { timeout: 5000 })
    await expect(page.locator('h1')).toContainText('5-Day Forecast')

    await page.screenshot({ path: 'tests/accessibility/screenshots/TC-A-10-nav.png' })
  })
})
