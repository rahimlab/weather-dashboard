import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        &copy; {year} WeatherNow &mdash; Powered by{' '}
        <a
          href="https://openweathermap.org"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          OpenWeatherMap
        </a>
      </p>
    </footer>
  )
}
