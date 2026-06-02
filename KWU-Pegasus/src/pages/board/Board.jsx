import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

function extractUsername(author) {
  return /^([^(]+)/.exec(author)?.[1]?.trim() ?? author
}
import { API_BASE } from '../../lib/api'
import { POST_TYPE_LABEL } from '../../lib/constants'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/Pagination'
import styles from './Board.module.css'

const PAGE_SIZE = 15

const TYPE_STYLE = {
  notice:          styles.tagNotice,
  event:           styles.tagEvent,
  game:            styles.tagGame,
  family_occasion: styles.tagFamily,
  normal:          styles.tagPost,
}

const MEMBER_ROLES = ['member', 'manager', 'staff', 'root']

export default function Board() {
  const navigate  = useNavigate()
  const { user } = useAuth()
  const canWrite  = user && MEMBER_ROLES.includes(user.role)
  const canRead   = user && MEMBER_ROLES.includes(user.role)

  function handlePostClick(e, id) {
    if (!canRead) {
      e.preventDefault()
      navigate('/unauthorized')
    }
  }

  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch(`${API_BASE}/api/posts`)
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
  }, [])

  const pinned = posts.filter(p => p.isPinned)
  const normal = posts.filter(p => !p.isPinned)

  const totalPages = Math.max(1, Math.ceil(normal.length / PAGE_SIZE))
  const paged = normal.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handlePageChange(p) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>게시판</h1>

      <div className={styles.list}>
        {pinned.map(p => (
          <Link key={p.id} to={`/board/${p.id}`} className={`${styles.row} ${styles.rowPinned}`} onClick={e => handlePostClick(e, p.id)}>
            <div className={styles.rowLeft}>
              <span className={styles.pinIcon}>📌</span>
              <span className={`${styles.tag} ${TYPE_STYLE[p.type]}`}>
                {POST_TYPE_LABEL[p.type]}
              </span>
              <span className={styles.rowTitle}>{p.title}</span>
            </div>
            <div className={styles.rowMeta}>
              <span
                className={styles.authorLink}
                onClick={e => { e.preventDefault(); const un = extractUsername(p.author); navigate(un === user?.username ? '/mypage' : `/user/${un}`) }}
              >{p.author}</span>
              <span>{p.date}</span>
              <span>조회 {p.views}</span>
            </div>
          </Link>
        ))}

        {pinned.length > 0 && <div className={styles.divider} />}

        {paged.map(p => (
          <Link key={p.id} to={`/board/${p.id}`} className={styles.row} onClick={e => handlePostClick(e, p.id)}>
            <div className={styles.rowLeft}>
              <span className={`${styles.tag} ${TYPE_STYLE[p.type]}`}>
                {POST_TYPE_LABEL[p.type]}
              </span>
              <span className={styles.rowTitle}>{p.title}</span>
            </div>
            <div className={styles.rowMeta}>
              <span
                className={styles.authorLink}
                onClick={e => { e.preventDefault(); const un = extractUsername(p.author); navigate(un === user?.username ? '/mypage' : `/user/${un}`) }}
              >{p.author}</span>
              <span>{p.date}</span>
              <span>조회 {p.views}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.footer}>
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        {canWrite && (
          <Link to="/board/write" className={styles.writeButton}>글쓰기</Link>
        )}
      </div>
    </div>
  )
}
