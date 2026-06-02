import { useState, useEffect, useCallback, useRef } from 'react'
import { useTabIndicator } from '../hooks/useTabIndicator'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ROSTER_ROLE_LABEL, POST_TYPE_LABEL } from '../lib/constants'
import { COUNTRY_CODES } from '../lib/countryCodes'
import ReactCountryFlag from 'react-country-flag'
import Pagination from '../components/Pagination'
import styles from './MyPage.module.css'

const PAGE_SIZE = 15

const MEMBER_ROLES = ['member', 'manager', 'staff', 'root']

function formatKoreanPhone(digits) {
  const d = digits.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

function formatDisplayPhone(phone, countryCode) {
  if (!phone) return null
  if (countryCode === '82') return `+82 ${formatKoreanPhone(phone)}`
  return `+${countryCode} ${phone}`
}
const TABS = [
  { key: 'account',     label: '계정 정보' },
  { key: 'club',        label: '활동 내역' },
  { key: 'posts',       label: '내 게시글' },
  { key: 'mycomments',  label: '내 댓글' },
]

const AUTHORITY_LABEL = {
  basic: 'basic', member: 'member', manager: 'manager', staff: 'staff', root: 'root',
}

function getRoleDisplay(role, staffType) {
  if (role === 'member')  return '선수'
  if (role === 'manager') return '매니저'
  if (role === 'staff')   return staffType === 'president' ? '회장' : staffType === 'headcoach' ? '감독' : '스태프'
  if (role === 'root')    return 'superuser'
  return null
}

const MEMBERSHIP_STATUS_LABEL = {
  none: '신청 전', pending: '승인 대기 중', approved: '승인 완료', rejected: '신청 거부', banned: '차단됨',
}

export default function MyPage() {
  const { user, token, loading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account')
  const { containerRef: tabContainerRef, indicatorRef: tabIndicatorRef } = useTabIndicator(activeTab)

  const [myPosts, setMyPosts]               = useState([])
  const [myComments, setMyComments]         = useState([])
  const [myPostsAll, setMyPostsAll]               = useState([])
  const [postsAllLoaded, setPostsAllLoaded]       = useState(false)
  const [postsPage, setPostsPage]                 = useState(1)
  const [myCommentsAll, setMyCommentsAll]         = useState([])
  const [commentsAllLoaded, setCommentsAllLoaded] = useState(false)
  const [commentsPage, setCommentsPage]           = useState(1)
  const [me, setMe] = useState(null)
  const [rosterHistory, setRosterHistory] = useState([])

  // 계정 정보 편집
  const [editingAccount, setEditingAccount] = useState(false)
  const [editUsername, setEditUsername]     = useState('')
  const [editEmail, setEditEmail]           = useState('')
  const [editPhone, setEditPhone]           = useState('')
  const [editCountryCode, setEditCountryCode]   = useState('82')
  const [selectedCountry, setSelectedCountry]   = useState(COUNTRY_CODES.find(c => c.iso === 'KR'))
  const [countryInput, setCountryInput]         = useState('82')
  const [showCountryDrop, setShowCountryDrop]   = useState(false)
  const countryRef = useRef(null)
  const [usernameCheck, setUsernameCheck] = useState(null) // null | 'ok' | 'taken'
  const [emailCheck, setEmailCheck]       = useState(null)
  const [accountMsg, setAccountMsg] = useState('')

  // 멤버 신청
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [name, setName]           = useState('')
  const [studentId, setStudentId] = useState('')
  const [obYb, setObYb]           = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [memberMsg, setMemberMsg]   = useState('')

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
    function onClickOutside(e) {
      if (countryRef.current && !countryRef.current.contains(e.target))
        setShowCountryDrop(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (!token || !me || !MEMBER_ROLES.includes(me.role) || !me.student_id) return
    fetch(`${API_BASE}/api/mypage/roster-history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setRosterHistory(Array.isArray(data) ? data : []))
  }, [token, me])

  useEffect(() => {
    if (!token || !me || !MEMBER_ROLES.includes(me.role)) return
    fetch(`${API_BASE}/api/mypage/posts`,    { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setMyPosts(Array.isArray(data) ? data : []))
    fetch(`${API_BASE}/api/mypage/comments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setMyComments(Array.isArray(data) ? data : []))
  }, [token, me])

  useEffect(() => {
    if (activeTab !== 'posts' || postsAllLoaded || !token) return
    fetch(`${API_BASE}/api/mypage/posts/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setMyPostsAll(Array.isArray(data) ? data : []); setPostsAllLoaded(true) })
  }, [activeTab, postsAllLoaded, token])

  useEffect(() => {
    if (activeTab !== 'mycomments' || commentsAllLoaded || !token) return
    fetch(`${API_BASE}/api/mypage/comments/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setMyCommentsAll(Array.isArray(data) ? data : []); setCommentsAllLoaded(true) })
  }, [activeTab, commentsAllLoaded, token])

  // ── 계정 편집 열기 ──
  function handleEditOpen() {
    const countryCode = me.phone_country ?? '82'
    const found = COUNTRY_CODES.find(c => c.code === countryCode) ?? COUNTRY_CODES.find(c => c.iso === 'KR')
    setEditUsername(me.username ?? '')
    setEditEmail(me.email ?? '')
    setEditCountryCode(countryCode)
    setSelectedCountry(found)
    setCountryInput(countryCode)
    setEditPhone(countryCode === '82' ? formatKoreanPhone(me.phone ?? '') : (me.phone ?? ''))
    setUsernameCheck(null)
    setEmailCheck(null)
    setAccountMsg('')
    setEditingAccount(true)
  }

  function selectCountry(c) {
    setEditCountryCode(c.code)
    setSelectedCountry(c)
    setCountryInput(c.code)
    setShowCountryDrop(false)
    setEditPhone(prev => {
      const digits = prev.replace(/\D/g, '')
      return c.code === '82' ? formatKoreanPhone(digits) : digits
    })
  }

  function handleCountryInput(val) {
    setCountryInput(val)
    setShowCountryDrop(true)
  }

  function handleCountryKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const input = countryInput.trim()
      const filtered = input
        ? COUNTRY_CODES.filter(c =>
            c.code.startsWith(input) || c.name.includes(input)
          )
        : COUNTRY_CODES
      const sorted = /^\d+$/.test(input)
        ? [...filtered].sort((a, b) => parseInt(a.code) - parseInt(b.code))
        : filtered
      if (sorted.length > 0) selectCountry(sorted[0])
    }
  }

  function handlePhoneChange(e) {
    if (editCountryCode === '82') {
      setEditPhone(formatKoreanPhone(e.target.value))
    } else {
      setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 15))
    }
  }

  function handleEditCancel() {
    setEditingAccount(false)
    setAccountMsg('')
  }

  // ── 중복 확인 ──
  async function handleCheckUsername() {
    if (!editUsername) return
    const res = await fetch(
      `${API_BASE}/api/mypage/check-username?username=${encodeURIComponent(editUsername)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await res.json()
    setUsernameCheck(data.available ? 'ok' : 'taken')
  }

  async function handleCheckEmail() {
    if (!editEmail) return
    const res = await fetch(
      `${API_BASE}/api/mypage/check-email?email=${encodeURIComponent(editEmail)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await res.json()
    setEmailCheck(data.available ? 'ok' : 'taken')
  }

  // ── 계정 저장 ──
  async function handleAccountSave() {
    setAccountMsg('')
    const usernameChanged = editUsername !== me.username
    const emailChanged    = editEmail    !== me.email

    if (!editUsernameValid) {
      setAccountMsg('아이디 형식을 확인해주세요.')
      return
    }
    if (!editEmailValid) {
      setAccountMsg('이메일 형식을 확인해주세요.')
      return
    }
    if (usernameChanged && usernameCheck !== 'ok') {
      setAccountMsg('아이디 중복 확인을 해주세요.')
      return
    }
    if (emailChanged && emailCheck !== 'ok') {
      setAccountMsg('이메일 중복 확인을 해주세요.')
      return
    }

    const res = await fetch(`${API_BASE}/api/mypage/account`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: editUsername, email: editEmail, phone: editPhone, phone_country: editCountryCode }),
    })
    const data = await res.json()
    setAccountMsg(data.message)
    if (res.ok) {
      setEditingAccount(false)
      load()
    }
  }

  // ── 멤버 신청 ──
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

  const isBasic       = me.role === 'basic'
  const memberStatus  = me.membership_status
  const roleDisplay   = getRoleDisplay(me.role, me.staff_type)
  const showRosterHistory = MEMBER_ROLES.includes(me.role) && me.student_id

  const filteredCountries = (() => {
    const input = countryInput.trim()
    if (!input) return COUNTRY_CODES
    const filtered = COUNTRY_CODES.filter(c =>
      c.code.startsWith(input) || c.name.includes(input)
    )
    if (/^\d+$/.test(input)) {
      return [...filtered].sort((a, b) => parseInt(a.code) - parseInt(b.code))
    }
    return filtered
  })()

  const usernameChanged   = editUsername !== me.username
  const emailChanged      = editEmail    !== me.email
  const editUsernameValid = /^[a-zA-Z0-9_]{1,15}$/.test(editUsername)
  const editUsernameError = editUsername && !editUsernameValid ? '영문 대/소문자, 숫자, _ 만 · 최대 15자' : ''
  const editEmailValid    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)
  const editEmailError    = editEmail && !editEmailValid ? '올바른 이메일 형식이 아닙니다.' : ''

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>마이페이지</h1>

      {/* 탭 네비게이션 */}
      <nav ref={tabContainerRef} className={styles.tabNav}>
        {TABS.map(t => (
          <button
            key={t.key}
            data-active={activeTab === t.key}
            className={`${styles.tabBtn} ${activeTab === t.key ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab(t.key); setPostsPage(1); setCommentsPage(1) }}
          >
            {t.label}
          </button>
        ))}
        <div ref={tabIndicatorRef} className={styles.tabIndicator} />
      </nav>

      {/* ─── 계정 정보 탭 ─── */}
      {activeTab === 'account' && (
        <div className={styles.tabContent}>

          {/* 사용자 정보 */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>사용자 정보</h2>
              {!editingAccount
                ? <button className={styles.editBtn} onClick={handleEditOpen}>수정</button>
                : (
                  <div className={styles.editActions}>
                    <button className={styles.saveBtn} onClick={handleAccountSave}>저장</button>
                    <button className={styles.cancelBtn} onClick={handleEditCancel}>취소</button>
                  </div>
                )
              }
            </div>

            {/* 아이디 */}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                아이디
                {editingAccount && (
                  <span className={styles.tooltipWrap}>
                    <span className={styles.tooltipIcon}>?</span>
                    <span className={styles.tooltipBox}>
                      영문 대/소문자, 숫자, 언더 바(_)로 구성될 수 있으며<br />
                      15자 이하로 구성되어야 합니다.
                    </span>
                  </span>
                )}
              </span>
              {editingAccount ? (
                <div className={styles.inlineEditCell}>
                  <input
                    className={`${styles.inlineInput} ${editUsernameError ? styles.inlineInputError : ''}`}
                    value={editUsername}
                    onChange={e => {
                      setEditUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15))
                      setUsernameCheck(null)
                    }}
                  />
                  {usernameChanged && !editUsernameError && (
                    <button className={styles.checkBtn} type="button" onClick={handleCheckUsername}>중복확인</button>
                  )}
                  {editUsernameError  && <span className={styles.checkFail}>{editUsernameError}</span>}
                  {!editUsernameError && usernameCheck === 'ok'    && <span className={styles.checkOk}>사용 가능</span>}
                  {!editUsernameError && usernameCheck === 'taken' && <span className={styles.checkFail}>이미 사용 중</span>}
                </div>
              ) : (
                <span className={styles.infoValue}>{me.username}</span>
              )}
            </div>

            {/* 이메일 */}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>이메일</span>
              {editingAccount ? (
                <div className={styles.inlineEditCell}>
                  <input
                    className={`${styles.inlineInput} ${editEmailError ? styles.inlineInputError : ''}`}
                    type="email"
                    value={editEmail}
                    onChange={e => { setEditEmail(e.target.value); setEmailCheck(null) }}
                  />
                  {emailChanged && !editEmailError && (
                    <button className={styles.checkBtn} type="button" onClick={handleCheckEmail}>중복확인</button>
                  )}
                  {editEmailError   && <span className={styles.checkFail}>{editEmailError}</span>}
                  {!editEmailError && emailCheck === 'ok'    && <span className={styles.checkOk}>사용 가능</span>}
                  {!editEmailError && emailCheck === 'taken' && <span className={styles.checkFail}>이미 사용 중</span>}
                </div>
              ) : (
                <span className={styles.infoValue}>{me.email ?? '—'}</span>
              )}
            </div>

            {/* 전화번호 */}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>전화번호</span>
              {editingAccount ? (
                <div className={styles.phoneEditCell}>

                  {/* 국가코드 콤보박스 */}
                  <div className={styles.countryCombo} ref={countryRef}>
                    <div className={styles.countryInputWrap}>
                      {selectedCountry && (
                        <ReactCountryFlag
                          countryCode={selectedCountry.iso}
                          svg
                          className={styles.selectedFlag}
                          style={{ width: '1.3em', height: '1em', marginLeft: '6px', flexShrink: 0 }}
                        />
                      )}
                      <span className={styles.countryPlus}>+</span>
                      <input
                        className={styles.countryCodeInput}
                        type="text"
                        value={countryInput}
                        onChange={e => handleCountryInput(e.target.value)}
                        onFocus={() => setShowCountryDrop(true)}
                        onKeyDown={handleCountryKeyDown}
                        placeholder="82"
                      />
                      <button
                        className={styles.countryDropBtn}
                        type="button"
                        onClick={() => setShowCountryDrop(v => !v)}
                      >▾</button>
                    </div>

                    {showCountryDrop && (
                      <div className={styles.countryDropdown}>
                        {filteredCountries.length === 0 ? (
                          <div className={styles.countryOptionEmpty}>검색 결과 없음</div>
                        ) : (
                          filteredCountries.map(c => (
                            <div
                              key={c.iso}
                              className={`${styles.countryOption} ${selectedCountry?.iso === c.iso ? styles.countryOptionActive : ''}`}
                              onMouseDown={e => { e.preventDefault(); selectCountry(c) }}
                            >
                              <ReactCountryFlag
                                countryCode={c.iso}
                                svg
                                className={styles.countryOptionFlag}
                                style={{ width: '1.3em', height: '1em', flexShrink: 0 }}
                              />
                              <span className={styles.countryOptionCode}>+{c.code}</span>
                              <span className={styles.countryOptionName}>{c.name}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* 전화번호 입력 */}
                  <input
                    className={styles.inlineInput}
                    type="tel"
                    placeholder={editCountryCode === '82' ? '010-0000-0000' : '전화번호 입력'}
                    value={editPhone}
                    onChange={handlePhoneChange}
                  />
                </div>
              ) : (
                <span className={styles.infoValue} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {me.phone
                    ? <>
                        <ReactCountryFlag
                          countryCode={COUNTRY_CODES.find(c => c.code === (me.phone_country ?? '82'))?.iso ?? 'KR'}
                          svg
                          style={{ width: '1.3em', height: '1em' }}
                        />
                        {formatDisplayPhone(me.phone, me.phone_country ?? '82')}
                      </>
                    : '—'
                  }
                </span>
              )}
            </div>

            {accountMsg && <p className={styles.msg}>{accountMsg}</p>}

            {/* 권한 (읽기 전용) */}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>권한</span>
              <span className={`${styles.authorityBadge} ${styles[`auth_${me.role}`]}`}>
                {AUTHORITY_LABEL[me.role] ?? me.role}
              </span>
            </div>

            {/* 역할 — basic 제외 */}
            {roleDisplay && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>역할</span>
                <span className={styles.infoValue}>{roleDisplay}</span>
              </div>
            )}

            {/* OB/YB */}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>구분</span>
              <span className={styles.infoValue}>{me.ob_yb?.toUpperCase() ?? '—'}</span>
            </div>

            {/* 실명 */}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>실명</span>
              <span className={styles.infoValue}>{me.name ?? '—'}</span>
            </div>

            {/* 학번 */}
            <div className={`${styles.infoRow} ${isBasic ? '' : styles.infoRowLast}`}>
              <span className={styles.infoLabel}>학번</span>
              <span className={styles.infoValue}>{me.student_id ?? '—'}</span>
            </div>

            {/* 멤버 신청 — basic 전용 */}
            {isBasic && (
              <>
                <div className={`${styles.infoRow} ${styles.infoRowLast}`}>
                  <span className={styles.infoLabel}>멤버 신청</span>
                  <span className={`${styles.statusBadge} ${styles[`ms_${memberStatus}`]}`}>
                    {MEMBERSHIP_STATUS_LABEL[memberStatus] ?? memberStatus}
                  </span>
                  {(memberStatus === 'none' || memberStatus === 'rejected') && (
                    <button
                      className={styles.applyDropBtn}
                      onClick={() => { setShowApplyForm(v => !v); setProfileMsg(''); setMemberMsg('') }}
                    >
                      {showApplyForm ? '닫기 ▲' : (memberStatus === 'rejected' ? '재신청 ▼' : '신청하기 ▼')}
                    </button>
                  )}
                </div>

                {showApplyForm && (
                  <div className={styles.applyDropdown}>
                    <form className={styles.form} onSubmit={handleProfileSave}>
                      <div className={styles.field}>
                        <label className={styles.label}>실명</label>
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
                      <div className={styles.applyActions}>
                        <button className={styles.saveBtn} type="submit">저장</button>
                        <button
                          className={styles.applyBtn}
                          type="button"
                          onClick={handleMemberRequest}
                          disabled={!me.name || !me.ob_yb}
                        >
                          멤버 신청
                        </button>
                      </div>
                      {memberMsg && <p className={styles.msg}>{memberMsg}</p>}
                    </form>
                    <p className={styles.applyHint}>정보를 저장한 뒤 멤버 신청을 해주세요. 관리자 승인 후 멤버로 활동할 수 있습니다.</p>
                  </div>
                )}

                {memberStatus === 'pending' && (
                  <p className={styles.statusDesc}>관리자가 신청을 검토 중입니다.</p>
                )}
                {memberStatus === 'rejected' && !showApplyForm && (
                  <p className={styles.statusDesc}>신청이 거부됐습니다. 관리자에게 문의하거나 재신청해주세요.</p>
                )}
              </>
            )}
          </section>

          {/* 비밀번호 변경 (예시) */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              비밀번호 변경
              <span className={styles.exampleBadge}>(예시)</span>
            </h2>
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>현재 비밀번호</label>
                <input className={styles.input} type="password" placeholder="현재 비밀번호" disabled />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>새 비밀번호</label>
                <input className={styles.input} type="password" placeholder="새 비밀번호 (8자 이상)" disabled />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>새 비밀번호 확인</label>
                <input className={styles.input} type="password" placeholder="새 비밀번호 재입력" disabled />
              </div>
              <button className={styles.saveBtn} disabled>변경하기</button>
            </div>
          </section>

          {/* 회원 탈퇴 (예시) */}
          <section className={`${styles.section} ${styles.dangerSection}`}>
            <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>
              회원 탈퇴
              <span className={styles.exampleBadge}>(예시)</span>
            </h2>
            <p className={styles.dangerDesc}>
              탈퇴 시 계정과 관련된 모든 데이터가 삭제되며 복구할 수 없습니다.
            </p>
            <button className={styles.dangerBtn} disabled>탈퇴하기</button>
          </section>

        </div>
      )}

      {/* ─── 활동 내역 탭 ─── */}
      {activeTab === 'club' && (
        <div className={styles.tabContent}>

          {/* 내 게시글 */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>내 게시글</h2>
              <button className={styles.moreBtn} onClick={() => setActiveTab('posts')} title="더보기">+</button>
            </div>
            <div className={styles.activityList}>
              {myPosts.length === 0 ? (
                <p className={styles.emptyDesc}>작성한 글이 없습니다.</p>
              ) : myPosts.slice(0, 5).map(p => (
                <Link key={p.id} to={`/board/${p.id}`} className={styles.activityItem}>
                  <div className={styles.activityItemLeft}>
                    <div className={styles.activityItemRow}>
                      <span className={styles.activityTag}>{POST_TYPE_LABEL[p.type]}</span>
                      <span className={styles.activityItemTitle}>{p.title}</span>
                    </div>
                  </div>
                  <div className={styles.activityItemMeta}>
                    <span className={styles.activityItemViews}>조회 {p.views}</span>
                    <span className={styles.activityItemDate}>{p.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 내 댓글 */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>내 댓글</h2>
              <button className={styles.moreBtn} onClick={() => setActiveTab('mycomments')} title="더보기">+</button>
            </div>
            <div className={styles.activityList}>
              {myComments.length === 0 ? (
                <p className={styles.emptyDesc}>작성한 댓글이 없습니다.</p>
              ) : myComments.slice(0, 5).map(c => (
                <Link key={c.id} to={`/board/${c.post_id}`} className={styles.activityItem}>
                  <div className={styles.activityItemLeft}>
                    <div className={styles.activityItemRow}>
                      <span className={styles.activityTag}>{POST_TYPE_LABEL[c.post_type]}</span>
                      <span className={styles.activityItemTitle}>{c.content}</span>
                    </div>
                    <span className={styles.activityItemSub}>└ {c.post_title}</span>
                  </div>
                  <span className={styles.activityItemDate}>{c.created_at}</span>
                </Link>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* ─── 내 게시글 탭 ─── */}
      {activeTab === 'posts' && (() => {
        const totalPostPages = Math.max(1, Math.ceil(myPostsAll.length / PAGE_SIZE))
        const pagedPosts = myPostsAll.slice((postsPage - 1) * PAGE_SIZE, postsPage * PAGE_SIZE)
        return (
          <div className={styles.tabContent}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>내 게시글</h2>
              <div className={styles.activityList}>
                {myPostsAll.length === 0 ? (
                  <p className={styles.emptyDesc}>작성한 글이 없습니다.</p>
                ) : pagedPosts.map(p => (
                  <Link key={p.id} to={`/board/${p.id}`} className={styles.activityItem}>
                    <div className={styles.activityItemLeft}>
                      <div className={styles.activityItemRow}>
                        <span className={styles.activityTag}>{POST_TYPE_LABEL[p.type]}</span>
                        <span className={styles.activityItemTitle}>{p.title}</span>
                      </div>
                    </div>
                    <div className={styles.activityItemMeta}>
                      <span className={styles.activityItemViews}>조회 {p.views}</span>
                      <span className={styles.activityItemDate}>{p.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            <div className={styles.paginationRow}>
              <Pagination page={postsPage} totalPages={totalPostPages} onPageChange={setPostsPage} />
            </div>
          </div>
        )
      })()}

      {/* ─── 내 댓글 탭 ─── */}
      {activeTab === 'mycomments' && (() => {
        const totalCommentPages = Math.max(1, Math.ceil(myCommentsAll.length / PAGE_SIZE))
        const pagedComments = myCommentsAll.slice((commentsPage - 1) * PAGE_SIZE, commentsPage * PAGE_SIZE)
        return (
          <div className={styles.tabContent}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>내 댓글</h2>
              <div className={styles.activityList}>
                {myCommentsAll.length === 0 ? (
                  <p className={styles.emptyDesc}>작성한 댓글이 없습니다.</p>
                ) : pagedComments.map(c => (
                  <Link key={c.id} to={`/board/${c.post_id}`} className={styles.activityItem}>
                    <div className={styles.activityItemLeft}>
                      <div className={styles.activityItemRow}>
                        <span className={styles.activityTag}>{POST_TYPE_LABEL[c.post_type]}</span>
                        <span className={`${styles.activityItemTitle} ${styles.activityItemClamp}`}>{c.content}</span>
                      </div>
                      <span className={styles.activityItemSub}>└ {c.post_title}</span>
                    </div>
                    <span className={styles.activityItemDate}>{c.created_at}</span>
                  </Link>
                ))}
              </div>
            </section>
            <div className={styles.paginationRow}>
              <Pagination page={commentsPage} totalPages={totalCommentPages} onPageChange={setCommentsPage} />
            </div>
          </div>
        )
      })()}

    </div>
  )
}
