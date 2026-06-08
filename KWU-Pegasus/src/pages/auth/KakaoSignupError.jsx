import { useNavigate } from 'react-router-dom'
import styles from './Signup.module.css'

export default function KakaoSignupError() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>회원가입 불가</h1>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p className={styles.errorText} style={{ fontSize: '1rem', marginBottom: '12px' }}>
            ⚠️ 이미 가입된 이메일입니다.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6' }}>
            해당 이메일로는 이미 계정이 존재합니다.<br />
            다른 이메일로 가입하거나 기존 계정으로 로그인해주세요.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <button
            className={styles.submitButton}
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
          <button
            className={styles.submitButton}
            style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-100)' }}
            onClick={() => navigate('/signup')}
          >
            다른 방법으로 회원가입
          </button>
        </div>
      </div>
    </div>
  )
}
