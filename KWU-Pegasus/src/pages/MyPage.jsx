import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ROSTER_ROLE_LABEL } from '../lib/constants'
import styles from './MyPage.module.css'

const MEMBER_ROLES = ['member', 'manager', 'staff', 'root']

export default function MyPage() {
  const { user, token, loading } = useAuth()
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [rosterHistory, setRosterHistory] = useState([])

  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [obYb, setObYb] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [memberMsg, setMemberMsg] = useState('')

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  const load = useCallback(() => {
    if (!token) return
    fetch(`${API_BASE}/api/mypage/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(meData => {
        setMe(meData)
        setName(meData.name ?? '')
        setStudentId(meData.student_id ?? '')
        setObYb(meData.ob_yb ?? '')
      })
  }, [token])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!token || !me || !MEMBER_ROLES.includes(me.role) || !me.student_id) return
    fetch(`${API_BASE}/api/mypage/roster-history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setRosterHistory(Array.isArray(data) ? data : []))
  }, [token, me])

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

  if (loading || !user || !me) return null

  const memberStatus = me.membership_status
  const canEditProfile = memberStatus === 'none'
  const showRosterHistory = MEMBER_ROLES.includes(me.role) && me.student_id

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>마이페이지</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>동아리 멤버 신청</h2>

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
                placeholder="학번 10자리"
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
          <div className={styles.profileReadonly}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>이름</span>
              <span className={styles.infoValue}>{me.name ?? '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>학번</span>
              <span className={styles.infoValue}>{me.student_id ?? '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>구분</span>
              <span className={styles.infoValue}>{me.ob_yb?.toUpperCase() ?? '—'}</span>
            </div>
          </div>
        )}

        <div className={styles.memberAction}>
          {memberStatus === 'none' && (
            <>
              <p className={styles.desc}>정보를 저장한 뒤 신청해주세요. 관리자 승인 후 멤버로 활동할 수 있습니다.</p>
              <button
                className={styles.applyBtn}
                onClick={handleMemberRequest}
                disabled={!me.name || !me.ob_yb}
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
        </div>
      </section>

      {showRosterHistory && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>로스터 이력</h2>
          {rosterHistory.length === 0 ? (
            <p className={styles.desc}>등록된 로스터 이력이 없습니다.</p>
          ) : (
            <div className={styles.rosterHistory}>
              {rosterHistory.map(r => (
                <span key={r.year} className={styles.rosterChip}>
                  <span className={styles.rosterChipYear}>{r.year}</span>
                  <span className={styles.rosterChipNumber}>#{r.number}</span>
                  <span className={styles.rosterChipRole}>{ROSTER_ROLE_LABEL[r.roster_role] ?? r.roster_role}</span>
                </span>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
