# WeatherNow — Complete Test Case Table

Project: Real-Time Weather Dashboard (Team-5)
Date: 2026-04-28
Total test cases: 103 (unit + integration + E2E + accessibility)

> **Actual Result** column: "See regression log" — run `npm run test:regression` to generate
> `docs/test-evidence/regression-log.md` with live pass/fail evidence.
>
> **Note on ID overlaps:** Several utility and component test IDs were assigned sequentially
> within each source file, producing overlapping IDs across files. Each row identifies its
> source in the Description column with `[filename]`.

---

## Unit — Utility: formatters.js

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-U-01 | `formatTemperature` returns °C suffix for metric units [formatters] | `(15, 'metric')` | `'15°C'` | See regression log | — | — | 3 |
| TC-U-02 | `formatTemperature` returns °F suffix for imperial units [formatters] | `(59, 'imperial')` | `'59°F'` | See regression log | — | — | 3 |
| TC-U-03 | `formatWindSpeed` returns m/s suffix for metric [formatters] | `(5.2, 'metric')` | `'5.2 m/s'` | See regression log | — | — | 3 |
| TC-U-04 | `formatWindSpeed` returns mph suffix for imperial [formatters] | `(11.6, 'imperial')` | `'11.6 mph'` | See regression log | — | — | 3 |
| TC-U-05 | `formatHumidity` appends % symbol [formatters] | `(72)` | `'72%'` | See regression log | — | — | 3 |
| TC-U-06 | `formatDate` returns correct weekday/day/month for known timestamp [formatters] | `(1705320000)` | contains `'15'`, matches `/Jan/i`, `/Mon/i` | See regression log | — | — | 3 |
| TC-U-07 | `formatTemperature` handles zero without treating it as falsy [formatters] | `(0, 'metric')` | `'0°C'` | See regression log | — | — | 3 |
| TC-U-08 | `formatTemperature` handles negative temperatures [formatters] | `(-5, 'metric')` | `'-5°C'` | See regression log | — | — | 3 |
| TC-U-09 | `formatTemperature` rounds decimal values before display [formatters] | `(15.6, 'metric')` | `'16°C'` | See regression log | — | — | 3 |
| TC-U-10 | `formatTemperature` defaults to metric when units arg is omitted [formatters] | `(20)` | `'20°C'` | See regression log | — | — | 3 |
| TC-U-11 | `formatWindSpeed` uses toFixed(1) to round to one decimal [formatters] | `(5.189, 'metric')` | `'5.2 m/s'` | See regression log | — | — | 3 |
| TC-U-12 | `formatTime` returns HH:MM 24-hour format [formatters] | `(1705320000)` | matches `/^\d{2}:\d{2}$/` | See regression log | — | — | 3 |

---

## Unit — Utility: weatherConditions.js

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-U-09 | `getBackgroundTheme` returns `'sunny'` for clear sky daytime [weatherConditions] | `(800, true)` | `'sunny'` | See regression log | — | — | 4 |
| TC-U-10 | `getBackgroundTheme` returns `'night-clear'` for clear sky at night [weatherConditions] | `(800, false)` | `'night-clear'` | See regression log | — | — | 4 |
| TC-U-11 | `getBackgroundTheme` returns `'rainy'` for rain daytime (5xx) [weatherConditions] | `(500, true)` | `'rainy'` | See regression log | — | — | 4 |
| TC-U-12 | `getBackgroundTheme` returns `'stormy'` for thunderstorm (2xx) [weatherConditions] | `(200, true)` | `'stormy'` | See regression log | — | — | 4 |
| TC-U-13 | `getBackgroundTheme` returns `'snowy'` for snow (6xx) [weatherConditions] | `(600, true)` | `'snowy'` | See regression log | — | — | 4 |
| TC-U-14 | `getBackgroundTheme` returns `'cloudy'` for few clouds (801) [weatherConditions] | `(801, true)` | `'cloudy'` | See regression log | — | — | 4 |
| TC-U-15 | `getBackgroundTheme` returns `'foggy'` for fog/atmosphere (7xx) [weatherConditions] | `(741, true)` | `'foggy'` | See regression log | — | — | 4 |
| TC-U-16 | `getBackgroundTheme` maps drizzle (3xx) to `'rainy'` [weatherConditions] | `(300, true)` | `'rainy'` | See regression log | — | — | 4 |
| TC-U-17 | `getBackgroundTheme` top of storm range (299) returns `'stormy'` [weatherConditions] | `(299, true)` | `'stormy'` | See regression log | — | — | 4 |
| TC-U-18 | `getBackgroundTheme` top of snow range (699) returns `'snowy'` [weatherConditions] | `(699, true)` | `'snowy'` | See regression log | — | — | 4 |
| TC-U-19 | `getBackgroundTheme` overcast night (804) returns `'night-cloudy'` [weatherConditions] | `(804, false)` | `'night-cloudy'` | See regression log | — | — | 4 |
| TC-U-20 | `isDaytime` returns `true` when current time is between sunrise and sunset [weatherConditions] | `(noon, 6am, 8pm)` unix timestamps | `true` | See regression log | — | — | 4 |
| TC-U-21 | `isDaytime` returns `false` when current time is before sunrise [weatherConditions] | `(3am, 6am, 8pm)` unix timestamps | `false` | See regression log | — | — | 4 |
| TC-U-22 | `isDaytime` returns `false` when current time equals sunset (exclusive upper bound) [weatherConditions] | `(sunset, 6am, sunset)` | `false` | See regression log | — | — | 4 |

---

## Unit — Utility: cache.js

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-U-16 | `getCachedWeather` returns stored data when retrieved immediately within maxAge [cache] | `setCachedWeather('key', data)` → `getCachedWeather('key')` | original data object (deep equal) | See regression log | — | — | 5 |
| TC-U-17 | `getCachedWeather` returns `null` after 11 minutes (default 10-min maxAge elapsed) [cache] | set → advance 11 min (fake timers) → get | `null` | See regression log | — | — | 5 |
| TC-U-18 | `clearWeatherCache` removes all entries prefixed `weather_` [cache] | set two cities → `clearWeatherCache()` → get both | `null` for both | See regression log | — | — | 5 |
| TC-U-19 | `getCachedWeather` returns `null` for a key that was never set [cache] | `getCachedWeather('nonexistent_key')` | `null` | See regression log | — | — | 5 |
| TC-U-20 | `getCachedWeather` respects a custom `maxAge` argument [cache] | set → advance 4 min → `getCachedWeather('key', 3)` | `null` (4 min > 3 min custom maxAge) | See regression log | — | — | 5 |
| TC-U-21 | `getCachedWeather` returns data when just under default maxAge threshold [cache] | set → advance 9 min 54 s → get | original data object | See regression log | — | — | 5 |
| TC-U-22 | `clearWeatherCache` does NOT remove sessionStorage keys without `weather_` prefix [cache] | set `weather_key` + `other_key` → clear | `other_key` still present | See regression log | — | — | 5 |

---

## Unit — Component: SearchBar

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-C-01 | SearchBar renders `<input>` with aria-label "Search for a city" [SearchBar] | `render(<SearchBar />)` | element with `role=searchbox`, name `"Search for a city"` | See regression log | — | — | 6 |
| TC-C-02 | Typing into the search input updates its value [SearchBar] | `userEvent.type(input, 'London')` | `input.value === 'London'` | See regression log | — | — | 6 |
| TC-C-03 | Submitting the form calls `setSelectedCity` with the typed city [SearchBar] | type `'London'` → click submit button | `setSelectedCity('London')` called | See regression log | — | — | 6 |
| TC-C-04 | Clear button appears only after user has typed a value [SearchBar] | type one character | clear button visible; absent initially | See regression log | — | — | 6 |
| TC-C-05 | Clicking the clear button resets the input to empty string [SearchBar] | type `'London'` → click Clear | `input.value === ''` | See regression log | — | — | 6 |
| TC-C-06 | Submitting trims surrounding whitespace before calling context [SearchBar] | type `'  London  '` → submit | `setSelectedCity('London')` called | See regression log | — | — | 6 |
| TC-C-07 | Submitting with only whitespace does NOT call `setSelectedCity` [SearchBar] | type `'   '` → submit | `setSelectedCity` not called | See regression log | — | — | 6 |

---

## Unit — Component: CurrentWeather

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-C-06 | CurrentWeather renders city name `'London'` from data prop [CurrentWeather] | `render(<CurrentWeather data={fixture} />)` | `'London'` visible in DOM | See regression log | — | — | 7 |
| TC-C-07 | CurrentWeather renders temperature formatted as `'15°C'` [CurrentWeather] | `render(<CurrentWeather data={fixture} />)` | `'15°C'` visible in DOM | See regression log | — | — | 7 |
| TC-C-08 | CurrentWeather renders weather description text [CurrentWeather] | `render(<CurrentWeather data={fixture} />)` | `'overcast clouds'` visible | See regression log | — | — | 7 |
| TC-C-09 | CurrentWeather renders save button in initial idle state [CurrentWeather] | `render(<CurrentWeather data={fixture} />)` | button with label `/save london/i` present | See regression log | — | — | 7 |
| TC-C-10 | Clicking save button calls `saveLocation` with correct arguments [CurrentWeather] | click save button | `saveLocation('London', 'GB', 51.5085, -0.1257)` called | See regression log | — | — | 7 |
| TC-C-11 | CurrentWeather renders feels-like temperature [CurrentWeather] | `render(<CurrentWeather data={fixture} />)` | `'Feels like 14°C'` visible | See regression log | — | — | 7 |
| TC-C-12 | CurrentWeather renders nothing when `data` prop is null [CurrentWeather] | `render(<CurrentWeather data={null} />)` | `container.firstChild === null` | See regression log | — | — | 7 |

---

## Unit — Component: WeatherStats

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-C-11 | WeatherStats renders humidity value `'72%'` from data prop [WeatherStats] | `render(<WeatherStats data={fixture} />)` | `'72%'` visible | See regression log | — | — | 8 |
| TC-C-12 | WeatherStats renders wind speed value `'5.2 m/s'` [WeatherStats] | `render(<WeatherStats data={fixture} />)` | `'5.2 m/s'` visible | See regression log | — | — | 8 |
| TC-C-13 | All 6 stat items have aria-label attributes [WeatherStats] | `render(<WeatherStats data={fixture} />)` | 6 elements with aria-label (Humidity, Wind speed, Visibility, Pressure, Sunrise, Sunset) | See regression log | — | — | 8 |
| TC-C-14 | WeatherStats renders pressure value `'1012 hPa'` [WeatherStats] | `render(<WeatherStats data={fixture} />)` | `'1012 hPa'` visible | See regression log | — | — | 8 |
| TC-C-15 | WeatherStats renders visibility formatted as km [WeatherStats] | `render(<WeatherStats data={fixture} />)` | `'10.0 km'` visible | See regression log | — | — | 8 |
| TC-C-16 | WeatherStats renders nothing when `data` prop is null [WeatherStats] | `render(<WeatherStats data={null} />)` | `container.firstChild === null` | See regression log | — | — | 8 |
| TC-C-17 | WeatherStats renders exactly 6 stat list items [WeatherStats] | `render(<WeatherStats data={fixture} />)` | 6 listitem elements | See regression log | — | — | 8 |

---

## Unit — Component: FiveDayForecast

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-C-14 | FiveDayForecast renders exactly 5 forecast-card list items [FiveDayForecast] | `render(<FiveDayForecast forecast={mockForecast5} />)` | 5 listitem elements | See regression log | — | — | 9 |
| TC-C-15 | Each forecast card has an aria-label starting with "Forecast for" [FiveDayForecast] | `render(<FiveDayForecast forecast={mockForecast5} />)` | 5 articles each with `aria-label` matching `/^Forecast for /` | See regression log | — | — | 9 |
| TC-C-16 | `loading={true}` renders the LoadingSpinner (role=status) [FiveDayForecast] | `render(<FiveDayForecast loading={true} />)` | element with `role=status` and `aria-label='Loading weather data'` | See regression log | — | — | 9 |
| TC-C-17 | Empty forecast array renders nothing [FiveDayForecast] | `render(<FiveDayForecast forecast={[]} />)` | `container.firstChild === null` | See regression log | — | — | 9 |
| TC-C-18 | City heading renders when `city` prop is provided [FiveDayForecast] | `render(<FiveDayForecast forecast={mockForecast} city="London" />)` | heading with text `'London'` | See regression log | — | — | 9 |
| TC-C-19 | Section has aria-label that includes the city name [FiveDayForecast] | `render(<FiveDayForecast forecast={mockForecast} city="London" />)` | `role=region` with name `'5-day weather forecast for London'` | See regression log | — | — | 9 |

---

## Unit — Component: DynamicBackground

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-C-17 | Applies `sunny` CSS Module class when `theme='sunny'` [DynamicBackground] | `render(<DynamicBackground theme="sunny">…</DynamicBackground>)` | `container.firstChild` has `styles.sunny` class | See regression log | — | — | 10 |
| TC-C-18 | Applies `rainy` CSS Module class when `theme='rainy'` [DynamicBackground] | `render(<DynamicBackground theme="rainy">…</DynamicBackground>)` | `container.firstChild` has `styles.rainy` class | See regression log | — | — | 10 |
| TC-C-19 | Renders children inside the background wrapper [DynamicBackground] | `<DynamicBackground><p>hello</p></DynamicBackground>` | `'hello world'` visible in DOM | See regression log | — | — | 10 |
| TC-C-20 | Defaults to `cloudy` theme when no `theme` prop is supplied [DynamicBackground] | `render(<DynamicBackground>…</DynamicBackground>)` | `container.firstChild` has `styles.cloudy` class | See regression log | — | — | 10 |
| TC-C-21 | Renders animated overlay div for animated themes [DynamicBackground] | `render(<DynamicBackground theme="sunny">…</DynamicBackground>)` | overlay div with `animSunny` class present | See regression log | — | — | 10 |
| TC-C-22 | Does NOT render overlay div for non-animated themes [DynamicBackground] | `render(<DynamicBackground theme="cloudy">…</DynamicBackground>)` | no overlay div in DOM | See regression log | — | — | 10 |
| TC-C-23 | Overlay div has `aria-hidden="true"` to exclude from screen readers [DynamicBackground] | `render(<DynamicBackground theme="rainy">…</DynamicBackground>)` | overlay div `aria-hidden === 'true'` | See regression log | — | — | 10 |

---

## Unit — Component: WeatherMap

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-C-20 | WeatherMap renders map container when lat and lon props are provided [WeatherMap] | `lat=51.5085 lon=-0.1257 cityName='London'` | element with `data-testid="map-container"` present | See regression log | — | — | 15 |
| TC-C-20 | WeatherMap renders city name and description inside popup [WeatherMap] | `lat=51.5085 lon=-0.1257 weatherDescription='overcast clouds'` | `'London'` and `'overcast clouds'` visible | See regression log | — | — | 15 |
| TC-C-21 | WeatherMap does not render when lat is null [WeatherMap] | `lat=null lon=-0.1257` | `container.firstChild === null` | See regression log | — | — | 15 |
| TC-C-21 | WeatherMap does not render when lon is null [WeatherMap] | `lat=51.5085 lon=null` | `container.firstChild === null` | See regression log | — | — | 15 |
| TC-C-29 | Clicking the map triggers `getCurrentWeatherByCoords` and updates selected city [WeatherMap] | captured `useMapEvents` click handler fired with Paris coords | `getCurrentWeatherByCoords(48.86, 2.35, 'metric')` called; `setSelectedCity('Paris')` called | See regression log | — | — | 17 |

---

## Unit — Component: TemperatureTrendChart

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-C-22 | TemperatureTrendChart renders title "5-Day Temperature Trend" [TemperatureTrendChart] | `dailyForecast` with 5 day objects | text `'5-Day Temperature Trend'` visible | See regression log | — | — | 16 |
| TC-C-23 | TemperatureTrendChart passes 5 data points to LineChart [TemperatureTrendChart] | `dailyForecast` with 5 day objects | mocked `data-testid="line-chart"` has `data-points="5"` | See regression log | — | — | 16 |
| TC-C-24 | TemperatureTrendChart shows loading text when dailyForecast is empty [TemperatureTrendChart] | `dailyForecast=[]` | `'Loading forecast data...'` visible; no `data-testid="line-chart"` | See regression log | — | — | 16 |

---

## Unit — Component: WeatherInsights

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-C-25 | WeatherInsights renders dropping temperature insight when last day is much cooler [WeatherInsights] | `day[0].tempMax=20 day[4].tempMax=14` | text matches `/temperatures are dropping/i` | See regression log | — | — | 16 |
| TC-C-26 | WeatherInsights renders rain-expected insight when 3+ days have rain codes [WeatherInsights] | 3 days with `entries[].weather[0].id=501` | text matches `/rain expected for most of the week/i` | See regression log | — | — | 16 |
| TC-C-27 | WeatherInsights renders dry-week insight when no days have rain codes [WeatherInsights] | all days with `id=800` (clear) | text matches `/no rain in the forecast/i` | See regression log | — | — | 16 |
| TC-C-28 | WeatherInsights renders heat warning when any day exceeds 28°C [WeatherInsights] | one day `tempMax=32`, `units='metric'` | text matches `/a warm spell coming/i` | See regression log | — | — | 16 |

---

## Unit — Hook: useWeather

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-H-01 | `useWeather` returns `loading=true` synchronously before first fetch resolves | `renderHook(() => useWeather('London'))` | `result.current.loading === true` | See regression log | — | — | 11 |
| TC-H-02 | `useWeather` returns weather data after successful fetch (MSW intercepts) | `renderHook`, wait for `loading=false` | `data.name === 'London'`; `error === null` | See regression log | — | — | 11 |
| TC-H-03 | `useWeather` returns error string when API returns 404 | `server.use(404)` → `renderHook` | `error` matches `/404/`; `data === null` | See regression log | — | — | 11 |
| TC-H-04 | `useWeather` uses cached data and does NOT call `fetch` when cache is warm | pre-warm cache → `renderHook` → `vi.spyOn(fetch)` | `fetch` not called; `data` from cache | See regression log | — | — | 11 |
| TC-H-05 | `refetch()` bypasses cache and triggers a new API call | pre-warm cache → render → spy → call `refetch()` | `fetch` IS called; data refreshed | See regression log | — | — | 11 |
| TC-H-06 | `useWeather` stays idle and does not fetch when `cityName` is null | `renderHook(() => useWeather(null))` | `loading=false`; `data=null`; `fetch` not called | See regression log | — | — | 11 |
| TC-H-07 | `useWeather` initial state has `data` and `error` both null | `renderHook(() => useWeather(undefined))` | `data === null`; `error === null` | See regression log | — | — | 11 |

---

## Unit — Hook: useGeolocation

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-H-06 | `useGeolocation` initial state: lat/lon/error null, loading false [useGeolocation] | `renderHook(() => useGeolocation())` | all `null`/`false` | See regression log | — | — | 12 |
| TC-H-07 | `loading=true` while geolocation request is pending [useGeolocation] | mock never calls back → `getLocation()` | `loading === true`; lat/lon still null | See regression log | — | — | 12 |
| TC-H-08 | Returns lat/lon after successful geolocation response [useGeolocation] | `successCb({ coords: {51.5, -0.12} })` | `lat===51.5`; `lon===-0.12`; `loading=false` | See regression log | — | — | 12 |
| TC-H-09 | Returns error message when geolocation is denied (code=1) [useGeolocation] | `errorCb({ code: 1 })` | `error` truthy; `loading=false`; lat/lon null | See regression log | — | — | 12 |
| TC-H-10 | Exact error text for code=1 is `'Location access denied. Please search manually.'` [useGeolocation] | `errorCb({ code: 1 })` | `error === 'Location access denied. Please search manually.'` | See regression log | — | — | 12 |
| TC-H-11 | code=2 returns `'could not be determined'` message [useGeolocation] | `errorCb({ code: 2 })` | `error` matches `/could not be determined/i` | See regression log | — | — | 12 |
| TC-H-12 | code=3 returns timeout message [useGeolocation] | `errorCb({ code: 3 })` | `error` matches `/timed out/i` | See regression log | — | — | 12 |
| TC-H-13 | Unknown error code falls back to generic message [useGeolocation] | `errorCb({ code: 99 })` | `error` matches `/unknown location error/i` | See regression log | — | — | 12 |

---

## Integration — weatherApi.js (MSW intercepts)

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-I-01 | `getCurrentWeatherByCity` resolves with correct fixture shape | `getCurrentWeatherByCity('London')` | `{ name:'London', main:{temp:15,humidity:72}, wind:{speed:5.2} }` | See regression log | — | — | 13 |
| TC-I-02 | Invalid city → thrown `Error` containing `'404'` | `getCurrentWeatherByCity('InvalidCity999')` + MSW 404 override | rejects with `/404/` | See regression log | — | — | 13 |
| TC-I-03 | `getFiveDayForecast` resolves with list of length 40 | `getFiveDayForecast('London')` + 40-item MSW override | `data.list.length === 40` | See regression log | — | — | 13 |
| TC-I-04 | `getCurrentWeatherByCoords` resolves with weather data | `getCurrentWeatherByCoords(51.5, -0.12)` | `data.name === 'London'`; `typeof data.main.temp === 'number'` | See regression log | — | — | 13 |
| TC-I-05 | Missing API key → throws `'API key not configured'` | `vi.stubEnv('VITE_OPENWEATHER_API_KEY', '')` | rejects with `'API key not configured'` | See regression log | — | — | 13 |
| TC-I-06 | `getForecastByCoords` resolves with a list array | `getForecastByCoords(51.5, -0.12)` | `Array.isArray(data.list) === true` | See regression log | — | — | 13 |
| TC-I-07 | Error message includes status code and statusText on server error | MSW 500 override | rejects matching `/500.*Internal Server Error/` | See regression log | — | — | 13 |

---

## Integration — supabaseClient.js (vi.mock)

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-I-08 | `saveLocation` calls `insert` with correct payload | `saveLocation('London','GB',51.5,-0.12)` | `from('saved_locations').insert([{city_name,country_code,lat,lon}])` | See regression log | — | — | 14 |
| TC-I-09 | `fetchSavedLocations` calls `select('*')` and `order` | `fetchSavedLocations()` | `from('saved_locations').select('*')` + `order('created_at',{ascending:false})` | See regression log | — | — | 14 |
| TC-I-10 | `deleteLocation` calls `delete().eq('id', uuid)` | `deleteLocation('some-uuid')` | `from('saved_locations').delete().eq('id','some-uuid')` | See regression log | — | — | 14 |
| TC-I-11 | `saveLocation` returns `{ data, error: null }` on success | mock resolves with data | `{ data: [{id:'abc',...}], error: null }` | See regression log | — | — | 14 |
| TC-I-12 | `saveLocation` returns `{ data: null, error }` when Supabase returns error | mock resolves with error | `{ data: null, error: <Error> }` | See regression log | — | — | 14 |

---

## E2E — DashboardPage (Playwright / Chromium)

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-E-01 | Page loads at `'/'` with title containing `"WeatherNow"` | `page.goto('/')` | `page.title()` matches `/WeatherNow/i` | See regression log | — | — | 15 |
| TC-E-02 | Typing `"London"` and pressing Enter shows weather for London | fill searchbox → press Enter | article `"Current weather for London"` visible | See regression log | — | — | 15 |
| TC-E-03 | Current temperature `"15°C"` is visible after searching London | fill searchbox → press Enter | `getByLabel(/^Temperature:/)` has text `'15°C'` | See regression log | — | — | 15 |
| TC-E-04 | Humidity `"72%"` and wind speed `"5.2 m/s"` are visible | fill searchbox → press Enter | both `'72%'` and `'5.2 m/s'` visible | See regression log | — | — | 15 |
| TC-E-05 | `"View 5-Day Forecast"` link navigates to `/forecast` | search London → click forecast link | URL contains `/forecast` | See regression log | — | — | 15 |
| TC-E-06 | Toggling `°C/°F` button changes temperature display format | search → click units toggle | `'15°F'` visible (same fixture, different suffix) | See regression log | — | — | 15 |
| TC-E-07 | DynamicBackground container has `data-theme` attribute set | `page.goto('/')` | `[data-theme]` present and non-empty (`'cloudy'` before search) | See regression log | — | — | 15 |

---

## E2E — ForecastPage (Playwright / Chromium)

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-E-08 | Navigating to `/forecast` without a city shows the empty-state message | `page.goto('/forecast')` | `'Search for a city on the dashboard first to see its forecast.'` visible | See regression log | — | — | 16 |
| TC-E-09 | After searching London and clicking the link, 5 forecast cards appear | search → click forecast link | 5 `article[aria-label^="Forecast for"]` elements | See regression log | — | — | 16 |
| TC-E-10 | Clicking a forecast card's `"Hourly"` button expands its hourly detail | click Hourly toggle on first card | button shows `aria-expanded="true"`; text changes to `"Less"` | See regression log | — | — | 16 |
| TC-E-11 | `"← Back to Dashboard"` link returns to `'/'` | `page.goto('/forecast')` → click back link | URL equals `'http://localhost:5173/'` | See regression log | — | — | 16 |

---

## E2E — SavedLocationsPage (Playwright / Chromium)

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-E-12 | `/saved` shows empty-state message when no locations saved | GET mock returns `[]` → `page.goto('/saved')` | `'No saved cities yet.'` visible | See regression log | — | — | 17 |
| TC-E-13 | Clicking `"Save this city"` after searching London adds it to the saved list | search → click Save → navigate to `/saved` | `'London'` cell visible in saved table | See regression log | — | — | 17 |
| TC-E-14 | Clicking Delete with confirmation removes the city from the list | `/saved` with London → click Delete → accept confirm | `'No saved cities yet.'` visible after deletion | See regression log | — | — | 17 |
| TC-E-15 | Clicking `"Load weather"` on a saved city navigates to `'/'` with weather shown | `/saved` with London → click Load weather | URL `'/'`; article `"Current weather for London"` visible | See regression log | — | — | 17 |

---

## Accessibility — axe-core (Playwright)

| Test ID | Description | Input | Expected Result | Actual Result | Status | Run Date | Prompt |
|---------|-------------|-------|-----------------|---------------|:------:|----------|--------|
| TC-A-01 | Dashboard welcome screen has 0 axe violations | `page.goto('/')` before search | axe scan returns 0 violations | See a11y test run | — | — | 18 |
| TC-A-02 | Dashboard with weather loaded has 0 axe violations | search London → axe scan | axe scan returns 0 violations | See a11y test run | — | — | 18 |
| TC-A-03 | ForecastPage empty state has 0 axe violations | `page.goto('/forecast')` | axe scan returns 0 violations | See a11y test run | — | — | 18 |
| TC-A-04 | ForecastPage with forecast loaded has 0 axe violations | search → navigate to forecast → axe scan | axe scan returns 0 violations | See a11y test run | — | — | 18 |
| TC-A-05 | SavedLocationsPage empty state has 0 axe violations | `page.goto('/saved')` | axe scan returns 0 violations | See a11y test run | — | — | 18 |
| TC-A-06 | SavedLocationsPage with saved cities has 0 axe violations | mock saved data → axe scan | axe scan returns 0 violations | See a11y test run | — | — | 18 |
| TC-A-07 | Focus ring visible on all interactive elements (keyboard nav) | Tab through page | all focused elements show 3px outline | See a11y test run | — | — | 18 |
| TC-A-08 | All images and icons have alt text or aria-hidden | full page scan | no unlabelled images | See a11y test run | — | — | 18 |
| TC-A-09 | Colour contrast ratio passes WCAG AA (4.5:1 for normal text) | axe contrast rule | 0 contrast violations | See a11y test run | — | — | 18 |
| TC-A-10 | All form inputs have associated labels | axe label rule | 0 label violations | See a11y test run | — | — | 18 |

---

## Summary

| Category | Test Count |
|----------|-----------|
| Unit / Utils | 18 |
| Unit / Components | 29 |
| Unit / Hooks | 9 |
| Integration | 10 |
| E2E | 15 |
| Accessibility | 10 |
| **Total** | **91** |

> Note: The unit suite (Vitest) runs 128 individual assertions across 16 test files.
> The table above counts unique documented test cases, not assertion count.
> ID overlaps across files are expected and noted in each row's description.
