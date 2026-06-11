import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import styles from './Signup.module.css'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [email, setEmail] = useState('')
  const [usernameChecked, setUsernameChecked] = useState(false)
  const [usernameCheckMsg, setUsernameCheckMsg] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [codeMsg, setCodeMsg] = useState('')
  const [codeSending, setCodeSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(null)
  const [marketingAgreed, setMarketingAgreed] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const usernameValid = /^[a-zA-Z0-9_]{5,15}$/.test(username)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const emailError = email && !emailValid ? '올바른 이메일 형식이 아닙니다.' : ''

  const getPasswordError = () => {
    if (!password) return ''
    if (password.length < 8) return '비밀번호가 너무 짧습니다.'

    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*()_\-=[\]{};:'",.<>?/\\|]/.test(password)

    const missing = []
    if (!hasLetter) missing.push('영문')
    if (!hasNumber) missing.push('숫자')
    if (!hasSpecial) missing.push('특수문자')

    if (missing.length > 0) {
      return `${missing.join(', ')}${missing.length === 1 ? '이' : '가'} 포함되어야 합니다.`
    }
    return ''
  }

  const passwordError = getPasswordError()
  const passwordValid = password && !passwordError

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
    if (!emailValid) {
      setError('이메일 형식을 확인해주세요.')
      return
    }
    if (!emailVerified) {
      setError('이메일 인증을 완료해주세요.')
      return
    }
    if (!passwordValid) {
      setError('비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (privacyAgreed !== true) {
      setError('개인정보 수집·이용에 동의해주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username, password, email,
          marketingAgreed: marketingAgreed === true,
        }),
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
          <p className={styles.signupSuccessMsg}>
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
          카카오 간편 회원가입
        </button>

        <div className={styles.divider}>또는</div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="username">
                아이디 <span className={styles.required}>(필수)</span>
                <span className={styles.tooltipWrap}>
                  <span className={styles.tooltipIcon}>?</span>
                  <span className={styles.tooltipBox}>
                    영문 대/소문자, 숫자, 언더 바(_)로 구성될 수 있으며<br />
                    5자 이상 15자 이하로 구성되어야 합니다.
                  </span>
                </span>
              </label>
              {usernameCheckMsg
                ? <span className={usernameChecked ? styles.successText : styles.errorText}>{usernameCheckMsg}</span>
                : (username.length > 0 && username.length < 5)
                  ? <span className={styles.errorText}>아이디가 너무 짧습니다.</span>
                  : null
              }
            </div>
            <div className={styles.verifyRow}>
              <input
                id="username"
                className={`${styles.input} ${usernameChecked ? styles.inputSuccess : (username.length > 0 && username.length < 5) ? styles.inputError : ''}`}
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
              {usernameValid && (
                <button
                  type="button"
                  className={`btn btn-secondary ${styles.verifyBtn}`}
                  onClick={async () => {
                    setUsernameCheckMsg('')
                    try {
                      const res = await fetch(`${API_BASE}/api/auth/check-username?username=${encodeURIComponent(username)}`)
                      const data = await res.json()
                      if (data.available) {
                        setUsernameChecked(true)
                        setUsernameCheckMsg('사용 가능한 아이디입니다.')
                      } else {
                        setUsernameChecked(false)
                        setUsernameCheckMsg('이미 사용 중인 아이디입니다.')
                      }
                    } catch {
                      setUsernameCheckMsg('확인에 실패했습니다.')
                    }
                  }}
                >
                  중복확인
                </button>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="email">이메일 <span className={styles.required}>(필수)</span></label>
              {codeMsg && (
                <span className={emailVerified || (codeSent && !emailError) ? styles.successText : styles.errorText}>
                  {codeMsg}
                </span>
              )}
              {!codeMsg && emailError && <span className={styles.errorText}>{emailError}</span>}
            </div>
            <div className={styles.verifyRow}>
              <input
                id="email"
                className={`${styles.input} ${emailError ? styles.inputError : ''} ${emailVerified ? styles.inputSuccess : ''}`}
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={e => {
                  const val = e.target.value
                  setEmail(val)
                  if (verifiedEmail && val !== verifiedEmail) {
                    setEmailVerified(false)
                    setCodeSent(false)
                    setEmailCode('')
                    setCodeMsg('이메일이 변경되었습니다. 다시 인증해주세요.')
                  }
                }}
                autoComplete="email"
                required
              />
              {emailValid && (
                <button
                  type="button"
                  className={`btn btn-secondary ${styles.verifyBtn}`}
                  disabled={codeSending}
                  onClick={async () => {
                    setCodeSending(true)
                    setCodeMsg('')
                    try {
                      // 중복 확인
                      const checkRes = await fetch(
                        `${API_BASE}/api/auth/check-email?email=${encodeURIComponent(email)}`
                      )
                      const checkData = await checkRes.json()

                      if (!checkData.available) {
                        setCodeMsg('이미 사용 중인 이메일입니다.')
                        setCodeSending(false)
                        return
                      }

                      // 인증번호 발송
                      const res = await fetch(`${API_BASE}/api/auth/send-email-code`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                      })
                      const data = await res.json()
                      setCodeMsg(data.message)
                      if (res.ok) {
                        setCodeSent(true)
                        setEmailVerified(false)
                        setEmailCode('')
                      } else {
                        setCodeSent(false)
                      }
                    } catch {
                      setCodeMsg('발송에 실패했습니다.')
                      setCodeSent(false)
                    }
                    setCodeSending(false)
                  }}
                >
                  {codeSending ? '발송 중…' : codeSent ? '재발송' : '발송'}
                </button>
              )}
            </div>
          </div>

          {emailValid && codeSent && (
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="emailCode">이메일 인증번호</label>
                {codeMsg && (
                  <span className={emailVerified ? styles.successText : styles.errorText}>
                    {codeMsg}
                  </span>
                )}
              </div>
              <div className={styles.verifyRow}>
                <input
                  id="emailCode"
                  className={`${styles.input} ${emailVerified ? styles.inputSuccess : ''}`}
                  type="text"
                  placeholder="인증번호 6자리"
                  value={emailCode}
                  onChange={e => setEmailCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  inputMode="numeric"
                />
                {!emailVerified && (
                  <button
                    type="button"
                    className={`btn btn-secondary ${styles.verifyBtn}`}
                    disabled={emailCode.length !== 6}
                    onClick={async () => {
                      setCodeMsg('')
                      try {
                        const res = await fetch(`${API_BASE}/api/auth/verify-email-code`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email, code: emailCode }),
                        })
                        const data = await res.json()
                        setCodeMsg(data.message)
                        if (res.ok) { setEmailVerified(true); setVerifiedEmail(email) }
                      } catch {
                        setCodeMsg('인증에 실패했습니다.')
                      }
                    }}
                  >
                    인증
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">비밀번호 <span className={styles.required}>(필수)</span></label>
              {passwordError && <span className={styles.errorText}>{passwordError}</span>}
            </div>
            <div className={styles.passwordRow}>
              <input
                id="password"
                className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPassword ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="passwordConfirm">비밀번호 재입력 <span className={styles.required}>(필수)</span></label>
            <div className={styles.passwordRow}>
              <input
                id="passwordConfirm"
                className={`${styles.input} ${passwordConfirm && password !== passwordConfirm ? styles.inputError : ''}`}
                type={showPasswordConfirm ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력하세요"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                tabIndex={-1}
                aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPasswordConfirm ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            {passwordConfirm && password !== passwordConfirm && (
              <span className={styles.errorText}>비밀번호가 일치하지 않습니다.</span>
            )}
          </div>

          <div className={styles.privacySection}>
            <p className={styles.privacyTitle}>개인정보 수집·이용 동의 <span className={styles.required}>(필수)</span></p>
            <div className={styles.privacyBox}>
              <p className={styles.privacyHeading}>1. 수집 항목</p>
              <p>아이디, 이메일, 비밀번호(암호화 저장), 전화번호</p>

              <p className={styles.privacyHeading}>2. 수집 목적</p>
              <p>회원 식별 및 로그인 서비스 제공, 동아리 멤버 자격 확인</p>
              <p>아이디·이메일·전화번호는 동아리 활동 안내, 공지 전달, 연락 등 동아리 운영 목적으로 활용될 수 있습니다.</p>

              <p className={styles.privacyHeading}>3. 보유 및 이용 기간</p>
              <p>회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다.</p>

              <p className={styles.privacyHeading}>4. 제3자 제공</p>
              <p>수집된 개인정보는 제3자에게 제공하지 않습니다.</p>

              <p className={styles.privacyHeading}>5. 동의 거부 시 불이익</p>
              <p>동의를 거부할 권리가 있으나, 거부 시 서비스 이용이 제한됩니다.</p>
            </div>

            <div className={styles.consentGroup}>
              <label className={`${styles.consentOption} ${privacyAgreed === true ? styles.consentSelected : ''}`}>
                <input
                  type="radio"
                  name="privacy"
                  className={styles.consentInput}
                  checked={privacyAgreed === true}
                  onChange={() => setPrivacyAgreed(true)}
                />
                동의합니다
              </label>
              <label className={`${styles.consentOption} ${privacyAgreed === false ? styles.consentRefused : ''}`}>
                <input
                  type="radio"
                  name="privacy"
                  className={styles.consentInput}
                  checked={privacyAgreed === false}
                  onChange={() => setPrivacyAgreed(false)}
                />
                거부합니다
              </label>
            </div>
          </div>

          <div className={styles.privacySection}>
            <p className={styles.privacyTitle}>광고성 메일 수신 동의 <span className={styles.optional}>(선택)</span></p>
            <div className={styles.privacyBox}>
              <p className={styles.privacyHeading}>수신 목적</p>
              <p>동아리 이벤트, 공지, 경기 일정 등 동아리 활동과 관련된 소식을 이메일로 안내하기 위해 메일을 발송할 수 있습니다.</p>
              <p className={styles.privacyHeading}>수신 거부</p>
              <p>동의 후에도 언제든지 마이페이지에서 수신을 거부할 수 있습니다.</p>
            </div>

            <div className={styles.consentGroup}>
              <label className={`${styles.consentOption} ${marketingAgreed === true ? styles.consentSelected : ''}`}>
                <input
                  type="radio"
                  name="marketing"
                  className={styles.consentInput}
                  checked={marketingAgreed === true}
                  onChange={() => setMarketingAgreed(true)}
                />
                동의합니다
              </label>
              <label className={`${styles.consentOption} ${marketingAgreed === false ? styles.consentRefused : ''}`}>
                <input
                  type="radio"
                  name="marketing"
                  className={styles.consentInput}
                  checked={marketingAgreed === false}
                  onChange={() => setMarketingAgreed(false)}
                />
                거부합니다
              </label>
            </div>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button className={styles.submitButton} type="submit" disabled={loading}>
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <p className={styles.footer}>
          이미 계정이 있으신가요?<br /><Link to="/login" className={styles.link}>로그인</Link>
        </p>
      </div>
    </div>
  )
}
