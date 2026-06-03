import { useState, useEffect } from 'react'
import { API_BASE } from '../lib/api'
import { useTabIndicator } from '../hooks/useTabIndicator'
import styles from './Records.module.css'

const BATTING_COLS = [
  { key: 'user.name',    label: '이름' },
  { key: '_owar',        label: 'oWAR' },
  { key: '_wrcPlus',     label: 'wRC+' },
  { key: '_woba',        label: 'wOBA' },
  { key: 'hgame',        label: 'G' },
  { key: 'htb',          label: 'PA' },
  { key: 'her',          label: 'R' },
  { key: 'h',            label: 'H' },
  { key: 'h2',           label: '2B' },
  { key: 'h3',           label: '3B' },
  { key: 'hr',           label: 'HR' },
  { key: 'sb',           label: 'SB' },
  { key: 'sbo',          label: 'CS' },
  { key: 'hbb',          label: 'BB' },
  { key: 'hhitByPitch',  label: 'HP' },
  { key: 'hibb',         label: 'IB' },
  { key: 'hso',          label: 'SO' },
  { key: 'do',           label: 'GDP' },
  { key: 'havg',         label: '타율' },
  { key: 'obrate',       label: '출루율' },
  { key: 'srate',        label: '장타율' },
  { key: 'ops',          label: 'OPS' },
]

const PITCHING_COLS = [
  { key: 'user.name',     label: '이름' },
  { key: 'pgame',         label: 'G' },
  { key: 'win',           label: 'W' },
  { key: 'lose',          label: 'L' },
  { key: 'save',          label: 'SV' },
  { key: 'hold',          label: 'HLD' },
  { key: 'innings',       label: 'IP' },
  { key: 'r',             label: 'R' },
  { key: 'er',            label: 'ER' },
  { key: 'ph',            label: 'H' },
  { key: 'phr',           label: 'HR' },
  { key: 'pbb',           label: 'BB' },
  { key: 'phitByPitch',   label: 'HP' },
  { key: 'so',            label: 'SO' },
  { key: 'era',           label: 'ERA' },
  { key: '_fip',          label: 'FIP' },
  { key: 'whip',          label: 'WHIP' },
  { key: 'k7',            label: 'K/7' },
]

function getVal(row, key) {
  if (key === 'user.name') return row.user?.name ?? '—'
  return row[key] ?? '—'
}

export default function Records() {
  const [tab, setTab] = useState('team')
  const { containerRef, indicatorRef } = useTabIndicator(tab)

  const [batting, setBatting]   = useState([])
  const [pitching, setPitching] = useState([])
  const [loading, setLoading]   = useState(false)

  const [sortKey, setSortKey]   = useState('_owar')
  const [sortDir, setSortDir]   = useState('desc')

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function sortedRows(rows) {
    return [...rows].sort((a, b) => {
      const av = getVal(a, sortKey)
      const bv = getVal(b, sortKey)
      const an = av === '—' ? -Infinity : Number(av)
      const bn = bv === '—' ? -Infinity : Number(bv)
      if (!isNaN(an) && !isNaN(bn)) return sortDir === 'desc' ? bn - an : an - bn
      return sortDir === 'desc'
        ? String(bv).localeCompare(String(av), 'ko')
        : String(av).localeCompare(String(bv), 'ko')
    })
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API_BASE}/api/records/batting`).then(r => r.json()),
      fetch(`${API_BASE}/api/records/pitching`).then(r => r.json()),
    ]).then(([b, p]) => {
      setBatting(Array.isArray(b) ? b : [])
      setPitching(Array.isArray(p) ? p : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const [filterRegPA, setFilterRegPA] = useState(false)
  const [filterRegIP, setFilterRegIP] = useState(false)

  const tgame       = batting[0]?.tgame ?? pitching[0]?.tgame ?? 0
  const batterCount = batting.length
  const regPA = tgame > 0 ? tgame : null
  const regIP = tgame > 0 ? Math.floor(tgame * 5 / 9) : null

  function parseInnings(s) {
    const [full, outs = '0'] = String(s).split('.')
    return parseInt(full) + parseInt(outs) / 3
  }

  const cols     = tab === 'batter' ? BATTING_COLS : PITCHING_COLS
  const baseRows = tab === 'batter' ? batting : pitching
  const rows = (() => {
    let r = baseRows
    if (tab === 'batter' && filterRegPA && regPA !== null)
      r = r.filter(p => (p.htb ?? 0) >= regPA)
    if (tab === 'pitcher' && filterRegIP && regIP !== null)
      r = r.filter(p => parseInnings(p.innings) >= regIP)
    return r
  })()

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.season}>2026 KWU PEGASUS</p>
        <h1 className={styles.title}>시즌 기록</h1>
      </div>

      <div ref={containerRef} className={styles.tabs}>
        <button
          data-active={tab === 'team'}
          className={`${styles.tab} ${tab === 'team' ? styles.tabActive : ''}`}
          onClick={() => setTab('team')}
        >
          팀
        </button>
        <button
          data-active={tab === 'batter'}
          className={`${styles.tab} ${tab === 'batter' ? styles.tabActive : ''}`}
          onClick={() => setTab('batter')}
        >
          타자
        </button>
        <button
          data-active={tab === 'pitcher'}
          className={`${styles.tab} ${tab === 'pitcher' ? styles.tabActive : ''}`}
          onClick={() => setTab('pitcher')}
        >
          투수
        </button>
        <div ref={indicatorRef} className={styles.tabIndicator} />
      </div>

      {tab === 'pitcher' && regIP !== null && (
        <div className={styles.metaBar}>
          <label className={`${styles.regCheck} ${filterRegIP ? styles.regCheckActive : ''}`}>
            <input
              type="checkbox"
              checked={filterRegIP}
              onChange={e => setFilterRegIP(e.target.checked)}
            />
            규정이닝 적용
          </label>
          <span className={styles.metaInfo}>
            {tgame}경기 진행
            <span className={styles.metaDivider}>|</span>
            규정이닝 <strong>{regIP}</strong>이닝 이상
            <span className={styles.tooltip}>
              <span className={styles.tooltipTrigger}>?</span>
              <span className={styles.tooltipBox}>
                규정이닝 = 팀경기수 × 5/9 (버림)<br />
                = {tgame} × 5/9 = {(tgame * 5 / 9).toFixed(2)} → {regIP}이닝
              </span>
            </span>
          </span>
        </div>
      )}

      {tab === 'batter' && regPA !== null && (
        <div className={styles.metaBar}>
          <label className={`${styles.regCheck} ${filterRegPA ? styles.regCheckActive : ''}`}>
            <input
              type="checkbox"
              checked={filterRegPA}
              onChange={e => setFilterRegPA(e.target.checked)}
            />
            규정타석 적용
          </label>
          <span className={styles.metaInfo}>
            {tgame}경기 진행
            <span className={styles.metaDivider}>|</span>
            규정타석 <strong>{regPA}</strong>타석 이상
            <span className={styles.tooltip}>
              <span className={styles.tooltipTrigger}>?</span>
              <span className={styles.tooltipBox}>
                규정타석 = 팀경기수 × 1<br />
                = {tgame}타석
              </span>
            </span>
          </span>
        </div>
      )}

      {tab === 'team' && (
        <div className={styles.empty}>팀 기록 준비 중입니다.</div>
      )}

      {(tab === 'batter' || tab === 'pitcher') && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {cols.map(c => (
                  <th
                    key={c.key}
                    className={[
                      c.key !== 'user.name' ? styles.sortable : '',
                      sortKey === c.key ? styles.colActive : '',
                    ].join(' ')}
                    onClick={c.key !== 'user.name' ? () => handleSort(c.key) : undefined}
                  >
                    {c.label}
                    {c.key !== 'user.name' && (
                      <span className={styles.sortIcon}>
                        {sortKey === c.key ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ' ↕'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={cols.length} className={styles.empty}>
                    {loading ? '불러오는 중…' : '데이터가 없습니다.'}
                  </td>
                </tr>
              ) : sortedRows(rows).map((row, i) => (
                <tr key={i}>
                  {cols.map(c => (
                    <td
                      key={c.key}
                      className={sortKey === c.key ? styles.colActive : ''}
                    >{getVal(row, c.key)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
