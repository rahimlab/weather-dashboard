import { useEffect, useRef, useState } from 'react'
import { useWeatherContext } from '../../context/WeatherContext.jsx'
import { getCitySuggestions } from '../../api/weatherApi.js'
import styles from './SearchBar.module.css'

const LISTBOX_ID = 'city-suggestions-listbox'

export default function SearchBar() {
  const { setSelectedCity } = useWeatherContext()
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (formRef.current && !formRef.current.contains(e.target)) {
        close()
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  function close() {
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleChange(e) {
    const val = e.target.value
    setInputValue(val)
    clearTimeout(debounceRef.current)

    if (!val.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await getCitySuggestions(val.trim())
        setSuggestions(results)
        setOpen(results.length > 0)
        setActiveIndex(-1)
      } catch {
        setSuggestions([])
        setOpen(false)
      }
    }, 400)
  }

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      close()
    }
  }

  function selectSuggestion(s) {
    setSelectedCity(s.name)
    setInputValue('')
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleSubmit(e) {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      selectSuggestion(suggestions[activeIndex])
      return
    }
    const trimmed = inputValue.trim()
    if (trimmed) {
      setSelectedCity(trimmed)
      setInputValue('')
      setSuggestions([])
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  function handleClear() {
    clearTimeout(debounceRef.current)
    setInputValue('')
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
  }

  const activeDescendant =
    open && activeIndex >= 0 ? `city-option-${activeIndex}` : undefined

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search for a city"
    >
      <div className={styles.inputWrap}>
        <input
          className={styles.input}
          type="search"
          placeholder="Search city…"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Search for a city"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={open ? LISTBOX_ID : undefined}
          aria-activedescendant={activeDescendant}
          autoComplete="off"
          spellCheck={false}
        />

        {inputValue && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}

        {open && (
          <ul
            id={LISTBOX_ID}
            role="listbox"
            aria-label="City suggestions"
            className={styles.dropdown}
          >
            {suggestions.map((s, i) => (
              <li
                key={`${s.lat}-${s.lon}`}
                id={`city-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`${styles.option} ${i === activeIndex ? styles.optionActive : ''}`}
                onMouseDown={() => selectSuggestion(s)}
              >
                <span className={styles.optionCity}>{s.name}</span>
                {s.state && (
                  <span className={styles.optionState}>{s.state}</span>
                )}
                <span className={styles.optionCountry}>{s.country}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className={styles.searchBtn} type="submit" aria-label="Submit search">
        Search
      </button>
    </form>
  )
}
