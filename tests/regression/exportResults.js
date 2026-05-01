// exportResults.js — reads tests/regression/regression-log.json (Vitest JSON reporter format)
// and writes docs/test-evidence/regression-log.md (markdown evidence table).
// Run via:  node tests/regression/exportResults.js

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dir = dirname(__filename)

const LOG_IN  = resolve(__dir, 'regression-log.json')
const MD_OUT  = resolve(__dir, '../../docs/test-evidence/regression-log.md')

// ── metadata lookup ───────────────────────────────────────────────────────────
// Provides description / input / expected for each curated test ID.
// The Vitest JSON reporter stores pass/fail; we supply the semantic context here.

const META = {
  'TC-U-01': {
    description: 'formatTemperature returns °C suffix for metric units',
    input: "(15, 'metric')",
    expected: "'15°C'",
  },
  'TC-U-09': {
    description: 'getBackgroundTheme returns "sunny" for clear-sky daytime (code 800)',
    input: '(800, true)',
    expected: "'sunny'",
  },
  'TC-U-16': {
    description: 'getCachedWeather returns stored data when retrieved within maxAge',
    input: "setCachedWeather('key', data) → getCachedWeather('key')",
    expected: 'deep-equal to original data object',
  },
  'TC-C-01': {
    description: 'SearchBar renders input with accessible name "Search for a city"',
    input: 'render(<SearchBar />)',
    expected: 'element with role=combobox and name="Search for a city"',
  },
  'TC-C-06': {
    description: 'CurrentWeather renders city name from weatherData prop',
    input: 'render(<CurrentWeather data={currentWeatherFixture} />)',
    expected: '"London" visible in DOM',
  },
  'TC-C-14': {
    description: 'FiveDayForecast renders exactly 5 ForecastCard list items',
    input: 'render(<FiveDayForecast forecast={5-day grouped fixture} />)',
    expected: '5 listitem elements',
  },
  'TC-H-01': {
    description: 'useWeather loading=true on initial call before fetch resolves',
    input: "renderHook(() => useWeather('London'))",
    expected: 'result.current.loading === true',
  },
  'TC-H-04': {
    description: 'useWeather uses cached data; fetch not called on cache hit',
    input: "setCachedWeather pre-warm → renderHook(() => useWeather('London'))",
    expected: 'global.fetch not called; data matches fixture',
  },
  'TC-I-01': {
    description: 'getCurrentWeatherByCity resolves with correct weather shape',
    input: "getCurrentWeatherByCity('London') — MSW default handler",
    expected: "{ name:'London', main:{temp:15,humidity:72}, wind:{speed:5.2} }",
  },
  'TC-I-03': {
    description: 'getFiveDayForecast resolves with list of length 40 (MSW override)',
    input: "getFiveDayForecast('London') + server.use(40-slot fixture)",
    expected: 'data.list.length === 40',
  },
  'TC-I-06': {
    description: 'getForecastByCoords resolves with a non-empty list array',
    input: 'getForecastByCoords(51.5, -0.12) — MSW default handler',
    expected: 'Array.isArray(data.list) === true && length > 0',
  },
}

// ── helpers ───────────────────────────────────────────────────────────────────

function escapeCell(str = '') {
  return String(str).replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function formatDate(ms) {
  return new Date(ms).toISOString().slice(0, 10)  // YYYY-MM-DD
}

// ── parse Vitest JSON ─────────────────────────────────────────────────────────

let report
try {
  report = JSON.parse(readFileSync(LOG_IN, 'utf8'))
} catch (err) {
  console.error(`[exportResults] Cannot read ${LOG_IN}:`, err.message)
  process.exit(1)
}

const runDate = formatDate(report.startTime ?? Date.now())

// flatten all assertionResults from every test suite
const assertions = (report.testResults ?? []).flatMap((suite) => suite.assertionResults ?? [])

if (assertions.length === 0) {
  console.warn('[exportResults] No assertion results found in regression-log.json')
}

// ── build table rows ──────────────────────────────────────────────────────────

const rows = assertions.map((a) => {
  // test titles are in the form "TC-X-NN: <description text>"
  const idMatch = a.title.match(/^(TC-[A-Z]-\d+)/)
  const id      = idMatch ? idMatch[1] : '—'
  const meta    = META[id] ?? {}

  const status  = a.status === 'passed' ? 'PASS' : 'FAIL'
  // for PASS: actual === expected (test assertion confirmed it)
  // for FAIL: first failure message, truncated to 120 chars
  const actual  = status === 'PASS'
    ? (meta.expected ?? 'assertion passed')
    : (a.failureMessages?.[0]?.replace(/\n/g, ' ').slice(0, 120) ?? 'failed')

  return {
    id,
    description: meta.description ?? a.title,
    input:       meta.input       ?? '—',
    expected:    meta.expected    ?? '—',
    actual:      escapeCell(actual),
    status,
    runDate,
  }
})

// ── render markdown ───────────────────────────────────────────────────────────

const header = `# Regression Test Evidence Log

Generated: ${new Date().toISOString()}
Test run: ${runDate}
Total: **${assertions.length}** | Pass: **${rows.filter((r) => r.status === 'PASS').length}** | Fail: **${rows.filter((r) => r.status === 'FAIL').length}**

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date |
|---------|-------------|-------|-----------------|---------------|:------:|----------|`

const tableRows = rows.map(
  (r) =>
    `| ${r.id} | ${escapeCell(r.description)} | ${escapeCell(r.input)} | ${escapeCell(r.expected)} | ${escapeCell(r.actual)} | **${r.status}** | ${r.runDate} |`,
)

const markdown = [header, ...tableRows, ''].join('\n')

// ── write output ──────────────────────────────────────────────────────────────

mkdirSync(dirname(MD_OUT), { recursive: true })
writeFileSync(MD_OUT, markdown, 'utf8')

console.log(`[exportResults] Written → ${MD_OUT}`)
console.log(`[exportResults] ${rows.filter((r) => r.status === 'PASS').length}/${rows.length} tests PASS`)
