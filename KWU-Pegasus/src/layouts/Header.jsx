import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL, STAFF_TYPE_LABEL } from '../lib/constants'
import styles from './Header.module.css'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const isAdmin = user && ['manager', 'staff', 'root'].includes(user.role)

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/" className={styles.logoLink}>
          <img src="/kwu-pegasus.svg" alt="KWU Pegasus" className={styles.logoImage} />
          <span className={styles.logo}>KWU Pegasus</span>
        </Link>
      </div>

      <nav className={styles.center}>
        <Link className={styles.navItem} to="/">홈</Link>
        <Link className={styles.navItem} to="/schedule">일정</Link>
        <Link className={styles.navItem} to="/roster">선수단</Link>
        <Link className={styles.navItem} to="/notice">공지사항</Link>
        <Link className={styles.navItem} to="/board">게시판</Link>

        {user && (
          <Link className={styles.navItem} to="/mypage">마이페이지</Link>
        )}
        {isAdmin && (
          <Link className={styles.navItemAdmin} to="/admin">관리자</Link>
        )}
      </nav>

      <div className={styles.right}>
        {user ? (
          <>
            <span className={styles.roleBadge}>
              {user.role === 'staff' && user.staff_type
                ? STAFF_TYPE_LABEL[user.staff_type] ?? user.staff_type
                : ROLE_LABEL[user.role] ?? user.role}
            </span>
            <span className={styles.username}>{user.username}</span>
            <button className={styles.logoutButton} onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.loginButton}>로그인</Link>
            <Link to="/signup" className={styles.signupButton}>회원가입</Link>
          </>
        )}
      </div>
    </header>
  )
}
