import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL } from '../lib/constants'
import styles from './Admin.module.css'

const ROSTER_ROLE_OPTIONS = [
  { value: 'player',    label: '선수' },
  { value: 'coach',     label: '감독' },
  { value: 'president', label: '회장' },
]

const ROSTER_ROLE_LABEL = { player: '선수', coach: '감독', president: '회장' }

export default function Admin() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('pending')

  useEffect(() => {
    if (!user || (user.role !== 'staff' && user.role !== 'root' && user.role !== 'manager')) {
      navigate('/unauthorized')
    }
  }, [user, navigate])

  if (!user || (user.role !== 'staff' && user.role !== 'root' && user.role !== 'manager')) return null

  const isStaffOrRoot = user.role === 'staff' || user.role === 'root'

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>관리자</h1>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'pending' ? styles.tabActive : ''}`} onClick={() => setTab('pending')}>
          멤버 승인
        </button>
        <button className={`${styles.tab} ${tab === 'roster' ? styles.tabActive : ''}`} onClick={() => setTab('roster')}>
          로스터 승인
        </button>
        <button className={`${styles.tab} ${tab === 'rosterMgmt' ? styles.tabActive : ''}`} onClick={() => setTab('rosterMgmt')}>
          로스터 관리
        </button>
        {isStaffOrRoot && (
          <button className={`${styles.tab} ${tab === 'retired' ? styles.tabActive : ''}`} onClick={() => setTab('retired')}>
            영구결번 관리
          </button>
        )}
        {isStaffOrRoot && (
          <button className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`} onClick={() => setTab('users')}>
            회원 관리
          </button>
        )}
      </div>

      {tab === 'pending'    && <PendingTab token={token} currentUser={user} />}
      {tab === 'roster'     && <RosterRequestTab token={token} />}
      {tab === 'rosterMgmt' && <RosterManagementTab token={token} />}
      {tab === 'retired'    && isStaffOrRoot && <RetiredTab token={token} />}
      {tab === 'users'      && isStaffOrRoot && <UsersTab token={token} currentUser={user} />}
    </div>
  )
}

/* ── 멤버 승인 탭 ── */
function PendingTab({ token, currentUser }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/admin/pending-members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setList(data); setLoading(false) })
  }, [token])

  useEffect(() => { load() }, [load])

  if (loading) return <p className={styles.empty}>불러오는 중...</p>
  if (list.length === 0) return <p className={styles.empty}>멤버 신청이 없습니다.</p>

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>학번</th>
            <th>구분</th>
            <th>신청일</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {list.map(u => (
            <PendingRow key={u.id} u={u} token={token} currentUser={currentUser} onDone={load} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PendingRow({ u, token, currentUser, onDone }) {
  const [role, setRole] = useState('player')
  const [staffType, setStaffType] = useState('president')

  const roleOptions = currentUser.role === 'root'
    ? ['player', 'manager', 'staff']
    : ['player', 'manager']

  async function handleApprove() {
    const body = { role }
    if (role === 'staff') body.staff_type = staffType
    await fetch(`${API_BASE}/api/admin/approve-member/${u.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    onDone()
  }

  async function handleReject() {
    if (!confirm('거부하시겠습니까?')) return
    await fetch(`${API_BASE}/api/admin/reject-member/${u.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    onDone()
  }

  return (
    <tr>
      <td>{u.username}</td>
      <td>{u.name ?? '—'}</td>
      <td>{u.student_id ?? '—'}</td>
      <td>{u.ob_yb?.toUpperCase() ?? '—'}</td>
      <td>{u.created_at?.slice(0, 10)}</td>
      <td className={styles.actions}>
        <div className={styles.roleForm}>
          <select className={styles.select} value={role} onChange={e => setRole(e.target.value)}>
            {roleOptions.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
          {role === 'staff' && (
            <select className={styles.select} value={staffType} onChange={e => setStaffType(e.target.value)}>
              <option value="president">회장</option>
              <option value="coach">감독</option>
            </select>
          )}
          <button className={styles.approveBtn} onClick={handleApprove}>승인</button>
          <button className={styles.rejectBtn} onClick={handleReject}>거부</button>
        </div>
      </td>
    </tr>
  )
}

/* ── 로스터 승인 탭 ── */
function RosterRequestTab({ token }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/admin/roster-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setList(data); setLoading(false) })
  }, [token])

  useEffect(() => { load() }, [load])

  if (loading) return <p className={styles.empty}>불러오는 중...</p>
  if (list.length === 0) return <p className={styles.empty}>로스터 신청이 없습니다.</p>

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>권한</th>
            <th>연도</th>
            <th>신청일</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {list.map(r => (
            <RosterRequestRow key={r.id} r={r} token={token} onDone={load} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RosterRequestRow({ r, token, onDone }) {
  const [number, setNumber] = useState('')
  const [role, setRole] = useState('player')
  const [msg, setMsg] = useState('')

  async function handleApprove() {
    setMsg('')
    const res = await fetch(`${API_BASE}/api/admin/roster-requests/${r.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: parseInt(number), role }),
    })
    const data = await res.json()
    if (res.ok) { onDone() } else { setMsg(data.message) }
  }

  async function handleReject() {
    if (!confirm('거부하시겠습니까?')) return
    await fetch(`${API_BASE}/api/admin/roster-requests/${r.id}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    onDone()
  }

  return (
    <tr>
      <td>{r.username}</td>
      <td>{r.name ?? '—'}</td>
      <td>{ROLE_LABEL[r.user_role]}</td>
      <td>{r.year}</td>
      <td>{r.created_at?.slice(0, 10)}</td>
      <td className={styles.actions}>
        <div className={styles.roleForm}>
          <input
            className={styles.numberInput}
            type="number"
            min="0"
            max="99"
            placeholder="등번호"
            value={number}
            onChange={e => setNumber(e.target.value)}
          />
          <select className={styles.select} value={role} onChange={e => setRole(e.target.value)}>
            {ROSTER_ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className={styles.approveBtn} onClick={handleApprove} disabled={!number}>승인</button>
          <button className={styles.rejectBtn} onClick={handleReject}>거부</button>
        </div>
        {msg && <p className={styles.rowMsg}>{msg}</p>}
      </td>
    </tr>
  )
}

/* ── 로스터 관리 탭 ── */
function RosterManagementTab({ token }) {
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/roster/years`)
      .then(r => r.json())
      .then(data => {
        setYears(data)
        if (data.length > 0) setSelectedYear(data[0])
      })
  }, [])

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    fetch(`${API_BASE}/api/admin/roster?year=${selectedYear}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setRoster(data); setLoading(false) })
  }, [selectedYear, token])

  const reload = useCallback(() => {
    if (!selectedYear) return
    fetch(`${API_BASE}/api/admin/roster?year=${selectedYear}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setRoster)
  }, [selectedYear, token])

  async function handleDelete(year, number) {
    if (!confirm(`${year}년 ${number}번을 삭제하시겠습니까?`)) return
    await fetch(`${API_BASE}/api/admin/roster/${year}/${number}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    reload()
  }

  return (
    <div className={styles.rosterMgmtWrap}>
      <div className={styles.yearPicker}>
        {years.map(y => (
          <button
            key={y}
            className={`${styles.yearSelectBtn} ${y === selectedYear ? styles.yearSelectActive : ''}`}
            onClick={() => setSelectedYear(y)}
          >
            {y}
          </button>
        ))}
      </div>

      {loading && <p className={styles.empty}>불러오는 중...</p>}
      {!loading && roster.length === 0 && <p className={styles.empty}>등록된 선수가 없습니다.</p>}
      {!loading && roster.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>번호</th>
                <th>이름</th>
                <th>역할</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {roster.map(entry => (
                <RosterEntryRow
                  key={`${entry.year}-${entry.number}`}
                  entry={entry}
                  token={token}
                  onDelete={handleDelete}
                  onDone={reload}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function RosterEntryRow({ entry, token, onDelete, onDone }) {
  const [editing, setEditing] = useState(false)
  const [newNumber, setNewNumber] = useState(String(entry.number))
  const [role, setRole] = useState(entry.role)
  const [msg, setMsg] = useState('')

  async function handleSave() {
    setMsg('')
    const res = await fetch(`${API_BASE}/api/admin/roster/${entry.year}/${entry.number}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ newNumber: parseInt(newNumber), role }),
    })
    const data = await res.json()
    if (res.ok) { setEditing(false); onDone() } else { setMsg(data.message) }
  }

  return (
    <tr>
      <td>
        {editing
          ? <input className={styles.numberInput} type="number" min="0" max="99" value={newNumber} onChange={e => setNewNumber(e.target.value)} />
          : entry.number}
      </td>
      <td>{entry.name}</td>
      <td>
        {editing
          ? (
            <select className={styles.select} value={role} onChange={e => setRole(e.target.value)}>
              {ROSTER_ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )
          : ROSTER_ROLE_LABEL[entry.role] ?? entry.role}
      </td>
      <td className={styles.actions}>
        {editing ? (
          <>
            <button className={styles.approveBtn} onClick={handleSave}>저장</button>
            <button className={styles.rejectBtn} onClick={() => { setEditing(false); setMsg('') }}>취소</button>
            {msg && <span className={styles.rowMsg}>{msg}</span>}
          </>
        ) : (
          <>
            <button className={styles.saveBtn} onClick={() => setEditing(true)}>수정</button>
            <button className={styles.rejectBtn} onClick={() => onDelete(entry.year, entry.number)}>삭제</button>
          </>
        )}
      </td>
    </tr>
  )
}

/* ── 영구결번 관리 탭 ── */
function RetiredTab({ token }) {
  const [list, setList] = useState([])
  const [number, setNumber] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    fetch(`${API_BASE}/api/admin/retired`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setList)
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleAdd(e) {
    e.preventDefault()
    setMsg('')
    const res = await fetch(`${API_BASE}/api/admin/retired`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: parseInt(number), name }),
    })
    const data = await res.json()
    setMsg(data.message)
    if (res.ok) { setNumber(''); setName(''); load() }
  }

  async function handleDelete(num) {
    if (!confirm(`${num}번을 영구결번에서 삭제하시겠습니까?`)) return
    await fetch(`${API_BASE}/api/admin/retired/${num}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  return (
    <div className={styles.rosterYearWrap}>
      <form className={styles.rosterYearForm} onSubmit={handleAdd}>
        <input className={styles.yearInput} type="number" placeholder="번호" min="0" max="99" value={number} onChange={e => setNumber(e.target.value)} required />
        <input className={styles.yearInput} type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} required />
        <button className={styles.saveBtn} type="submit">등록</button>
      </form>
      {msg && <p className={styles.rosterMsg}>{msg}</p>}

      {list.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>번호</th><th>이름</th><th></th></tr>
            </thead>
            <tbody>
              {list.map(r => (
                <tr key={r.number}>
                  <td>{r.number}</td>
                  <td>{r.name}</td>
                  <td>
                    <button className={styles.rejectBtn} onClick={() => handleDelete(r.number)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ── 회원 관리 탭 ── */
function UsersTab({ token, currentUser }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setList(data); setLoading(false) })
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleRoleChange(id, role, staff_type) {
    const body = { role }
    if (role === 'staff') body.staff_type = staff_type
    await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    load()
  }

  if (loading) return <p className={styles.empty}>불러오는 중...</p>

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>구분</th>
            <th>현재 권한</th>
            <th>멤버 상태</th>
            <th>권한 변경</th>
          </tr>
        </thead>
        <tbody>
          {list.map(u => (
            <UserRow key={u.id} u={u} currentUser={currentUser} onRoleChange={handleRoleChange} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UserRow({ u, currentUser, onRoleChange }) {
  const [role, setRole] = useState(u.role)
  const [staffType, setStaffType] = useState(u.staff_type ?? 'president')
  const canChange = u.role !== 'root' && u.id !== currentUser.id

  const MEMBERSHIP_LABEL = { none: '미신청', pending: '대기', approved: '멤버', rejected: '거부' }

  const roleOptions = currentUser.role === 'root'
    ? ['user', 'player', 'manager', 'staff']
    : ['user', 'player', 'manager']

  return (
    <tr>
      <td>{u.username}</td>
      <td>{u.name ?? '—'}</td>
      <td>{u.ob_yb?.toUpperCase() ?? '—'}</td>
      <td>
        <span className={`${styles.roleBadge} ${styles[`role_${u.role}`]}`}>
          {ROLE_LABEL[u.role]}
          {u.staff_type === 'president' ? ' (회장)' : u.staff_type === 'coach' ? ' (감독)' : ''}
        </span>
      </td>
      <td>
        <span className={`${styles.statusBadge} ${styles[`status_${u.membership_status}`]}`}>
          {MEMBERSHIP_LABEL[u.membership_status] ?? u.membership_status}
        </span>
      </td>
      <td>
        {canChange ? (
          <div className={styles.roleForm}>
            <select className={styles.select} value={role} onChange={e => setRole(e.target.value)}>
              {roleOptions.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
            {role === 'staff' && (
              <select className={styles.select} value={staffType} onChange={e => setStaffType(e.target.value)}>
                <option value="president">회장</option>
                <option value="coach">감독</option>
              </select>
            )}
            <button className={styles.saveBtn} onClick={() => onRoleChange(u.id, role, staffType)}>저장</button>
          </div>
        ) : (
          <span className={styles.noChange}>—</span>
        )}
      </td>
    </tr>
  )
}
