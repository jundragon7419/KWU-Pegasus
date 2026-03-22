import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL } from '../lib/constants'
import styles from './MyPage.module.css'

export default function MyPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [rosterRequests, setRosterRequests] = useState([])
  const [loading, setLoading] = useState(true)

  // 프로필 폼 상태
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [obYb, setObYb] = useState('')
  const [profileMsg, setProfileMsg] = useState('')

  const [memberMsg, setMemberMsg] = useState('')
  const [rosterMsg, setRosterMsg] = useState('')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const load = useCallback(() => {
    if (!token) return
    Promise.all([
      fetch(`${API_BASE}/api/mypage/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/mypage/roster-request`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([meData, rosterData]) => {
      setMe(meData)
      setName(meData.name ?? '')
      setStudentId(meData.student_id ?? '')
      setObYb(meData.ob_yb ?? '')
      setRosterRequests(Array.isArray(rosterData) ? rosterData : [])
      setLoading(false)
    })
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileMsg('')
    if (studentId && !/^\d{10}$/.test(studentId)) {
      setProfileMsg('학번은 10자리 숫자여야 합니다.')
      return
    }
    const res = await fetch(`${API_BASE}/api/mypage/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, student_id: studentId || undefined, ob_yb: obYb }),
    })
    const data = await res.json()
    setProfileMsg(data.message)
    if (res.ok) load()
  }

  async function handleMemberRequest() {
    setMemberMsg('')
    const res = await fetch(`${API_BASE}/api/mypage/membership-request`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setMemberMsg(data.message)
    if (res.ok) load()
  }

  async function handleRosterRequest() {
    setRosterMsg('')
    const res = await fetch(`${API_BASE}/api/mypage/roster-request`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setRosterMsg(data.message)
    if (res.ok) load()
  }

  if (!user || loading) return null

  const canEditProfile = me?.membership_status === 'none'
  const memberStatus = me?.membership_status
  const latestRoster = rosterRequests[0]

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>마이페이지</h1>

      {/* 계정 정보 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>계정 정보</h2>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>아이디</span>
          <span className={styles.infoValue}>{me?.username}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>이메일</span>
          <span className={styles.infoValue}>{me?.email}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>권한</span>
          <span className={styles.infoValue}>{ROLE_LABEL[me?.role] ?? me?.role}</span>
        </div>
      </section>

      {/* 프로필 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>프로필</h2>
        {canEditProfile ? (
          <form className={styles.form} onSubmit={handleProfileSave}>
            <div className={styles.field}>
              <label className={styles.label}>이름 (실명)</label>
              <input
                className={styles.input}
                type="text"
                placeholder="실명을 입력하세요"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>학번 (선택)</label>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="학번 10자리 (선수/스태프만)"
                value={studentId}
                onChange={e => setStudentId(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className={styles.field}>
              <span className={styles.label}>구분</span>
              <div className={styles.radioGroup}>
                {['ob', 'yb'].map(v => (
                  <label key={v} className={`${styles.radioLabel} ${obYb === v ? styles.radioSelected : ''}`}>
                    <input
                      className={styles.radioInput}
                      type="radio"
                      name="obYb"
                      value={v}
                      checked={obYb === v}
                      onChange={e => setObYb(e.target.value)}
                    />
                    {v.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
            {profileMsg && <p className={styles.msg}>{profileMsg}</p>}
            <button className={styles.saveBtn} type="submit">저장</button>
          </form>
        ) : (
          <div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>이름</span>
              <span className={styles.infoValue}>{me?.name ?? '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>학번</span>
              <span className={styles.infoValue}>{me?.student_id ?? '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>구분</span>
              <span className={styles.infoValue}>{me?.ob_yb?.toUpperCase() ?? '—'}</span>
            </div>
            <p className={styles.hint}>멤버 신청 이후에는 프로필을 수정할 수 없습니다.</p>
          </div>
        )}
      </section>

      {/* 멤버 신청 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>동아리 멤버 신청</h2>
        {memberStatus === 'none' && (
          <>
            <p className={styles.desc}>실명과 OB/YB를 저장한 뒤 신청해주세요. 관리자 승인 후 멤버로 활동할 수 있습니다.</p>
            <button
              className={styles.applyBtn}
              onClick={handleMemberRequest}
              disabled={!me?.name || !me?.ob_yb}
            >
              멤버 신청
            </button>
            {memberMsg && <p className={styles.msg}>{memberMsg}</p>}
          </>
        )}
        {memberStatus === 'pending' && (
          <p className={styles.statusPending}>신청 완료 — 관리자 승인 대기 중입니다.</p>
        )}
        {memberStatus === 'approved' && (
          <p className={styles.statusApproved}>멤버 승인 완료</p>
        )}
        {memberStatus === 'rejected' && (
          <p className={styles.statusRejected}>신청이 거부됐습니다. 관리자에게 문의해주세요.</p>
        )}
      </section>

      {/* 로스터 신청 — 멤버 승인 후에만 표시 */}
      {memberStatus === 'approved' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>로스터 등록 신청</h2>
          {!latestRoster && (
            <>
              <p className={styles.desc}>현재 활성 시즌 로스터에 등록 신청합니다. 관리자가 등번호를 지정 후 승인합니다.</p>
              <button className={styles.applyBtn} onClick={handleRosterRequest}>로스터 신청</button>
              {rosterMsg && <p className={styles.msg}>{rosterMsg}</p>}
            </>
          )}
          {latestRoster?.status === 'pending' && (
            <p className={styles.statusPending}>{latestRoster.year}년 로스터 신청 대기 중입니다.</p>
          )}
          {latestRoster?.status === 'approved' && (
            <p className={styles.statusApproved}>{latestRoster.year}년 로스터 등록 완료</p>
          )}
          {latestRoster?.status === 'rejected' && (
            <>
              <p className={styles.statusRejected}>{latestRoster.year}년 로스터 신청이 거부됐습니다.</p>
              <button className={styles.applyBtn} onClick={handleRosterRequest}>재신청</button>
              {rosterMsg && <p className={styles.msg}>{rosterMsg}</p>}
            </>
          )}
        </section>
      )}
    </div>
  )
}
