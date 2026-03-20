import { useState, useEffect } from 'react'
import { API_BASE } from '../lib/api'
import styles from './Roster.module.css'

const FILTERS = [
  { key: 'all',     label: '전체' },
  { key: 'player',  label: '선수' },
  { key: 'staff',   label: '감독 / 회장' },
  { key: 'retired', label: '영구결번' },
]

export default function Roster() {
  const [roster, setRoster] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/roster`)
      .then(r => r.json())
      .then(data => setRoster(data))
  }, [])

  const filtered = roster.filter(p => {
    const matchRole = filter === 'all' || p.role === filter
    const matchSearch = search === '' ||
      p.name.includes(search) ||
      String(p.number).includes(search)
    return matchRole && matchSearch
  })

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.season}>2026 KWU PEGASUS</p>
        <h1 className={styles.title}>선수단 명단</h1>

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
              className={`${styles.card} ${styles[`card_${p.role}`]}`}
            >
              <span className={styles.number}>{p.number}</span>
              <span className={styles.name}>{p.name}</span>
              {p.role === 'retired' && (
                <span className={styles.retiredBadge}>영구결번</span>
              )}
              {p.role === 'staff' && (
                <span className={styles.staffBadge}>{p.title}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
