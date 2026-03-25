import { useState, useEffect, useMemo } from 'react'
import { API_BASE } from '../lib/api'
import styles from './Roster.module.css'

const FILTERS = [
  { key: 'all',     label: '전체' },
  { key: 'player',  label: '선수' },
  { key: 'staff',   label: '감독 / 회장' },  // coach + president 통합 필터
  { key: 'retired', label: '영구결번' },
]

const ROSTER_ROLE_LABEL = {
  player: '선수', headcoach: '감독', president: '회장', retired: '영구결번',
}

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
      (filter === 'staff' ? (p.role === 'headcoach' || p.role === 'president') : p.role === filter)
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
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>검색 결과가 없습니다.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(p => (
            <div
              key={p.number}
              className={`${styles.card} ${styles[p.role === 'headcoach' || p.role === 'president' ? 'card_staff' : `card_${p.role}`]}`}
            >
              <span className={styles.number}>{p.number}</span>
              <span className={styles.name}>{p.name}</span>
              {(p.role === 'headcoach' || p.role === 'president' || p.role === 'retired') && (
                <span className={styles.staffBadge}>{ROSTER_ROLE_LABEL[p.role]}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
