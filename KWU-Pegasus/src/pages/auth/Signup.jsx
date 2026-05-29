import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import styles from './Signup.module.css'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const usernameValid = /^[a-zA-Z0-9_]{1,15}$/.test(username)
  const usernameError = username && !usernameValid
    ? '영문 대/소문자, 숫자, _ 만 · 최대 15자'
    : ''

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const emailError = email && !emailValid ? '올바른 이메일 형식이 아닙니다.' : ''

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!usernameValid) {
      setError('아이디 형식을 확인해주세요.')
      return
    }
    if (!emailValid) {
      setError('이메일 형식을 확인해주세요.')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message)
        return
      }

      setSuccess(true)
    } catch {
      setError('서버에 연결할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>회원가입 완료</h1>
          <p className={styles.successText}>
            회원가입이 완료됐습니다.<br />
            바로 로그인할 수 있습니다.
          </p>
          <Link to="/login" className={styles.submitButton} style={{ textAlign: 'center', textDecoration: 'none', display: 'block', marginTop: 0 }}>
            로그인 페이지로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>회원가입</h1>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              아이디
              <span className={styles.tooltipWrap}>
                <span className={styles.tooltipIcon}>?</span>
                <span className={styles.tooltipBox}>
                  영문 대/소문자, 숫자, 언더 바(_)로 구성될 수 있으며<br />
                  15자 이하로 구성되어야 합니다.
                </span>
              </span>
            </label>
            <input
              id="username"
              className={`${styles.input} ${usernameError ? styles.inputError : ''}`}
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15))}
              autoComplete="username"
              required
            />
            {usernameError && <span className={styles.errorText}>{usernameError}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">이메일</label>
            <input
              id="email"
              className={`${styles.input} ${emailError ? styles.inputError : ''}`}
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            {emailError && <span className={styles.errorText}>{emailError}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">비밀번호</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="passwordConfirm">비밀번호 재입력</label>
            <input
              id="passwordConfirm"
              className={`${styles.input} ${passwordConfirm && password !== passwordConfirm ? styles.inputError : ''}`}
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
            {passwordConfirm && password !== passwordConfirm && (
              <span className={styles.errorText}>비밀번호가 일치하지 않습니다.</span>
            )}
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button className={styles.submitButton} type="submit" disabled={loading}>
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <p className={styles.footer}>
          이미 계정이 있으신가요? <Link to="/login" className={styles.link}>로그인</Link>
        </p>
      </div>
    </div>
  )
}
