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
  const [privacyAgreed, setPrivacyAgreed] = useState(null)
  const [marketingAgreed, setMarketingAgreed] = useState(null)
  const [marketingChannels, setMarketingChannels] = useState({ email: false, sms: false, kakao: false })

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
    if (privacyAgreed !== true) {
      setError('개인정보 수집·이용에 동의해주세요.')
      return
    }
    if (marketingAgreed === true && !Object.values(marketingChannels).some(Boolean)) {
      setError('수신을 원하는 채널을 하나 이상 선택해주세요.')
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
          marketingChannels: marketingAgreed === true ? marketingChannels : null,
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
              아이디 <span className={styles.required}>(필수)</span>
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
            <label className={styles.label} htmlFor="email">이메일 <span className={styles.required}>(필수)</span></label>
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
            <label className={styles.label} htmlFor="password">비밀번호 <span className={styles.required}>(필수)</span></label>
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
            <label className={styles.label} htmlFor="passwordConfirm">비밀번호 재입력 <span className={styles.required}>(필수)</span></label>
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
            <p className={styles.privacyTitle}>광고성 메시지 수신 동의 <span className={styles.optional}>(선택)</span></p>
            <div className={styles.privacyBox}>
              <p className={styles.privacyHeading}>수신 목적</p>
              <p>동아리 이벤트, 공지, 경기 일정 등 동아리 활동과 관련된 소식을 안내하기 위해 메시지를 발송할 수 있습니다.</p>
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

            {marketingAgreed === true && (
              <div className={styles.channelGroup}>
                <p className={styles.channelLabel}>수신 채널 선택 <span className={styles.required}>(1개 이상)</span></p>
                <div className={styles.channelList}>
                  {[
                    { key: 'email', label: '이메일' },
                    { key: 'sms',   label: 'SMS 문자' },
                    { key: 'kakao', label: '카카오톡' },
                  ].map(({ key, label }) => (
                    <label key={key} className={`${styles.channelOption} ${marketingChannels[key] ? styles.channelSelected : ''}`}>
                      <input
                        type="checkbox"
                        className={styles.consentInput}
                        checked={marketingChannels[key]}
                        onChange={e => setMarketingChannels(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}
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
