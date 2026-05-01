import { http, HttpResponse } from 'msw'
import { currentWeatherFixture, forecastFixture } from '../fixtures/weatherFixtures.js'

export const handlers = [
  http.get('https://api.openweathermap.org/data/2.5/weather', () => {
    return HttpResponse.json(currentWeatherFixture)
  }),

  http.get('https://api.openweathermap.org/data/2.5/forecast', () => {
    return HttpResponse.json(forecastFixture)
  }),
]
