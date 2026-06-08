import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import styles from './Signup.module.css'

export default function KakaoSignupForm() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [kakaoInfo, setKakaoInfo] = useState(null)
  const [username, setUsername] = useState('')
  const [marketingAgreed, setMarketingAgreed] = useState(false)
  const [usernameChecked, setUsernameChecked] = useState(false)
  const [usernameCheckMsg, setUsernameCheckMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // sessionStorage에서 카카오 정보 가져오기
    const stored = sessionStorage.getItem('kakao_info')
    if (!stored) {
      navigate('/signup')
      return
    }
    setKakaoInfo(JSON.parse(stored))
  }, [navigate])

  const usernameValid = /^[a-zA-Z0-9_]{5,15}$/.test(username)
  const usernameError = username && !usernameValid
    ? '영문 대/소문자, 숫자, _ 만 사용 가능하며 5~15자여야 합니다.'
    : ''

  async function handleCheckUsername() {
    if (!usernameValid) return
    setUsernameCheckMsg('')
    try {
      const res = await fetch(
        `${API_BASE}/api/auth/check-username?username=${encodeURIComponent(username)}`
      )
      const data = await res.json()
      setUsernameChecked(data.available)
      setUsernameCheckMsg(data.available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.')
    } catch {
      setUsernameCheckMsg('확인에 실패했습니다.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!usernameValid) {
      setError('아이디 형식을 확인해주세요.')
      return
    }
    if (!usernameChecked) {
      setError('아이디 중복 확인을 해주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/kakao-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kakao_id: kakaoInfo.kakao_id,
          email: kakaoInfo.email,
          username,
          name: kakaoInfo.name,
          phone: kakaoInfo.phone_number,
          marketingAgreed,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message)
        return
      }

      login(data.token, false)
      sessionStorage.removeItem('kakao_info')
      navigate('/')
    } catch {
      setError('서버에 연결할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!kakaoInfo) return null

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>회원가입</h1>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* 카카오 정보 (읽기전용) */}
          <div className={styles.field}>
            <label className={styles.label}>이메일</label>
            <input
              className={styles.input}
              type="email"
              value={kakaoInfo.email}
              disabled
              readOnly
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>이름</label>
            <input
              className={styles.input}
              type="text"
              value={kakaoInfo.name}
              disabled
              readOnly
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>휴대폰번호</label>
            <input
              className={styles.input}
              type="tel"
              value={kakaoInfo.phone_number}
              disabled
              readOnly
            />
          </div>

          {/* 사용자 입력 */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="username">
                아이디 <span className={styles.required}>(필수)</span>
              </label>
              {usernameCheckMsg
                ? <span className={usernameChecked ? styles.successText : styles.errorText}>{usernameCheckMsg}</span>
                : null
              }
            </div>
            <div className={styles.verifyRow}>
              <input
                id="username"
                className={`${styles.input} ${usernameChecked ? styles.inputSuccess : (usernameError ? styles.inputError : '')}`}
                type="text"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={e => {
                  setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15))
                  setUsernameChecked(false)
                  setUsernameCheckMsg('')
                }}
                autoComplete="username"
                required
              />
              {usernameValid && !usernameChecked && (
                <button
                  type="button"
                  className={`btn btn-secondary ${styles.verifyBtn}`}
                  onClick={handleCheckUsername}
                >
                  중복확인
                </button>
              )}
            </div>
            {usernameError && <span className={styles.errorText}>{usernameError}</span>}
          </div>

          {/* 메일 동의 */}
          <label className={styles.checkboxLabel}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={marketingAgreed}
              onChange={e => setMarketingAgreed(e.target.checked)}
            />
            광고성 메일 수신 동의 (선택)
          </label>

          {error && <p className={styles.errorText}>{error}</p>}

          <button className={styles.submitButton} type="submit" disabled={loading || !usernameChecked}>
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  )
}
