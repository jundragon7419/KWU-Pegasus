import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL, STAFF_TYPE_LABEL, ROSTER_ROLE_LABEL } from '../lib/constants'
import styles from './Admin.module.css'

const ROSTER_ROLE_OPTIONS = [
  { value: 'player',    label: '선수' },
  { value: 'headcoach', label: '감독' },
  { value: 'president', label: '회장' },
  { value: 'retired',   label: '영구결번' },
]

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
            매니저 관리
          </button>
        )}
        {isRoot && (
          <button className={`${styles.tab} ${tab === 'staffPromote' ? styles.tabActive : ''}`} onClick={() => setTab('staffPromote')}>
            스태프 관리
          </button>
        )}
        {isStaffOrRoot && (
          <button className={`${styles.tab} ${tab === 'basicUsers' ? styles.tabActive : ''}`} onClick={() => setTab('basicUsers')}>
            일반유저 관리
          </button>
        )}
        {isStaffOrRoot && (
          <button className={`${styles.tab} ${tab === 'memberMgmt' ? styles.tabActive : ''}`} onClick={() => setTab('memberMgmt')}>
            멤버 관리
          </button>
        )}
        {isStaffOrRoot && (
          <button className={`${styles.tab} ${tab === 'banned' ? styles.tabActive : ''}`} onClick={() => setTab('banned')}>
            차단 계정
          </button>
        )}
      </div>

      {tab === 'pending'      && <PendingTab token={token} />}
      {tab === 'rosterMgmt'  && <RosterManagementTab token={token} />}
      {tab === 'promote'     && isStaffOrRoot && <PromoteTab token={token} />}
      {tab === 'staffPromote' && isRoot && <StaffPromoteTab token={token} />}
      {tab === 'basicUsers'  && isStaffOrRoot && <BasicUsersTab token={token} />}
      {tab === 'memberMgmt'  && isStaffOrRoot && <MemberMgmtTab token={token} />}
      {tab === 'banned'      && isStaffOrRoot && <BannedTab />}
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
  }, [])

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

function formatDatetime(str) {
  if (!str) return '—'
  return String(str).replace('T', ' ').slice(0, 16)
}

/* ── 매니저 임명 탭 ── */
function PromoteTab({ token }) {
  const [members, setMembers] = useState([])
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API_BASE}/api/admin/members`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/admin/managers`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([membersData, managersData]) => {
      setMembers(Array.isArray(membersData) ? membersData : [])
      setManagers(Array.isArray(managersData) ? managersData : [])
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

  async function handleDemote(id) {
    setMsg('')
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/unset-manager`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setMsg(data.message)
    if (res.ok) load()
  }

  if (loading) return <p className={styles.empty}>불러오는 중...</p>

  const promoteCols = (
    <colgroup>
      <col style={{ width: '18%' }} />
      <col style={{ width: '14%' }} />
      <col style={{ width: '8%' }} />
      <col style={{ width: '14%' }} />
      <col style={{ width: '22%' }} />
      <col />
    </colgroup>
  )
  const promoteHead = (
    <thead>
      <tr><th>아이디</th><th>이름</th><th>구분</th><th>현재 권한</th><th>회원가입일시</th><th>권한 수정</th></tr>
    </thead>
  )

  return (
    <div className={styles.promoteWrap}>
      {msg && <p className={styles.rosterMsg}>{msg}</p>}

      <h3 className={styles.subTitle}>현재 매니저</h3>
      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.tableFixed}`}>
          {promoteCols}{promoteHead}
          <tbody>
            {managers.length === 0
              ? <tr><td colSpan={6} className={styles.emptyRow}>임명된 매니저가 없습니다.</td></tr>
              : managers.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.name ?? '—'}</td>
                    <td>{u.ob_yb?.toUpperCase() ?? '—'}</td>
                    <td>{ROLE_LABEL[u.authority]}</td>
                    <td>{formatDatetime(u.created_at)}</td>
                    <td>
                      <button className={styles.rejectBtn} onClick={() => handleDemote(u.id)}>권한 해제</button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      <h3 className={styles.subTitle}>매니저 임명 가능</h3>
      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.tableFixed}`}>
          {promoteCols}{promoteHead}
          <tbody>
            {members.length === 0
              ? <tr><td colSpan={6} className={styles.emptyRow}>임명 가능한 멤버가 없습니다.</td></tr>
              : members.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.name ?? '—'}</td>
                    <td>{u.ob_yb?.toUpperCase() ?? '—'}</td>
                    <td>{ROLE_LABEL[u.authority]}</td>
                    <td>{formatDatetime(u.created_at)}</td>
                    <td>
                      <button className={styles.approveBtn} onClick={() => handlePromote(u.id)}>권한 부여</button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── 스태프 임명 탭 (root 전용) ── */
function StaffPromoteTab({ token }) {
  const [candidates, setCandidates] = useState([])
  const [staffs, setStaffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [staffTypes, setStaffTypes] = useState({})
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API_BASE}/api/admin/members`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/admin/managers`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/admin/staffs`,  { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([membersData, managersData, staffsData]) => {
      const combined = [
        ...( Array.isArray(managersData) ? managersData : [] ),
        ...( Array.isArray(membersData)  ? membersData  : [] ),
      ]
      setCandidates(combined)
      setStaffs(Array.isArray(staffsData) ? staffsData : [])
      setLoading(false)
    })
  }, [token])

  useEffect(() => { load() }, [load])

  function getStaffType(id) { return staffTypes[id] ?? 'president' }
  function setStaffType(id, val) { setStaffTypes(prev => ({ ...prev, [id]: val })) }

  async function handlePromote(id) {
    setMsg('')
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/set-staff`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_type: getStaffType(id) }),
    })
    const data = await res.json()
    setMsg(data.message)
    if (res.ok) load()
  }

  async function handleDemote(id) {
    setMsg('')
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/unset-staff`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setMsg(data.message)
    if (res.ok) load()
  }

  if (loading) return <p className={styles.empty}>불러오는 중...</p>

  const staffCols = (
    <colgroup>
      <col style={{ width: '18%' }} />
      <col style={{ width: '14%' }} />
      <col style={{ width: '8%' }} />
      <col style={{ width: '14%' }} />
      <col style={{ width: '22%' }} />
      <col />
    </colgroup>
  )
  const staffHead = (
    <thead>
      <tr><th>아이디</th><th>이름</th><th>구분</th><th>현재 권한</th><th>회원가입일시</th><th>권한 수정</th></tr>
    </thead>
  )

  return (
    <div className={styles.promoteWrap}>
      {msg && <p className={styles.rosterMsg}>{msg}</p>}

      <h3 className={styles.subTitle}>현재 스태프</h3>
      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.tableFixed}`}>
          {staffCols}{staffHead}
          <tbody>
            {staffs.length === 0
              ? <tr><td colSpan={6} className={styles.emptyRow}>임명된 스태프가 없습니다.</td></tr>
              : staffs.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.name ?? '—'}</td>
                    <td>{u.ob_yb?.toUpperCase() ?? '—'}</td>
                    <td>{`스태프(${STAFF_TYPE_LABEL[u.staff_type] ?? u.staff_type})`}</td>
                    <td>{formatDatetime(u.created_at)}</td>
                    <td>
                      <button className={styles.rejectBtn} onClick={() => handleDemote(u.id)}>권한 해제</button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      <h3 className={styles.subTitle}>스태프 임명 가능</h3>
      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.tableFixed}`}>
          {staffCols}{staffHead}
          <tbody>
            {candidates.length === 0
              ? <tr><td colSpan={6} className={styles.emptyRow}>임명 가능한 멤버 또는 매니저가 없습니다.</td></tr>
              : candidates.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.name ?? '—'}</td>
                    <td>{u.ob_yb?.toUpperCase() ?? '—'}</td>
                    <td>{ROLE_LABEL[u.authority]}</td>
                    <td>{formatDatetime(u.created_at)}</td>
                    <td className={styles.actions}>
                      <select className={styles.select} value={getStaffType(u.id)} onChange={e => setStaffType(u.id, e.target.value)}>
                        <option value="president">회장</option>
                        <option value="headcoach">감독</option>
                      </select>
                      <button className={styles.approveBtn} onClick={() => handlePromote(u.id)}>권한 부여</button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── 일반유저 관리 탭 ── */
function BasicUsersTab({ token }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/admin/basic-users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setList(data); setLoading(false) })
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleBan(id) {
    setMsg('')
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/ban`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setMsg(data.message)
    if (res.ok) load()
  }

  if (loading) return <p className={styles.empty}>불러오는 중...</p>

  return (
    <div className={styles.promoteWrap}>
      {msg && <p className={styles.rosterMsg}>{msg}</p>}
      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.tableFixed}`}>
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '28%' }} />
            <col />
          </colgroup>
          <thead>
            <tr><th>아이디</th><th>현재 권한</th><th>회원가입일시</th><th>권한 수정</th></tr>
          </thead>
          <tbody>
            {list.length === 0
              ? <tr><td colSpan={4} className={styles.emptyRow}>일반 권한 유저가 없습니다.</td></tr>
              : list.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{ROLE_LABEL[u.authority] ?? u.authority}</td>
                    <td>{formatDatetime(u.created_at)}</td>
                    <td>
                      <button className={styles.rejectBtn} onClick={() => handleBan(u.id)}>계정 차단</button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── 멤버 관리 탭 ── */
const MEMBER_ROLE_ORDER = { staff: 0, manager: 1, member: 2 }
const MEMBER_ROLE_GROUP_LABEL = { staff: '스태프', manager: '매니저', member: '멤버' }
const MEMBERSHIP_LABEL = { none: '미신청', pending: '대기', approved: '멤버', rejected: '거부', banned: '차단' }

function sortOrgMembers(list) {
  return [...list].sort((a, b) => {
    const ra = MEMBER_ROLE_ORDER[a.authority] ?? 99
    const rb = MEMBER_ROLE_ORDER[b.authority] ?? 99
    if (ra !== rb) return ra - rb
    if (a.authority === 'staff') {
      const sa = a.staff_type === 'president' ? 0 : 1
      const sb = b.staff_type === 'president' ? 0 : 1
      if (sa !== sb) return sa - sb
    }
    return a.username.localeCompare(b.username)
  })
}

function MemberMgmtTab({ token }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/admin/org-members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setList(data); setLoading(false) })
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleDemote(id) {
    setMsg('')
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/demote-member`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setMsg(data.message)
    if (res.ok) load()
  }

  if (loading) return <p className={styles.empty}>불러오는 중...</p>

  const sorted = sortOrgMembers(list)
  const groups = ['staff', 'manager', 'member']
    .map(role => ({ role, users: sorted.filter(u => u.authority === role) }))
    .filter(g => g.users.length > 0)

  const cols = (
    <colgroup>
      <col style={{ width: '15%' }} />
      <col style={{ width: '12%' }} />
      <col style={{ width: '7%' }} />
      <col style={{ width: '10%' }} />
      <col style={{ width: '12%' }} />
      <col style={{ width: '16%' }} />
      <col />
    </colgroup>
  )
  const head = (
    <thead>
      <tr><th>아이디</th><th>이름</th><th>구분</th><th>로스터</th><th>멤버 상태</th><th>현재 권한</th><th>권한 수정</th></tr>
    </thead>
  )

  function getRoleDisplay(u) {
    if (u.authority === 'staff') return `스태프(${STAFF_TYPE_LABEL[u.staff_type] ?? u.staff_type})`
    return ROLE_LABEL[u.authority] ?? u.authority
  }

  return (
    <div>
      {msg && <p className={styles.rosterMsg}>{msg}</p>}
      {groups.map(({ role, users }) => (
        <div key={role} className={styles.userGroup}>
          <h3 className={styles.subTitle}>{MEMBER_ROLE_GROUP_LABEL[role]}</h3>
          <div className={styles.tableWrap}>
            <table className={`${styles.table} ${styles.tableFixed}`}>
              {cols}{head}
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.name ?? '—'}</td>
                    <td>{u.ob_yb?.toUpperCase() ?? '—'}</td>
                    <td>
                      {u.roster_year != null
                        ? <span className={styles.rosterInfo}>{u.roster_number}번</span>
                        : <span className={styles.noChange}>—</span>}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status_${u.membership_status}`]}`}>
                        {MEMBERSHIP_LABEL[u.membership_status] ?? u.membership_status}
                      </span>
                    </td>
                    <td>{getRoleDisplay(u)}</td>
                    <td>
                      {u.authority === 'member'
                        ? <button className={styles.rejectBtn} onClick={() => handleDemote(u.id)}>회원 강등</button>
                        : <span className={styles.noChange}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── 차단 계정 탭 ── */
function BannedTab() {
  return <p className={styles.empty}>준비 중입니다.</p>
}


