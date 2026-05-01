// TEST EVIDENCE TABLE
// ID     | Description                                         | Input / Action                    | Expected Output                        | Notes
// --------|-----------------------------------------------------|-----------------------------------|----------------------------------------|----------------------------------------------------
// TC-C-17 | Applies sunny theme CSS class when theme='sunny'    | theme='sunny'                     | wrapper has styles.sunny class         | CSS Modules — import styles to get scoped name
// TC-C-18 | Applies rainy theme CSS class when theme='rainy'    | theme='rainy'                     | wrapper has styles.rainy class         | Same pattern as TC-C-17
// TC-C-19 | Renders children inside the background wrapper      | <p>hello</p> as child             | 'hello' visible in DOM                 | Children rendered inside .content div
// TC-C-20 | Defaults to cloudy theme when no theme prop given   | no theme prop                     | wrapper has styles.cloudy class        | Default param: theme='cloudy'
// TC-C-21 | Renders animated overlay for animated themes        | theme='sunny'                     | overlay div present in document        | animSunny overlay rendered for sunny theme
// TC-C-22 | Does NOT render overlay div for non-animated themes | theme='cloudy'                    | no div with overlay class              | ANIM map only covers 5 themes; cloudy not in it
// TC-C-23 | Has aria-hidden on the overlay div                  | theme='rainy'                     | overlay div has aria-hidden='true'     | Decorative animation — hidden from screen readers

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DynamicBackground from '../../../src/components/weather/DynamicBackground.jsx'
import styles from '../../../src/components/weather/DynamicBackground.module.css'

// CSS Modules in Vitest: `styles.<name>` returns the same scoped class name that the
// component sees at render time, so we can use it directly in toHaveClass assertions.

describe('DynamicBackground', () => {
  it('TC-C-17: applies sunny theme CSS class when theme="sunny"', () => {
    const { container } = render(
      <DynamicBackground theme="sunny"><p>content</p></DynamicBackground>,
    )
    expect(container.firstChild).toHaveClass(styles.sunny)
  })

  it('TC-C-18: applies rainy theme CSS class when theme="rainy"', () => {
    const { container } = render(
      <DynamicBackground theme="rainy"><p>content</p></DynamicBackground>,
    )
    expect(container.firstChild).toHaveClass(styles.rainy)
  })

  it('TC-C-19: renders children inside the background div', () => {
    render(
      <DynamicBackground theme="cloudy">
        <p>hello world</p>
      </DynamicBackground>,
    )
    expect(screen.getByText('hello world')).toBeTruthy()
  })

  it('TC-C-20: defaults to cloudy theme when no theme prop is supplied', () => {
    const { container } = render(
      <DynamicBackground><p>content</p></DynamicBackground>,
    )
    expect(container.firstChild).toHaveClass(styles.cloudy)
  })

  it('TC-C-21: renders the animated overlay div for the sunny theme', () => {
    const { container } = render(
      <DynamicBackground theme="sunny"><p>content</p></DynamicBackground>,
    )
    // the overlay div sits between the bg wrapper and the content wrapper
    const overlay = container.firstChild.querySelector(`.${styles.overlay}`)
    expect(overlay).toBeTruthy()
  })

  it('TC-C-22: does not render an overlay div for the cloudy (non-animated) theme', () => {
    const { container } = render(
      <DynamicBackground theme="cloudy"><p>content</p></DynamicBackground>,
    )
    const overlay = container.firstChild.querySelector(`.${styles.overlay}`)
    expect(overlay).toBeNull()
  })

  it('TC-C-23: overlay div is aria-hidden to keep decorative animation out of screen readers', () => {
    const { container } = render(
      <DynamicBackground theme="rainy"><p>content</p></DynamicBackground>,
    )
    const overlay = container.firstChild.querySelector(`.${styles.overlay}`)
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
  })
})
