import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Unauthorized.module.css'

export default function Unauthorized() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h1 className={styles.title}>로그인이 필요합니다</h1>
          <p className={styles.description}>이 페이지는 로그인한 회원만 이용할 수 있습니다.</p>
          <Link to="/login" className={styles.primaryButton}>로그인하기</Link>
          <p className={styles.signupPrompt}>
            계정이 없나요?{' '}
            <Link to="/signup" className={styles.signupLink}>회원가입</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className={styles.title}>접근 권한이 없습니다</h1>
        <p className={styles.description}>이 페이지를 이용하려면 더 높은 권한이 필요합니다.</p>
        <button className={styles.primaryButton} onClick={() => navigate(-1)}>이전 페이지로</button>
        <p className={styles.signupPrompt}>
          <Link to="/" className={styles.signupLink}>홈으로 이동</Link>
        </p>
      </div>
    </div>
  )
}
