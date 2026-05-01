// TEST EVIDENCE TABLE
// ID     | Description                                         | Input / Action                    | Expected Output                   | Notes
// --------|-----------------------------------------------------|-----------------------------------|-----------------------------------|--------------------------------------------
// TC-C-01 | Input has aria-label "Search for a city"            | render                            | element with matching label       | Queried by role 'combobox' (explicit role set for ARIA autocomplete pattern)
// TC-C-02 | Typing updates the input value                      | type 'London' into input          | input.value === 'London'          | Controlled component — state drives value
// TC-C-03 | Submit calls setSelectedCity with typed value        | type 'London' → submit form       | setSelectedCity('London') called  | Context's setSelectedCity is a vi.fn()
// TC-C-04 | Clear button appears only when input has a value    | type one char, then check         | clear button visible after typing | Button absent initially
// TC-C-05 | Clear button resets input to empty                  | type 'London' → click clear       | input.value === ''                | handleClear clears debounce + state
// TC-C-06 | Submitting trims whitespace                         | type '  London  ' → submit        | setSelectedCity('London') called  | Component trims before calling context
// TC-C-07 | Submit with empty/whitespace does not call context  | type '   ' → submit               | setSelectedCity not called        | Guard: if (!trimmed) return

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWeatherContext } from '../../../src/context/WeatherContext.jsx'
import SearchBar from '../../../src/components/search/SearchBar.jsx'

vi.mock('../../../src/context/WeatherContext.jsx', () => ({
  useWeatherContext: vi.fn(),
}))

// getCitySuggestions is called via a 400ms debounce; tests submit before that
// fires, so we just need the import to resolve cleanly
vi.mock('../../../src/api/weatherApi.js', () => ({
  getCitySuggestions: vi.fn().mockResolvedValue([]),
}))

describe('SearchBar', () => {
  let mockSetSelectedCity

  beforeEach(() => {
    mockSetSelectedCity = vi.fn()
    vi.mocked(useWeatherContext).mockReturnValue({ setSelectedCity: mockSetSelectedCity })
  })

  it('TC-C-01: renders input with aria-label "Search for a city"', () => {
    render(<SearchBar />)
    // explicit role="combobox" enables aria-expanded and aria-controls for ARIA 1.2 autocomplete pattern
    expect(screen.getByRole('combobox', { name: 'Search for a city' })).toBeTruthy()
  })

  it('TC-C-02: typing into input updates its value', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    const input = screen.getByRole('combobox', { name: 'Search for a city' })
    await user.type(input, 'London')
    expect(input.value).toBe('London')
  })

  it('TC-C-03: submitting form calls setSelectedCity with the typed value', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    const input = screen.getByRole('combobox', { name: 'Search for a city' })
    await user.type(input, 'London')
    await user.click(screen.getByRole('button', { name: 'Submit search' }))
    expect(mockSetSelectedCity).toHaveBeenCalledWith('London')
  })

  it('TC-C-04: clear button appears when input has a value', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    const input = screen.getByRole('combobox', { name: 'Search for a city' })
    // absent before any input
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
    await user.type(input, 'L')
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeTruthy()
  })

  it('TC-C-05: clear button resets input to empty', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    const input = screen.getByRole('combobox', { name: 'Search for a city' })
    await user.type(input, 'London')
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(input.value).toBe('')
  })

  it('TC-C-06: submit trims surrounding whitespace before calling context', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    const input = screen.getByRole('combobox', { name: 'Search for a city' })
    await user.type(input, '  London  ')
    await user.click(screen.getByRole('button', { name: 'Submit search' }))
    expect(mockSetSelectedCity).toHaveBeenCalledWith('London')
  })

  it('TC-C-07: submit with only whitespace does not call setSelectedCity', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    const input = screen.getByRole('combobox', { name: 'Search for a city' })
    await user.type(input, '   ')
    await user.click(screen.getByRole('button', { name: 'Submit search' }))
    expect(mockSetSelectedCity).not.toHaveBeenCalled()
  })
})
