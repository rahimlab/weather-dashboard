# WeatherNow

A real-time weather dashboard built with React, Vite, Supabase and
OpenWeatherMap. LSBU CSI_5_SFE Coursework — Project B.

## Features

- Real-time weather data via OpenWeatherMap API
- Browser geolocation to auto-detect the current city on page load
- Dynamic backgrounds that change per weather condition and time of day
- 5-day forecast with expandable hourly detail per day
- Temperature trend chart across the 5-day forecast (Recharts)
- Weather pattern insights: temperature trend, rain detection, heat warning
- Interactive Leaflet map showing city location, clickable to search new cities
- Humidity, wind speed, pressure, visibility, sunrise and sunset display
- Save favourite cities to Supabase (persistent across sessions)
- Celsius and Fahrenheit toggle
- Fully responsive, mobile-first layout
- WCAG 2.1 AA accessible (axe-core verified)

## Tech Stack

React 18, Vite, Supabase, Vercel, OpenWeatherMap API, Leaflet, Recharts

## Running From Scratch on Any Machine

### Prerequisites

Install these first if you do not have them:
- Node.js 20 or higher: https://nodejs.org
- Git: https://git-scm.com (optional if downloading as zip)
- A code editor: https://code.visualstudio.com (recommended)

### Step 1 - Get the project

Either clone the repo or download and unzip the project folder.
Open a terminal inside the weather-dashboard folder.

### Step 2 - Install dependencies

```
npm install
```

### Step 3 - Set up environment variables

Copy .env.example to a new file called .env
Fill in the three values:

```
VITE_OPENWEATHER_API_KEY= your key from openweathermap.org
VITE_SUPABASE_URL= your project URL from supabase.com
VITE_SUPABASE_ANON_KEY= your anon key from supabase.com settings -> API
```

### Step 4 - Set up Supabase tables

Go to your Supabase project -> SQL Editor -> New query
Copy the contents of docs/supabase-schema.sql and run it.
This creates the saved_locations and weather_cache tables.

### Step 5 - Run the app

```
npm run dev
```

Open http://localhost:5173 in your browser.

## Test Commands

| Command                   | What it does                                   |
|---------------------------|------------------------------------------------|
| `npm test`                | Run all unit and integration tests             |
| `npm run test:e2e`        | Run Playwright end-to-end tests                |
| `npm run test:a11y`       | Run axe-core accessibility tests               |
| `npm run test:regression` | Generate exportable regression log to docs/    |
| `npm run test:coverage`   | Show test coverage report                      |

Note: `npm run test:e2e` and `npm run test:a11y` require `npm run dev`
running in a separate terminal first.

## Project Structure

```
src/api/          API clients for OpenWeatherMap and Supabase
src/components/   All reusable UI components (weather, map, layout, ui)
src/pages/        The three main views: Dashboard, Forecast, Saved Locations
src/hooks/        Custom React hooks for data fetching and browser APIs
src/context/      Global WeatherContext provider shared across all pages
src/utils/        Formatting helpers, sessionStorage cache, weather code mapping
tests/            Unit, integration, E2E, accessibility and regression tests
docs/             Test evidence tables and Supabase schema SQL
```

## Deploying to Vercel

- Go to vercel.com and log in
- Click Add New Project
- Upload or import the project folder
- Add the three environment variables in Project Settings -> Environment Variables
- Click Deploy

## Live Demo

https://weather-dashboard-peach-nu.vercel.app/
