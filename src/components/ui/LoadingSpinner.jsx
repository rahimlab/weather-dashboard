import styles from './LoadingSpinner.module.css'

export default function LoadingSpinner() {
  return (
    <div
      className={styles.wrapper}
      role="status"
      aria-live="polite"
      aria-label="Loading weather data"
    >
      <div className={styles.spinner} />
      <span className={styles.srOnly}>Loading weather data…</span>
    </div>
  )
}
