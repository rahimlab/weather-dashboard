# Regression Test Evidence Log

Generated: 2026-04-29T16:21:08.305Z
Test run: 2026-04-29
Total: **11** | Pass: **11** | Fail: **0**

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date |
|---------|-------------|-------|-----------------|---------------|:------:|----------|
| TC-U-01 | formatTemperature returns °C suffix for metric units | (15, 'metric') | '15°C' | '15°C' | **PASS** | 2026-04-29 |
| TC-U-09 | getBackgroundTheme returns "sunny" for clear-sky daytime (code 800) | (800, true) | 'sunny' | 'sunny' | **PASS** | 2026-04-29 |
| TC-U-16 | getCachedWeather returns stored data when retrieved within maxAge | setCachedWeather('key', data) → getCachedWeather('key') | deep-equal to original data object | deep-equal to original data object | **PASS** | 2026-04-29 |
| TC-C-01 | SearchBar renders input with accessible name "Search for a city" | render(<SearchBar />) | element with role=combobox and name="Search for a city" | element with role=combobox and name="Search for a city" | **PASS** | 2026-04-29 |
| TC-C-06 | CurrentWeather renders city name from weatherData prop | render(<CurrentWeather data={currentWeatherFixture} />) | "London" visible in DOM | "London" visible in DOM | **PASS** | 2026-04-29 |
| TC-C-14 | FiveDayForecast renders exactly 5 ForecastCard list items | render(<FiveDayForecast forecast={5-day grouped fixture} />) | 5 listitem elements | 5 listitem elements | **PASS** | 2026-04-29 |
| TC-H-01 | useWeather loading=true on initial call before fetch resolves | renderHook(() => useWeather('London')) | result.current.loading === true | result.current.loading === true | **PASS** | 2026-04-29 |
| TC-H-04 | useWeather uses cached data; fetch not called on cache hit | setCachedWeather pre-warm → renderHook(() => useWeather('London')) | global.fetch not called; data matches fixture | global.fetch not called; data matches fixture | **PASS** | 2026-04-29 |
| TC-I-01 | getCurrentWeatherByCity resolves with correct weather shape | getCurrentWeatherByCity('London') — MSW default handler | { name:'London', main:{temp:15,humidity:72}, wind:{speed:5.2} } | { name:'London', main:{temp:15,humidity:72}, wind:{speed:5.2} } | **PASS** | 2026-04-29 |
| TC-I-03 | getFiveDayForecast resolves with list of length 40 (MSW override) | getFiveDayForecast('London') + server.use(40-slot fixture) | data.list.length === 40 | data.list.length === 40 | **PASS** | 2026-04-29 |
| TC-I-06 | getForecastByCoords resolves with a non-empty list array | getForecastByCoords(51.5, -0.12) — MSW default handler | Array.isArray(data.list) === true && length > 0 | Array.isArray(data.list) === true && length > 0 | **PASS** | 2026-04-29 |
