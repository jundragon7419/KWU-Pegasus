import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL, STAFF_TYPE_LABEL } from '../lib/constants'
import styles from './Admin.module.css'

const ROSTER_ROLE_OPTIONS = [
  { value: 'player',    label: '선수' },
  { value: 'headcoach', label: '감독' },
  { value: 'president', label: '회장' },
  { value: 'retired',   label: '영구결번' },
]

const ROSTER_ROLE_LABEL = { player: '선수', headcoach: '감독', president: '회장', retired: '영구결번' }

export default function Admin() {
  const { user, token } = useAuth()
  const [tab, setTab] = useState('pending')

  const isRoot = user?.role === 'root'
  const isStaffOrRoot = user && ['staff', 'root'].includes(user.role)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>관리자</h1>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'pending' ? styles.tabActive : ''}`} onClick={() => setTab('pending')}>
          멤버 승인
        </button>
        <button className={`${styles.tab} ${tab === 'rosterMgmt' ? styles.tabActive : ''}`} onClick={() => setTab('rosterMgmt')}>
          로스터 관리
        </button>
        {isStaffOrRoot && (
          <button className={`${styles.tab} ${tab === 'promote' ? styles.tabActive : ''}`} onClick={() => setTab('promote')}>
            매니저 임명
          </button>
        )}
        {isRoot && (
          <button className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`} onClick={() => setTab('users')}>
            회원 관리
          </button>
        )}
      </div>

      {tab === 'pending'    && <PendingTab token={token} />}
      {tab === 'rosterMgmt' && <RosterManagementTab token={token} />}
      {tab === 'promote'    && isStaffOrRoot && <PromoteTab token={token} />}
      {tab === 'users'      && isRoot && <UsersTab token={token} currentUser={user} />}
    </div>
  )
}

/* ── 멤버 승인 탭 ── */
function PendingTab({ token }) {
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
            <PendingRow key={u.id} u={u} token={token} onDone={load} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PendingRow({ u, token, onDone }) {
  async function handleApprove() {
    await fetch(`${API_BASE}/api/admin/approve-member/${u.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
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
        <button className={styles.approveBtn} onClick={handleApprove}>승인</button>
        <button className={styles.rejectBtn} onClick={handleReject}>거부</button>
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

  const [addYear, setAddYear] = useState('')
  const [addNumber, setAddNumber] = useState('')
  const [addName, setAddName] = useState('')
  const [addStudentId, setAddStudentId] = useState('')
  const [addRole, setAddRole] = useState('player')
  const [addMsg, setAddMsg] = useState('')

  const loadYears = useCallback(() => {
    fetch(`${API_BASE}/api/roster/years`)
      .then(r => r.json())
      .then(data => {
        setYears(data)
        if (data.length > 0 && !selectedYear) setSelectedYear(data[0])
      })
  }, [selectedYear])

  useEffect(() => { loadYears() }, [])

  const loadRoster = useCallback(() => {
    if (!selectedYear) return
    setLoading(true)
    fetch(`${API_BASE}/api/admin/roster?year=${selectedYear}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setRoster(data); setLoading(false) })
  }, [selectedYear, token])

  useEffect(() => { loadRoster() }, [loadRoster])

  async function handleAdd(e) {
    e.preventDefault()
    setAddMsg('')
    const res = await fetch(`${API_BASE}/api/admin/roster`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: parseInt(addYear),
        number: parseInt(addNumber),
        name: addName,
        student_id: addStudentId,
        role: addRole,
      }),
    })
    const data = await res.json()
    setAddMsg(data.message)
    if (res.ok) {
      setAddNumber(''); setAddName(''); setAddStudentId(''); setAddRole('player')
      loadYears()
      if (parseInt(addYear) === selectedYear) loadRoster()
      else setSelectedYear(parseInt(addYear))
    }
  }

  async function handleDelete(year, number) {
    if (!confirm(`${year}년 ${number}번을 삭제하시겠습니까?`)) return
    await fetch(`${API_BASE}/api/admin/roster/${year}/${number}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    loadRoster()
  }

  return (
    <div className={styles.rosterMgmtWrap}>
      <form className={styles.rosterAddForm} onSubmit={handleAdd}>
        <input className={styles.numberInput} style={{ width: '64px' }} type="number" placeholder="연도" value={addYear} onChange={e => setAddYear(e.target.value)} required />
        <input className={styles.numberInput} style={{ width: '56px' }} type="number" min="0" max="99" placeholder="번호" value={addNumber} onChange={e => setAddNumber(e.target.value)} required />
        <input className={styles.memberInput} type="text" placeholder="이름" value={addName} onChange={e => setAddName(e.target.value)} required />
        <input className={styles.memberInput} type="text" inputMode="numeric" maxLength={10} placeholder="학번 10자리" value={addStudentId} onChange={e => setAddStudentId(e.target.value.replace(/\D/g, ''))} required />
        <select className={styles.select} value={addRole} onChange={e => setAddRole(e.target.value)}>
          {ROSTER_ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button className={styles.approveBtn} type="submit">추가</button>
      </form>
      {addMsg && <p className={styles.rowMsg}>{addMsg}</p>}

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
      {!loading && selectedYear && roster.length === 0 && <p className={styles.empty}>등록된 선수가 없습니다.</p>}
      {!loading && roster.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>번호</th>
                <th>이름</th>
                <th>학번</th>
                <th>멤버 ID</th>
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
                  onDone={loadRoster}
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
  const [name, setName] = useState(entry.name)
  const [studentId, setStudentId] = useState(entry.student_id)
  const [role, setRole] = useState(entry.role)
  const [msg, setMsg] = useState('')

  async function handleSave() {
    setMsg('')
    const res = await fetch(`${API_BASE}/api/admin/roster/${entry.year}/${entry.number}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ newNumber: parseInt(newNumber), name, student_id: studentId, role }),
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
      <td>
        {editing
          ? <input className={styles.memberInput} type="text" value={name} onChange={e => setName(e.target.value)} />
          : entry.name}
      </td>
      <td>
        {editing
          ? <input className={styles.numberInput} style={{ width: '100px' }} type="text" inputMode="numeric" maxLength={10} value={studentId} onChange={e => setStudentId(e.target.value.replace(/\D/g, ''))} />
          : entry.student_id}
      </td>
      <td>
        {entry.username
          ? <span className={styles.rosterInfo}>{entry.username}</span>
          : <span className={styles.noChange}>미가입</span>}
      </td>
      <td>
        {editing
          ? <select className={styles.select} value={role} onChange={e => setRole(e.target.value)}>
              {ROSTER_ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
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

/* ── 매니저 임명 탭 ── */
function PromoteTab({ token }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/admin/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setList(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [token])

  useEffect(() => { load() }, [load])

  async function handlePromote(id) {
    setMsg('')
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/set-manager`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setMsg(data.message)
    if (res.ok) load()
  }

  if (loading) return <p className={styles.empty}>불러오는 중...</p>
  if (list.length === 0) return <p className={styles.empty}>임명 가능한 멤버가 없습니다.</p>

  return (
    <div className={styles.tableWrap}>
      {msg && <p className={styles.rosterMsg}>{msg}</p>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>구분</th>
            <th>멤버 상태</th>
            <th>임명</th>
          </tr>
        </thead>
        <tbody>
          {list.map(u => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.name ?? '—'}</td>
              <td>{u.ob_yb?.toUpperCase() ?? '—'}</td>
              <td>승인됨</td>
              <td>
                <button className={styles.approveBtn} onClick={() => handlePromote(u.id)}>매니저 임명</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
            <th>로스터</th>
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

  function getRoleDisplay(r, st) {
    if (r === 'staff') return `${ROLE_LABEL[r]} (${STAFF_TYPE_LABEL[st] ?? st})`
    return ROLE_LABEL[r] ?? r
  }

  return (
    <tr>
      <td>{u.username}</td>
      <td>{u.name ?? '—'}</td>
      <td>{u.ob_yb?.toUpperCase() ?? '—'}</td>
      <td>
        <span className={`${styles.roleBadge} ${styles[`role_${u.role}`]}`}>
          {getRoleDisplay(u.role, u.staff_type)}
        </span>
      </td>
      <td>
        <span className={`${styles.statusBadge} ${styles[`status_${u.membership_status}`]}`}>
          {MEMBERSHIP_LABEL[u.membership_status] ?? u.membership_status}
        </span>
      </td>
      <td>
        {u.roster_year != null
          ? <span className={styles.rosterInfo}>{u.roster_number}번</span>
          : <span className={styles.noChange}>—</span>}
      </td>
      <td>
        {canChange ? (
          <div className={styles.roleForm}>
            <select className={styles.select} value={role} onChange={e => setRole(e.target.value)}>
              <option value="basic">일반</option>
              <option value="member">멤버</option>
              <option value="manager">매니저</option>
              <option value="staff">스태프</option>
              <option value="root">ROOT</option>
            </select>
            {role === 'staff' && (
              <select className={styles.select} value={staffType} onChange={e => setStaffType(e.target.value)}>
                <option value="president">회장</option>
                <option value="headcoach">감독</option>
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
