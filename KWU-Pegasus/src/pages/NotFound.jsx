import { useNavigate } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
      <p className={styles.desc}>
        주소가 잘못되었거나 존재하지 않는 페이지입니다.
      </p>
      <button className={styles.homeButton} onClick={() => navigate('/')}>
        홈으로 이동
      </button>
    </div>
  )
}
