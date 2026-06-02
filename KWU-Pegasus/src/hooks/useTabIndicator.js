import { useRef, useEffect, useCallback } from 'react'

export function useTabIndicator(activeKey) {
  const containerRef = useRef(null)
  const indicatorRef = useRef(null)

  const update = useCallback((instant = false) => {
    const container = containerRef.current
    const indicator = indicatorRef.current
    if (!container || !indicator) return

    const activeBtn = container.querySelector('[data-active="true"]')
    if (!activeBtn) {
      indicator.style.opacity = '0'
      return
    }

    const cRect = container.getBoundingClientRect()
    const bRect = activeBtn.getBoundingClientRect()

    indicator.style.transition = instant
      ? 'none'
      : 'left 0.25s ease, width 0.25s ease, opacity 0.15s ease'
    indicator.style.left    = `${bRect.left - cRect.left}px`
    indicator.style.width   = `${bRect.width}px`
    indicator.style.opacity = '1'
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => update(false))
    return () => cancelAnimationFrame(raf)
  }, [activeKey, update])

  useEffect(() => {
    document.fonts.ready.then(() => update(true))
  }, [update])

  return { containerRef, indicatorRef, update }
}
