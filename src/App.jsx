import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage.jsx'
import ForecastPage from './pages/ForecastPage.jsx'
import SavedLocationsPage from './pages/SavedLocationsPage.jsx'
import styles from './App.module.css'

export default function App() {
  const location = useLocation()

  return (
    // key on pathname remounts this div on navigation, triggering the CSS animation
    <div key={location.pathname} className={styles.pageTransition}>
      <Routes location={location}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/saved" element={<SavedLocationsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
