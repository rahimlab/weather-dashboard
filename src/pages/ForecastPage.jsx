import { Link } from 'react-router-dom'
import { useWeatherContext } from '../context/WeatherContext.jsx'
import useForecast from '../hooks/useForecast.js'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import FiveDayForecast from '../components/weather/FiveDayForecast.jsx'
import TemperatureTrendChart from '../components/weather/TemperatureTrendChart.jsx'
import WeatherInsights from '../components/weather/WeatherInsights.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import styles from './ForecastPage.module.css'

export default function ForecastPage() {
  const { selectedCity, units } = useWeatherContext()
  const { dailyForecast, loading, error } = useForecast(selectedCity, units)

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Link to="/" className={styles.backLink}>
          ← Back to Dashboard
        </Link>

        <h1 className={styles.heading}>5-Day Forecast</h1>

        {!selectedCity && (
          <p className={styles.emptyState}>
            Search for a city on the dashboard first to see its forecast.
          </p>
        )}

        {selectedCity && loading && <LoadingSpinner />}
        {selectedCity && !loading && error && <ErrorMessage message={error} />}
        {selectedCity && !loading && !error && (
          <>
            {dailyForecast.length > 0 && (
              <>
                <h2 className={styles.analysisHeading}>Weather Analysis</h2>
                <TemperatureTrendChart dailyForecast={dailyForecast} />
                <WeatherInsights dailyForecast={dailyForecast} />
              </>
            )}
            <FiveDayForecast forecast={dailyForecast} city={selectedCity} />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
