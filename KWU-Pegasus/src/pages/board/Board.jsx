import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import Pagination from '../../components/Pagination'
import styles from './Board.module.css'

const PAGE_SIZE = 10

export default function Board() {
  const [posts, setPosts] = useState([])
  const [pinnedNotices, setPinnedNotices] = useState([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch(`${API_BASE}/api/posts`)
      .then(r => r.json())
      .then(data => setPosts(data))

    fetch(`${API_BASE}/api/notices`)
      .then(r => r.json())
      .then(data => setPinnedNotices(data.filter(n => n.isPinned)))
  }, [])

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  const paged = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>게시판</h1>

      <div className={styles.list}>
        {pinnedNotices.map(n => (
          <Link key={n.id} to={`/notice/${n.id}`} className={`${styles.row} ${styles.rowPinned}`}>
            <div className={styles.rowLeft}>
              <span className={styles.pinIcon}>📌</span>
              <span className={`${styles.tag} ${styles.tagNotice}`}>공지</span>
              <span className={styles.rowTitle}>{n.title}</span>
            </div>
            <div className={styles.rowMeta}>
              <span>{n.author}</span>
              <span>{n.date}</span>
              <span>조회 {n.views}</span>
            </div>
          </Link>
        ))}

        {pinnedNotices.length > 0 && <div className={styles.divider} />}

        {paged.map(p => (
          <Link key={p.id} to={`/board/${p.id}`} className={styles.row}>
            <div className={styles.rowLeft}>
              <span className={styles.rowTitle}>{p.title}</span>
            </div>
            <div className={styles.rowMeta}>
              <span>{p.author}</span>
              <span>{p.date}</span>
              <span>조회 {p.views}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.footer}>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        <Link to="/board/write" className={styles.writeButton}>글쓰기</Link>
      </div>
    </div>
  )
}
