import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EVENT_TYPES, DAYS, isManagerRole } from '../lib/constants'
import { useAuth } from '../context/AuthContext'
import { useScheduleData } from '../hooks/useScheduleData'
import styles from './Schedule.module.css'

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
const MIN_YEAR = 2000

export default function Schedule() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = isManagerRole(user)

  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [showPicker, setShowPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(current.year)
  const pickerRef = useRef(null)

  const [tooltip, setTooltip] = useState(null)

  function showTooltip(e, text) {
    setTooltip({ text, x: e.clientX, y: e.clientY })
  }
  function hideTooltip() {
    setTooltip(null)
  }

  const { holidayMap, eventMap } = useScheduleData(current.year, current.month)

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
    <div className={styles.page} onMouseLeave={hideTooltip}>
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
              <button className={`btn btn-secondary btn-sm ${styles.todayButton}`} onClick={goToday}>오늘</button>
            )}
            <button className={styles.navButton} onClick={nextMonth}>&#8250;</button>
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItems}>
            {[
              { type: 'training', label: '훈련' },
              { type: 'meeting',  label: '미팅' },
              { type: 'events',   label: '이벤트' },
              { type: 'etc',      label: '기타' },
            ].map(({ type, label }) => (
              <span key={type} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: EVENT_TYPES[type].color }} />
                {label}
              </span>
            ))}
          </div>
          {canManage && (
            <div className={styles.legendActions}>
              <button className={`btn btn-secondary btn-sm ${styles.adminBtn}`} onClick={() => navigate('/schedule/write')}>일정 추가</button>
              <button className={`btn btn-ghost btn-sm ${styles.adminBtn}`} onClick={() => navigate('/schedule/write?tab=edit')}>일정 수정</button>
            </div>
          )}
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

          {days.map((day, idx) => {
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
                      <span
                        key={i}
                        className={styles.holidayName}
                        onMouseEnter={e => showTooltip(e, name)}
                        onMouseLeave={hideTooltip}
                      >{name}</span>
                    ))}
                    {dayEvents.map(ev => (
                      <span
                        key={ev.id}
                        className={styles.eventChip}
                        style={{ background: EVENT_TYPES[ev.type].bg, color: EVENT_TYPES[ev.type].color, borderColor: EVENT_TYPES[ev.type].border }}
                        onMouseEnter={e => showTooltip(e, ev.name)}
                        onMouseLeave={hideTooltip}
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

      {tooltip && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
