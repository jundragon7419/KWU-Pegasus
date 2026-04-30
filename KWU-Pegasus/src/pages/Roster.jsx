import { useState, useEffect, useMemo } from 'react'
import { API_BASE } from '../lib/api'
import { ROSTER_ROLE_LABEL } from '../lib/constants'
import styles from './Roster.module.css'

const FILTERS = [
  { key: 'all',     label: '전체' },
  { key: 'player',  label: '선수' },
  { key: 'staff',   label: '감독 / 회장' },  // coach + president 통합 필터
  { key: 'manager', label: '매니저' },
  { key: 'retired', label: '영구결번' },
]

export default function Roster() {
  const [roster, setRoster] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [activeYear, setActiveYear] = useState(null)
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/roster/active-year`).then(r => r.json()),
      fetch(`${API_BASE}/api/roster/years`).then(r => r.json()),
    ]).then(([activeData, yearsData]) => {
      setActiveYear(activeData.year)
      setYears(yearsData)
      setSelectedYear(activeData.year)
    })
  }, [])

  useEffect(() => {
    if (!selectedYear) return
    fetch(`${API_BASE}/api/roster?year=${selectedYear}`)
      .then(r => r.json())
      .then(data => setRoster(Array.isArray(data) ? data : []))
  }, [selectedYear])

  const filtered = useMemo(() => roster.filter(p => {
    const matchRole =
      filter === 'all' ||
      (filter === 'staff'   ? (p.role === 'roster_headcoach' || p.role === 'roster_president') :
       filter === 'player'  ? p.role === 'roster_player' :
       filter === 'manager' ? p.role === 'roster_manager' :
       filter === 'retired' ? p.role === 'roster_retired' : false)
    const matchSearch = search === '' ||
      p.name.includes(search) ||
      String(p.number).includes(search)
    return matchRole && matchSearch
  }), [roster, filter, search])

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.season}>{selectedYear} KWU PEGASUS</p>
        <h1 className={styles.title}>선수단 명단</h1>

        {years.length > 1 && (
          <div className={styles.yearRow}>
            {years.map(y => (
              <button
                key={y}
                className={`${styles.yearBtn} ${selectedYear === y ? styles.yearActive : ''}`}
                onClick={() => setSelectedYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        <div className={styles.controls}>
          <div className={styles.filterRow}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="이름 또는 번호 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotStaff}`} />
            감독 / 회장
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotRetired}`} />
            영구결번
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotManager}`} />
            매니저
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>검색 결과가 없습니다.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(p => {
            const badgeLabel =
              p.role === 'roster_headcoach' ? 'HC' :
              p.role === 'roster_president' ? 'PD' :
              (p.role === 'roster_manager' && p.number !== 'M') ? 'M' :
              p.role === 'roster_retired' ? ROSTER_ROLE_LABEL['roster_retired'] : null

            return (
              <div
                key={p.student_id}
                className={[
                  styles.card,
                  (p.role === 'roster_headcoach' || p.role === 'roster_president') ? styles.card_staff :
                  p.role === 'roster_manager' ? styles.card_roster_manager :
                  p.role === 'roster_retired' ? styles.card_roster_retired :
                  '',
                ].join(' ')}
              >
                <span className={styles.number}>{p.number}</span>
                <span className={styles.name}>{p.name}</span>
                {badgeLabel && (
                  <span className={
                    p.role === 'roster_retired' ? styles.retiredBadge :
                    p.role === 'roster_manager' ? styles.managerBadge :
                    styles.staffBadge
                  }>
                    {badgeLabel}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
