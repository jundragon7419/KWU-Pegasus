import { useState, useMemo, useRef, useEffect } from 'react'
import { API_BASE } from '../lib/api'
import { EVENT_TYPES, DAYS } from '../lib/constants'
import styles from './Schedule.module.css'

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
const MIN_YEAR = 2000

export default function Schedule() {
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [showPicker, setShowPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(current.year)
  const pickerRef = useRef(null)

  const [holidays, setHolidays] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/holidays?year=${current.year}`)
      .then(r => r.json())
      .then(data => setHolidays(data))
  }, [current.year])

  useEffect(() => {
    fetch(`${API_BASE}/api/events?year=${current.year}`)
      .then(r => r.json())
      .then(data => setEvents(data))
  }, [current.year])

  const holidayMap = useMemo(() => {
    const map = new Map()
    for (const h of holidays) {
      if (h.year !== current.year && !h.isFixed) continue
      const key = `${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(h.name)
    }
    return map
  }, [holidays, current.year])

  const eventMap = useMemo(() => {
    const map = new Map()
    for (const e of events) {
      if (e.month !== current.month + 1) continue
      const day = String(e.day).padStart(2, '0')
      if (!map.has(day)) map.set(day, [])
      map.get(day).push(e)
    }
    return map
  }, [events, current.month])

  function prevMonth() {
    setCurrent(({ year, month }) => {
      if (year === MIN_YEAR && month === 0) return { year, month }
      return month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    })
  }

  function nextMonth() {
    setCurrent(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )
  }

  function goToday() {
    setCurrent({ year: today.getFullYear(), month: today.getMonth() })
  }

  function openPicker() {
    setPickerYear(current.year)
    setShowPicker(true)
  }

  function selectMonth(m) {
    setCurrent({ year: pickerYear, month: m })
    setShowPicker(false)
  }

  useEffect(() => {
    if (!showPicker) return
    function handleClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPicker])

  const { year, month } = current
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  )
  while (days.length % 7 !== 0) days.push(null)
  const cells = days

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth()

  const isAtMin = year === MIN_YEAR && month === 0

  function getHolidays(day) {
    const key = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return holidayMap.get(key) || []
  }

  return (
    <div className={styles.page}>
      <div className={styles.calendarWrapper}>
        <div className={styles.header}>
          <button
            className={`${styles.navButton} ${isAtMin ? styles.navDisabled : ''}`}
            onClick={prevMonth}
            disabled={isAtMin}
          >
            &#8249;
          </button>

          <div className={styles.titleWrapper} ref={pickerRef}>
            <button className={styles.monthTitle} onClick={openPicker}>
              {year}년 {month + 1}월
              <span className={styles.titleCaret}>▾</span>
            </button>

            {showPicker && (
              <div className={styles.picker}>
                <div className={styles.pickerYearRow}>
                  <button
                    className={`${styles.pickerNavBtn} ${pickerYear <= MIN_YEAR ? styles.navDisabled : ''}`}
                    onClick={() => setPickerYear(y => Math.max(MIN_YEAR, y - 1))}
                    disabled={pickerYear <= MIN_YEAR}
                  >
                    &#8249;
                  </button>
                  <span className={styles.pickerYear}>{pickerYear}년</span>
                  <button
                    className={styles.pickerNavBtn}
                    onClick={() => setPickerYear(y => y + 1)}
                  >
                    &#8250;
                  </button>
                </div>
                <div className={styles.pickerMonthGrid}>
                  {MONTHS.map((label, m) => (
                    <button
                      key={m}
                      className={`${styles.pickerMonthBtn}
                        ${pickerYear === year && m === month ? styles.pickerActive : ''}
                        ${pickerYear === today.getFullYear() && m === today.getMonth() ? styles.pickerToday : ''}`}
                      onClick={() => selectMonth(m)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.headerRight}>
            {!isCurrentMonth && (
              <button className={styles.todayButton} onClick={goToday}>오늘</button>
            )}
            <button className={styles.navButton} onClick={nextMonth}>&#8250;</button>
          </div>
        </div>

        <div className={styles.grid}>
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={`${styles.dayName} ${i === 0 ? styles.sun : ''} ${i === 6 ? styles.sat : ''}`}
            >
              {d}
            </div>
          ))}

          {cells.map((day, idx) => {
            const col = idx % 7
            const dayHolidays = day ? getHolidays(day) : []
            const isHoliday = dayHolidays.length > 0
            const dayEvents = day ? (eventMap.get(String(day).padStart(2, '0')) ?? []) : []
            return (
              <div
                key={idx}
                className={`${styles.cell}
                  ${!day ? styles.empty : ''}
                  ${col === 0 ? styles.sun : ''}
                  ${col === 6 ? styles.sat : ''}
                  ${isHoliday ? styles.holiday : ''}
                  ${isToday(day) ? styles.today : ''}`}
              >
                {day && (
                  <>
                    <span className={styles.dayNumber}>{day}</span>
                    {dayHolidays.map((name, i) => (
                      <span key={i} className={styles.holidayName}>{name}</span>
                    ))}
                    {dayEvents.map(ev => (
                      <span
                        key={ev.name + ev.day}
                        className={styles.eventChip}
                        style={{ background: EVENT_TYPES[ev.type].color + '2a', color: EVENT_TYPES[ev.type].color, borderColor: EVENT_TYPES[ev.type].color + '60' }}
                      >
                        {ev.name}
                      </span>
                    ))}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
