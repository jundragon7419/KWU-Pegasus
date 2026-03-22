import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import styles from './Admin.module.css'

const ROLE_LABEL = { user: '일반', player: '선수', manager: '매니저', staff: 'STAFF', root: 'ROOT' }
const STAFF_TYPE_LABEL = { president: '회장', coach: '감독' }

export default function Admin() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('pending')

  useEffect(() => {
    if (!user || (user.role !== 'staff' && user.role !== 'root')) {
      navigate('/unauthorized')
    }
  }, [user, navigate])

  if (!user || (user.role !== 'staff' && user.role !== 'root')) return null

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>관리자</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'pending' ? styles.tabActive : ''}`}
          onClick={() => setTab('pending')}
        >
          승인 대기
        </button>
        <button
          className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`}
          onClick={() => setTab('users')}
        >
          회원 관리
        </button>
        <button
          className={`${styles.tab} ${tab === 'roster' ? styles.tabActive : ''}`}
          onClick={() => setTab('roster')}
        >
          로스터 연도
        </button>
        <button
          className={`${styles.tab} ${tab === 'members' ? styles.tabActive : ''}`}
          onClick={() => setTab('members')}
        >
          회원 명단
        </button>
      </div>

      {tab === 'pending' && <PendingTab token={token} />}
      {tab === 'users'   && <UsersTab token={token} currentUser={user} />}
      {tab === 'roster'  && <RosterYearTab token={token} />}
      {tab === 'members' && <MembersTab token={token} />}
    </div>
  )
}

/* ── 승인 대기 탭 ── */
function PendingTab({ token }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/admin/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setList(data); setLoading(false) })
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleApprove(id) {
    await fetch(`${API_BASE}/api/admin/approve/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  async function handleReject(id) {
    if (!confirm('정말 거부하시겠습니까?')) return
    await fetch(`${API_BASE}/api/admin/reject/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  if (loading) return <p className={styles.empty}>불러오는 중...</p>
  if (list.length === 0) return <p className={styles.empty}>대기 중인 신청이 없습니다.</p>

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>아이디</th>
            <th>이메일</th>
            <th>구분</th>
            <th>신청일</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {list.map(u => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td className={styles.badge}>{u.ob_yb?.toUpperCase()}</td>
              <td>{u.created_at?.slice(0, 10)}</td>
              <td className={styles.actions}>
                <button className={styles.approveBtn} onClick={() => handleApprove(u.id)}>승인</button>
                <button className={styles.rejectBtn}  onClick={() => handleReject(u.id)}>거부</button>
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
            <th>이메일</th>
            <th>구분</th>
            <th>현재 권한</th>
            <th>상태</th>
            <th>권한 변경</th>
          </tr>
        </thead>
        <tbody>
          {list.map(u => (
            <UserRow
              key={u.id}
              u={u}
              currentUser={currentUser}
              onRoleChange={handleRoleChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── 회원 명단 탭 ── */
function MembersTab({ token }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/admin/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setList(data); setLoading(false) })
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleAdd(e) {
    e.preventDefault()
    setMsg('')
    const res = await fetch(`${API_BASE}/api/admin/members`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, name }),
    })
    const data = await res.json()
    setMsg(data.message)
    if (res.ok) { setStudentId(''); setName(''); load() }
  }

  async function handleDelete(id) {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch(`${API_BASE}/api/admin/members/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  return (
    <div className={styles.membersWrap}>
      <form className={styles.membersForm} onSubmit={handleAdd}>
        <input
          className={styles.memberInput}
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder="학번 (10자리)"
          value={studentId}
          onChange={e => setStudentId(e.target.value.replace(/\D/g, ''))}
          required
        />
        <input
          className={styles.memberInput}
          type="text"
          placeholder="이름"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <button className={styles.saveBtn} type="submit">추가</button>
      </form>
      {msg && <p className={styles.rosterMsg}>{msg}</p>}

      {loading ? (
        <p className={styles.empty}>불러오는 중...</p>
      ) : list.length === 0 ? (
        <p className={styles.empty}>등록된 회원이 없습니다.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>학번</th>
                <th>이름</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {list.map(m => (
                <tr key={m.student_id}>
                  <td>{m.student_id}</td>
                  <td>{m.name}</td>
                  <td>
                    <button className={styles.rejectBtn} onClick={() => handleDelete(m.student_id)}>삭제</button>
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

/* ── 로스터 연도 탭 ── */
function RosterYearTab({ token }) {
  const [activeYear, setActiveYear] = useState(null)
  const [years, setYears] = useState([])
  const [input, setInput] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    Promise.all([
      fetch(`${API_BASE}/api/roster/active-year`).then(r => r.json()),
      fetch(`${API_BASE}/api/roster/years`).then(r => r.json()),
    ]).then(([activeData, yearsData]) => {
      setActiveYear(activeData.year)
      setYears(yearsData)
    })
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSetYear(year) {
    const res = await fetch(`${API_BASE}/api/admin/roster-year`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ year }),
    })
    const data = await res.json()
    setMsg(data.message)
    load()
  }

  return (
    <div className={styles.rosterYearWrap}>
      <p className={styles.rosterYearDesc}>
        현재 활성 로스터 연도: <strong>{activeYear}</strong>
      </p>

      <div className={styles.rosterYearList}>
        {years.map(y => (
          <button
            key={y}
            className={`${styles.yearSelectBtn} ${y === activeYear ? styles.yearSelectActive : ''}`}
            onClick={() => handleSetYear(y)}
          >
            {y}
            {y === activeYear && <span className={styles.activeMark}> ✓ 활성</span>}
          </button>
        ))}
      </div>

      <div className={styles.rosterYearForm}>
        <input
          className={styles.yearInput}
          type="number"
          placeholder="새 연도 입력 (예: 2027)"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          className={styles.saveBtn}
          onClick={() => { if (input) handleSetYear(parseInt(input)) }}
        >
          활성 연도 변경
        </button>
      </div>

      {msg && <p className={styles.rosterMsg}>{msg}</p>}
    </div>
  )
}

function UserRow({ u, currentUser, onRoleChange }) {
  const [role, setRole] = useState(u.role)
  const [staffType, setStaffType] = useState(u.staff_type ?? 'president')
  const canChange = u.role !== 'root' && u.id !== currentUser.id

  const roleOptions =
    currentUser.role === 'root'
      ? ['user', 'player', 'manager', 'staff']
      : ['user', 'player', 'manager']

  function handleSave() {
    onRoleChange(u.id, role, staffType)
  }

  return (
    <tr>
      <td>{u.username}</td>
      <td>{u.email}</td>
      <td>{u.ob_yb?.toUpperCase()}</td>
      <td>
        <span className={`${styles.roleBadge} ${styles[`role_${u.role}`]}`}>
          {ROLE_LABEL[u.role]}
          {u.staff_type ? ` (${STAFF_TYPE_LABEL[u.staff_type]})` : ''}
        </span>
      </td>
      <td>
        <span className={`${styles.statusBadge} ${styles[`status_${u.status}`]}`}>
          {u.status === 'active' ? '활성' : u.status === 'pending' ? '대기' : '거부'}
        </span>
      </td>
      <td>
        {canChange ? (
          <div className={styles.roleForm}>
            <select
              className={styles.select}
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              {roleOptions.map(r => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
            {role === 'staff' && (
              <select
                className={styles.select}
                value={staffType}
                onChange={e => setStaffType(e.target.value)}
              >
                <option value="president">회장</option>
                <option value="coach">감독</option>
              </select>
            )}
            <button className={styles.saveBtn} onClick={handleSave}>저장</button>
          </div>
        ) : (
          <span className={styles.noChange}>—</span>
        )}
      </td>
    </tr>
  )
}
