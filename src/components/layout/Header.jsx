import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import ToggleUnits from '../ui/ToggleUnits.jsx'
import styles from './Header.module.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand} onClick={closeMenu}>
        WeatherNow
      </Link>

      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        aria-controls="main-nav"
      >
        <span className={menuOpen ? styles.barTop : styles.bar} />
        <span className={menuOpen ? styles.barMid : styles.bar} />
        <span className={menuOpen ? styles.barBot : styles.bar} />
      </button>

      <nav
        id="main-nav"
        className={menuOpen ? `${styles.nav} ${styles.navOpen}` : styles.nav}
        aria-label="Main navigation"
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
          aria-current={pathname === '/' ? 'page' : undefined}
          onClick={closeMenu}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/forecast"
          className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
          aria-current={pathname === '/forecast' ? 'page' : undefined}
          onClick={closeMenu}
        >
          5-Day Forecast
        </NavLink>
        <NavLink
          to="/saved"
          className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
          aria-current={pathname === '/saved' ? 'page' : undefined}
          onClick={closeMenu}
        >
          Saved Locations
        </NavLink>
        <ToggleUnits />
      </nav>
    </header>
  )
}
