import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import { EVENT_TYPES } from '../../lib/constants'
import { useAuth } from '../../context/AuthContext'
import styles from './EventWrite.module.css'

const TYPE_OPTIONS = [
  { key: 'training', label: '훈련' },
  { key: 'meeting',  label: '미팅' },
  { key: 'events',   label: '이벤트' },
  { key: 'etc',      label: '기타' },
]

let uid = 1
function newItem() {
  return { id: uid++, type: 'training', startDate: '', endDate: '', name: '' }
}

function getDatesInRange(start, end) {
  const dates = []
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const cur = new Date(sy, sm - 1, sd)
  const last = new Date(ey, em - 1, ed)
  while (cur <= last) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const d = String(cur.getDate()).padStart(2, '0')
    dates.push(`${y}-${m}-${d}`)
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

export default function EventWrite() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token } = useAuth()

  const [tab, setTab] = useState(searchParams.get('tab') === 'edit' ? 'edit' : 'add')

  // ── 추가 탭 상태 ──
  const [items, setItems] = useState([newItem()])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])
  const [emptyNames, setEmptyNames] = useState(new Set())
  const [emptyDates, setEmptyDates] = useState(new Set())

  // ── 수정 탭 상태 ──
  const [editCurrent, setEditCurrent] = useState(() => {
    const t = new Date()
    return { year: t.getFullYear(), month: t.getMonth() }
  })
  const [allEditEvents, setAllEditEvents] = useState([])
  const [editRows, setEditRows] = useState([])
  const [editFetching, setEditFetching] = useState(false)
  const [savingIds, setSavingIds] = useState(new Set())
  const [savedIds, setSavedIds] = useState(new Set())
  const [editError, setEditError] = useState('')

  // 수정 탭 — 연도별 데이터 로딩
  useEffect(() => {
    if (tab !== 'edit') return
    setEditFetching(true)
    fetch(`${API_BASE}/api/events?year=${editCurrent.year}`)
      .then(r => r.json())
      .then(data => { setAllEditEvents(Array.isArray(data) ? data : []) })
      .catch(() => {})
      .finally(() => setEditFetching(false))
  }, [tab, editCurrent.year])

  // 수정 탭 — 월 필터링
  useEffect(() => {
    const filtered = allEditEvents
      .filter(e => parseInt(e.date.split('-')[1]) === editCurrent.month + 1)
      .sort((a, b) => a.date.localeCompare(b.date))
    setEditRows(filtered.map(e => ({ ...e })))
  }, [allEditEvents, editCurrent.month])

  // ── 추가 탭 함수 ──
  function addItem() { setItems(prev => [...prev, newItem()]) }
  function removeItem(id) {
    setItems(prev => prev.filter(item => item.id !== id))
    setEmptyNames(prev => { const s = new Set(prev); s.delete(id); return s })
    setEmptyDates(prev => { const s = new Set(prev); s.delete(id); return s })
  }
  function updateItem(id, field, value) {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      if (field === 'startDate' && updated.endDate && value > updated.endDate)
        updated.endDate = value
      if (field === 'endDate' && updated.startDate && value < updated.startDate)
        updated.startDate = value
      return updated
    }))
  }

  async function handleSubmit() {
    setErrors([])
    const invalidNames = new Set()
    const invalidDates = new Set()
    for (const item of items) {
      if (!item.startDate || !item.endDate) invalidDates.add(item.id)
      if (!item.name.trim()) invalidNames.add(item.id)
    }
    if (invalidNames.size > 0 || invalidDates.size > 0) {
      setEmptyNames(invalidNames)
      setEmptyDates(invalidDates)
      return
    }

    setLoading(true)
    const failed = []
    for (const item of items) {
      for (const date of getDatesInRange(item.startDate, item.endDate)) {
        try {
          const res = await fetch(`${API_BASE}/api/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ date, type: item.type, name: item.name.trim() }),
          })
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            failed.push(`${date} "${item.name.trim()}" — ${res.status === 409 ? '이미 존재하는 일정입니다' : (data.message || '저장 실패')}`)
          }
        } catch {
          failed.push(`${date} "${item.name.trim()}" — 네트워크 오류`)
        }
      }
    }
    setLoading(false)
    if (failed.length > 0) setErrors(failed)
    else navigate('/schedule')
  }

  // ── 수정 탭 함수 ──
  function prevEditMonth() {
    setEditCurrent(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    )
  }
  function nextEditMonth() {
    setEditCurrent(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )
  }

  function updateEditRow(id, field, value) {
    setEditRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row))
  }

  async function saveEditRow(id) {
    const row = editRows.find(r => r.id === id)
    if (!row || !row.date || !row.name.trim()) return
    setEditError('')
    setSavingIds(prev => new Set(prev).add(id))
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: row.date, type: row.type, name: row.name.trim() }),
      })
      if (res.ok) {
        setAllEditEvents(prev => prev.map(e => e.id === id ? { ...row, name: row.name.trim() } : e))
        const savedMonth = parseInt(row.date.split('-')[1])
        if (savedMonth !== editCurrent.month + 1) {
          setEditRows(prev => prev.filter(r => r.id !== id))
        } else {
          setSavedIds(prev => new Set(prev).add(id))
          setTimeout(() => setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s }), 1500)
        }
      } else {
        const data = await res.json().catch(() => ({}))
        setEditError(res.status === 409 ? '이미 존재하는 일정입니다.' : (data.message || '저장에 실패했습니다.'))
      }
    } catch {
      setEditError('네트워크 오류가 발생했습니다.')
    }
    setSavingIds(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  async function deleteEditRow(id) {
    if (!window.confirm('이 일정을 삭제하시겠습니까?')) return
    setSavingIds(prev => new Set(prev).add(id))
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        setAllEditEvents(prev => prev.filter(e => e.id !== id))
        setEditRows(prev => prev.filter(r => r.id !== id))
      }
    } catch {}
    setSavingIds(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>일정 관리</h1>
        {tab === 'add' && (
          <button className={styles.addBtn} onClick={addItem} title="일정 항목 추가" disabled={loading}>+</button>
        )}
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'add' ? styles.tabActive : ''}`} onClick={() => { setTab('add'); setErrors([]) }}>
          일정 추가
        </button>
        <button className={`${styles.tab} ${tab === 'edit' ? styles.tabActive : ''}`} onClick={() => { setTab('edit'); setErrors([]) }}>
          일정 수정
        </button>
      </div>

      {/* ── 추가 탭 ── */}
      {tab === 'add' && (
        <>
          <div className={styles.listHeader}>
            <span />
            <span className={styles.headerCell}>유형</span>
            <span className={`${styles.headerCell} ${styles.headerDate}`}>날짜</span>
            <span className={styles.headerCell}>일정 이름</span>
            <span />
          </div>

          <div className={styles.list}>
            {items.map((item, idx) => (
              <div key={item.id} className={styles.row}>
                <span className={styles.rowIndex}>#{idx + 1}</span>
                <select
                  className={styles.typeSelect}
                  style={{ borderLeft: `3px solid ${EVENT_TYPES[item.type].color}` }}
                  value={item.type}
                  onChange={e => updateItem(item.id, 'type', e.target.value)}
                  disabled={loading}
                >
                  {TYPE_OPTIONS.map(({ key, label }) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  className={`${styles.dateInput} ${emptyDates.has(item.id) ? styles.dateInputError : ''}`}
                  value={item.startDate}
                  onChange={e => {
                    updateItem(item.id, 'startDate', e.target.value)
                    if (e.target.value) setEmptyDates(prev => { const s = new Set(prev); s.delete(item.id); return s })
                  }}
                  disabled={loading}
                />
                <span className={styles.dateSep}>~</span>
                <input
                  type="date"
                  className={`${styles.dateInput} ${emptyDates.has(item.id) ? styles.dateInputError : ''}`}
                  value={item.endDate}
                  onChange={e => {
                    updateItem(item.id, 'endDate', e.target.value)
                    if (e.target.value) setEmptyDates(prev => { const s = new Set(prev); s.delete(item.id); return s })
                  }}
                  disabled={loading}
                />
                <input
                  type="text"
                  className={`${styles.nameInput} ${emptyNames.has(item.id) ? styles.nameInputError : ''}`}
                  placeholder="일정 이름을 입력하세요"
                  value={item.name}
                  onChange={e => {
                    updateItem(item.id, 'name', e.target.value)
                    if (e.target.value.trim()) setEmptyNames(prev => { const s = new Set(prev); s.delete(item.id); return s })
                  }}
                  disabled={loading}
                  maxLength={100}
                />
                <button
                  className={styles.removeBtn}
                  onClick={() => removeItem(item.id)}
                  disabled={loading}
                  style={{ visibility: items.length === 1 ? 'hidden' : 'visible' }}
                >✕</button>
              </div>
            ))}
          </div>

          {errors.length > 0 && (
            <div className={styles.errorBox}>
              {errors.map((msg, i) => <p key={i} className={styles.errorLine}>{msg}</p>)}
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={() => navigate('/schedule')} disabled={loading}>취소</button>
            <button className={styles.submitButton} onClick={handleSubmit} disabled={loading}>
              {loading ? '저장 중…' : '저장'}
            </button>
          </div>
        </>
      )}

      {/* ── 수정 탭 ── */}
      {tab === 'edit' && (
        <>
          <div className={styles.editNav}>
            <button className={styles.editNavBtn} onClick={prevEditMonth}>&#8249;</button>
            <span className={styles.editNavTitle}>{editCurrent.year}년 {editCurrent.month + 1}월</span>
            <button className={styles.editNavBtn} onClick={nextEditMonth}>&#8250;</button>
          </div>

          <div className={styles.editListHeader}>
            <span />
            <span className={styles.headerCell}>유형</span>
            <span className={styles.headerCell}>날짜</span>
            <span className={styles.headerCell}>일정 이름</span>
            <span />
            <span />
          </div>

          {editError && (
            <div className={styles.errorBox}>
              <p className={styles.errorLine}>{editError}</p>
            </div>
          )}

          {editFetching ? (
            <div className={styles.empty}>불러오는 중…</div>
          ) : editRows.length === 0 ? (
            <div className={styles.empty}>이번 달 일정이 없습니다.</div>
          ) : (
            <div className={styles.list}>
              {editRows.map((row, idx) => (
                <div
                  key={row.id}
                  className={`${styles.editRow} ${savedIds.has(row.id) ? styles.editRowSaved : ''}`}
                >
                  <span className={styles.rowIndex}>#{idx + 1}</span>
                  <select
                    className={styles.typeSelect}
                    style={{ borderLeft: `3px solid ${EVENT_TYPES[row.type]?.color ?? '#888'}` }}
                    value={row.type}
                    onChange={e => updateEditRow(row.id, 'type', e.target.value)}
                    disabled={savingIds.has(row.id)}
                  >
                    {TYPE_OPTIONS.map(({ key, label }) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={row.date}
                    onChange={e => updateEditRow(row.id, 'date', e.target.value)}
                    disabled={savingIds.has(row.id)}
                  />
                  <input
                    type="text"
                    className={styles.nameInput}
                    value={row.name}
                    onChange={e => updateEditRow(row.id, 'name', e.target.value)}
                    disabled={savingIds.has(row.id)}
                    maxLength={100}
                  />
                  <button
                    className={styles.saveRowBtn}
                    onClick={() => saveEditRow(row.id)}
                    disabled={savingIds.has(row.id)}
                  >
                    {savingIds.has(row.id) ? '…' : '저장'}
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => deleteEditRow(row.id)}
                    disabled={savingIds.has(row.id)}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
