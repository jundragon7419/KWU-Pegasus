import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../lib/api'
import { EVENT_TYPES, POST_TYPE_LABEL, DAYS } from '../lib/constants'
import { useScheduleData } from '../hooks/useScheduleData'
import styles from './Home.module.css'

const TYPE_STYLE = {
  notice:          styles.tagNotice,
  event:           styles.tagEvent,
  game:            styles.tagGame,
  family_occasion: styles.tagFamily,
  normal:          styles.tagNormal,
}

function MiniCalendar() {
  const navigate = useNavigate()
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const { holidayMap, eventMap } = useScheduleData(year, month)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className={styles.calendarWidget} onClick={() => navigate('/schedule')}>
      <div className={styles.calendarHeader}>
        <span className={styles.calendarTitle}>{year}년 {month + 1}월</span>
      </div>
      <div className={styles.calendarGrid}>
        {DAYS.map((d, i) => (
          <div key={d} className={`${styles.calendarDayLabel} ${i === 0 ? styles.sun : ''}`}>{d}</div>
        ))}
        {cells.map((d, i) => {
          const col = i % 7
          const key = d ? `${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null
          const dayHolidays = key ? (holidayMap.get(key) ?? []) : []
          const isHoliday = dayHolidays.length > 0
          const isToday = d === today.getDate()
          const isRed = col === 0 || isHoliday
          const dayEvents = d ? (eventMap.get(String(d).padStart(2, '0')) ?? []) : []
          return (
            <div
              key={i}
              className={`${styles.calendarCell} ${isToday ? styles.calendarToday : ''} ${isRed && d ? styles.sun : ''}`}
              title={[...dayHolidays, ...dayEvents.map(e => EVENT_TYPES[e.type].label + ' ' + e.name)].join(', ')}
            >
              {d ?? ''}
              {d && (isHoliday || dayEvents.length > 0) && (
                <div className={styles.dotRow}>
                  {isHoliday && <span className={styles.dot} style={{ background: '#f07070' }} />}
                  {dayEvents.map(ev => (
                    <span key={ev.id} className={styles.dot} style={{ background: EVENT_TYPES[ev.type].color }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Home() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/posts`)
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
  }, [])

  const { pinned, recent } = useMemo(() => {
    const p = posts.filter(n => n.isPinned)
    const r = posts.filter(n => !n.isPinned).slice(0, 8 - p.length)
    return { pinned: p, recent: r }
  }, [posts])

  return (
    <section className={styles.home}>
      <div className={styles.heroImageWrapper}>
        <img className={styles.heroImage} src="/main.jpg" alt="메인 이미지" />
      </div>

      <div className={styles.widgets}>
        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <span className={styles.widgetTitle}>게시판</span>
            <Link to="/board" className={styles.widgetMore}>더보기 →</Link>
          </div>
          <div className={styles.noticeList}>
            {pinned.map(n => (
              <Link key={n.id} to={`/board/${n.id}`} className={`${styles.noticeRow} ${styles.noticePinned}`}>
                <span className={styles.pinIcon}>📌</span>
                <span className={`${styles.tag} ${TYPE_STYLE[n.type]}`}>{POST_TYPE_LABEL[n.type]}</span>
                <span className={styles.noticeTitle}>{n.title}</span>
                <span className={styles.noticeDate}>{n.date}</span>
              </Link>
            ))}
            {pinned.length > 0 && <div className={styles.noticeDivider} />}
            {recent.map(n => (
              <Link key={n.id} to={`/board/${n.id}`} className={styles.noticeRow}>
                <span className={`${styles.tag} ${TYPE_STYLE[n.type]}`}>{POST_TYPE_LABEL[n.type]}</span>
                <span className={styles.noticeTitle}>{n.title}</span>
                <span className={styles.noticeDate}>{n.date}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <span className={styles.widgetTitle}>일정</span>
            <Link to="/schedule" className={styles.widgetMore}>더보기 →</Link>
          </div>
          <MiniCalendar />
        </div>
      </div>
    </section>
  )
}
