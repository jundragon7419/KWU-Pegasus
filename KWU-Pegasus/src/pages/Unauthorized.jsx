import { Link } from 'react-router-dom'
import styles from './Unauthorized.module.css'

export default function Unauthorized() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>

        <h1 className={styles.title}>로그인 후 사용해주세요</h1>
        <p className={styles.description}>이 페이지는 로그인한 회원만 이용할 수 있습니다.</p>

        <Link to="/login" className={styles.loginButton}>로그인하기</Link>

        <p className={styles.signupPrompt}>
          계정이 없나요?{' '}
          <Link to="/signup" className={styles.signupLink}>회원가입</Link>
        </p>
      </div>
    </div>
  )
}
