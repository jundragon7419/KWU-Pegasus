import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import styles from './Login.module.css'

const KAKAO_APP_KEY = '410636bf5b4af39ef7954bc6e61d58d2' // TODO: .env에서 로드

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [autoLogin, setAutoLogin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // 카카오 SDK 로드
    const script = document.createElement('script')
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_APP_KEY)
      }
    }
  }, [])

  async function handleKakaoLogin() {
    if (!window.Kakao) {
      setError('카카오 SDK를 불러올 수 없습니다.')
      return
    }

    window.Kakao.Auth.login({
      success: async (authObj) => {
        try {
          // 카카오 사용자 정보 조회
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: async (res) => {
              // 서버에 카카오 정보 전송
              const kakaoLoginRes = await fetch(`${API_BASE}/api/auth/kakao-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  kakao_id: res.id,
                  email: res.kakao_account?.email,
                  nickname: res.kakao_account?.profile?.nickname,
                }),
              })
              const data = await kakaoLoginRes.json()

              if (!kakaoLoginRes.ok) {
                setError(data.message)
                return
              }

              login(data.token, autoLogin)
              navigate('/')
            },
            fail: () => {
              setError('카카오 사용자 정보를 불러올 수 없습니다.')
            },
          })
        } catch {
          setError('로그인 처리 중 오류가 발생했습니다.')
        }
      },
      fail: () => {
        setError('카카오 로그인이 취소되었습니다.')
      },
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message)
        return
      }

      login(data.token, autoLogin)
      navigate('/')
    } catch {
      setError('서버에 연결할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>로그인</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">아이디</label>
            <input
              id="username"
              className={styles.input}
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
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
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <label className={styles.checkboxLabel}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={autoLogin}
              onChange={e => setAutoLogin(e.target.checked)}
            />
            자동 로그인
          </label>

          <button className={styles.submitButton} type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <button
            className={styles.kakaoButton}
            type="button"
            disabled
            title="차후 추가 예정"
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          >
            <svg className={styles.kakaoIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 5.58 2 10c0 2.54 1.51 4.78 3.87 6.04V22l3.89-2.15c.86.17 1.79.26 2.75.26 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
            </svg>
            카카오 로그인
          </button>
        </form>

        <p className={styles.footer}>
          계정이 없으신가요?<br /><Link to="/signup" className={styles.link}>회원가입</Link>
        </p>
      </div>
    </div>
  )
}
