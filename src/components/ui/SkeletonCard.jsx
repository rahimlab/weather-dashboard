import styles from './SkeletonCard.module.css'

export default function SkeletonCard() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      {/* mimics CurrentWeather card */}
      <div className={styles.card}>
        <div className={`${styles.block} ${styles.city}`} />
        <div className={`${styles.block} ${styles.temp}`} />
        <div className={`${styles.block} ${styles.desc}`} />
        <div className={`${styles.block} ${styles.feels}`} />
      </div>
      {/* mimics WeatherStats grid */}
      <div className={styles.statsGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.statBlock} />
        ))}
      </div>
    </div>
  )
}
