import { useRef, useEffect, useCallback, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL, STAFF_TYPE_LABEL, isManagerRole } from '../lib/constants'
import styles from './Header.module.css'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const navRef = useRef(null)
  const indicatorRef = useRef(null)

  const isAdmin = isManagerRole(user)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  const updateIndicator = useCallback((instant = false) => {
    const nav = navRef.current
    const indicator = indicatorRef.current
    if (!nav || !indicator) return

    const activeLink = nav.querySelector(
      `.${styles.navItemActive}, .${styles.navItemAdminActive}`
    )
    if (!activeLink) {
      indicator.style.opacity = '0'
      return
    }

    const navRect = nav.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()

    indicator.style.transition = instant
      ? 'none'
      : 'left 0.25s ease, width 0.25s ease, opacity 0.15s ease'
    indicator.style.left    = `${linkRect.left - navRect.left}px`
    indicator.style.width   = `${linkRect.width}px`
    indicator.style.opacity = '1'
  }, [])

  // 경로 변경 시 애니메이션
  useEffect(() => {
    const raf = requestAnimationFrame(() => updateIndicator(false))
    return () => cancelAnimationFrame(raf)
  }, [location.pathname, updateIndicator])

  // 최초 접속·리로딩 시 폰트 로딩 완료 후 즉시 위치 설정
  useEffect(() => {
    document.fonts.ready.then(() => updateIndicator(true))
  }, [updateIndicator])

  function handleLogout() {
    logout()
    navigate('/')
  }

  const navCls = ({ isActive }) =>
    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/" className={styles.logoLink}>
          <img src="/kwu-pegasus.svg" alt="KWU Pegasus" className={styles.logoImage} />
          <span className={styles.logo}>KWU Pegasus</span>
        </Link>
      </div>

      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="메뉴"
      >
        <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerOpen : ''}`} />
        <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerOpen : ''}`} />
        <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerOpen : ''}`} />
      </button>

      <nav ref={navRef} className={styles.center}>
        <NavLink end className={navCls} to="/">홈</NavLink>
        <NavLink className={navCls} to="/schedule">일정</NavLink>
        <NavLink className={navCls} to="/roster">선수단</NavLink>
        <NavLink className={navCls} to="/records">기록</NavLink>
        {user && (
          <NavLink className={navCls} to="/board">게시판</NavLink>
        )}
        {user && (
          <NavLink className={navCls} to="/mypage">마이페이지</NavLink>
        )}
        {isAdmin && (
          <NavLink
            className={({ isActive }) =>
              `${styles.navItemAdmin} ${isActive ? styles.navItemAdminActive : ''}`
            }
            to="/admin"
          >
            관리자
          </NavLink>
        )}
        <div ref={indicatorRef} className={styles.indicator} />
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
            {location.pathname !== '/login' && (
              <Link to="/login" className={styles.loginButton}>로그인</Link>
            )}
            {location.pathname !== '/signup' && (
              <Link to="/signup" className={styles.signupButton}>회원가입</Link>
            )}
          </>
        )}
      </div>

      {/* 모바일 블러 오버레이 */}
      {menuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMenuOpen(false)} />
      )}

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <NavLink end className={navCls} to="/">홈</NavLink>
          <NavLink className={navCls} to="/schedule">일정</NavLink>
          <NavLink className={navCls} to="/roster">선수단</NavLink>
          <NavLink className={navCls} to="/records">기록</NavLink>
          {user && <NavLink className={navCls} to="/board">게시판</NavLink>}
          {user && <NavLink className={navCls} to="/mypage">마이페이지</NavLink>}
          {isAdmin && (
            <NavLink
              className={({ isActive }) =>
                `${styles.navItemAdmin} ${isActive ? styles.navItemAdminActive : ''}`
              }
              to="/admin"
            >관리자</NavLink>
          )}
          <div className={styles.mobileMenuDivider} />
          {user ? (
            <div className={styles.mobileMenuAuth}>
              <div className={styles.mobileMenuUser}>
                <span className={styles.roleBadge}>
                  {user.role === 'staff' && user.staff_type
                    ? STAFF_TYPE_LABEL[user.staff_type] ?? user.staff_type
                    : ROLE_LABEL[user.role] ?? user.role}
                </span>
                <span className={styles.username}>{user.username}</span>
              </div>
              <button className={styles.logoutButton} onClick={handleLogout}>로그아웃</button>
            </div>
          ) : (
            <div className={styles.mobileMenuAuth}>
              <div className={styles.mobileMenuUser} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/login" className={styles.loginButton}>로그인</Link>
                <Link to="/signup" className={styles.signupButton}>회원가입</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
