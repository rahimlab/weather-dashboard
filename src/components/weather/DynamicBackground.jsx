import styles from './DynamicBackground.module.css'

// maps theme keys to the overlay animation class (only animated themes need one)
const ANIM = {
  sunny: styles.animSunny,
  rainy: styles.animRainy,
  stormy: styles.animStormy,
  snowy: styles.animSnowy,
  'night-clear': styles.animNightClear,
}

export default function DynamicBackground({ theme = 'cloudy', children }) {
  const themeClass = styles[theme] ?? styles.cloudy
  const animClass = ANIM[theme]

  return (
    <div className={`${styles.bg} ${themeClass}`} data-theme={theme}>
      {animClass && (
        <div className={`${styles.overlay} ${animClass}`} aria-hidden="true" />
      )}
      <div className={styles.content}>{children}</div>
    </div>
  )
}
