import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NOTICES } from '../data/notices'
import { getHolidayMap } from '../data/holidays'
import { getEventMap, EVENT_TYPES } from '../data/events'
import styles from './Home.module.css'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function MiniCalendar() {
  const navigate = useNavigate()
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const holidayMap = useMemo(() => getHolidayMap(year), [year])
  const eventMap = useMemo(() => getEventMap(year, month), [year, month])

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
          const holidays = key ? (holidayMap.get(key) ?? []) : []
          const isHoliday = holidays.length > 0
          const isToday = d === today.getDate()
          const isRed = col === 0 || isHoliday
          const events = d ? (eventMap.get(String(d).padStart(2, '0')) ?? []) : []
          return (
            <div
              key={i}
              className={`${styles.calendarCell} ${isToday ? styles.calendarToday : ''} ${isRed && d ? styles.sun : ''}`}
              title={[...holidays, ...events.map(e => EVENT_TYPES[e.type].label + ' ' + e.title)].join(', ')}
            >
              {d ?? ''}
              {d && (isHoliday || events.length > 0) && (
                <div className={styles.dotRow}>
                  {isHoliday && <span className={styles.dot} style={{ background: '#f07070' }} />}
                  {events.map(ev => (
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

const CATEGORY_LABEL = { notice: '공지', event: '행사', game: '경기' }
const CATEGORY_STYLE = { notice: styles.tagNotice, event: styles.tagEvent, game: styles.tagGame }

export default function Home() {
  const pinned = NOTICES.filter(n => n.isPinned)
  const recent = NOTICES.filter(n => !n.isPinned).slice(0, 8 - pinned.length)

  return (
    <section className={styles.home}>
      <div className={styles.heroImageWrapper}>
        <img className={styles.heroImage} src="/main.jpg" alt="메인 이미지" />
      </div>

      <div className={styles.widgets}>
        {/* 공지사항 */}
        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <span className={styles.widgetTitle}>공지사항</span>
            <Link to="/notice" className={styles.widgetMore}>더보기 →</Link>
          </div>
          <div className={styles.noticeList}>
            {pinned.map(n => (
              <Link key={n.id} to={`/notice/${n.id}`} className={`${styles.noticeRow} ${styles.noticePinned}`}>
                <span className={styles.pinIcon}>📌</span>
                <span className={`${styles.tag} ${CATEGORY_STYLE[n.category]}`}>{CATEGORY_LABEL[n.category]}</span>
                <span className={styles.noticeTitle}>{n.title}</span>
                <span className={styles.noticeDate}>{n.date}</span>
              </Link>
            ))}
            {pinned.length > 0 && <div className={styles.noticeDivider} />}
            {recent.map(n => (
              <Link key={n.id} to={`/notice/${n.id}`} className={styles.noticeRow}>
                <span className={`${styles.tag} ${CATEGORY_STYLE[n.category]}`}>{CATEGORY_LABEL[n.category]}</span>
                <span className={styles.noticeTitle}>{n.title}</span>
                <span className={styles.noticeDate}>{n.date}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 달력 */}
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
