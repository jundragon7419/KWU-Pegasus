import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../lib/api'
import Pagination from '../components/Pagination'
import styles from './Notice.module.css'

const PAGE_SIZE = 10

const CATEGORY_LABEL = { notice: '공지', event: '행사', game: '경기' }
const CATEGORY_STYLE = { notice: styles.tagNotice, event: styles.tagEvent, game: styles.tagGame }

export default function Notice() {
  const [notices, setNotices] = useState([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch(`${API_BASE}/api/notices`)
      .then(r => r.json())
      .then(data => setNotices(data))
  }, [])

  const pinned = notices.filter(n => n.isPinned)
  const normal = notices.filter(n => !n.isPinned)
  const totalPages = Math.max(1, Math.ceil(normal.length / PAGE_SIZE))
  const pagedNormal = normal.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>공지사항</h1>

      <div className={styles.list}>
        {pinned.map(n => (
          <NoticeRow key={n.id} notice={n} pinned />
        ))}
        {pinned.length > 0 && pagedNormal.length > 0 && (
          <div className={styles.divider} />
        )}
        {pagedNormal.map(n => (
          <NoticeRow key={n.id} notice={n} />
        ))}
      </div>

      <div className={styles.footer}>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        <Link to="/notice/write" className={styles.writeButton}>글쓰기</Link>
      </div>
    </div>
  )
}

function NoticeRow({ notice, pinned }) {
  return (
    <Link to={`/notice/${notice.id}`} className={`${styles.row} ${pinned ? styles.rowPinned : ''}`}>
      <div className={styles.rowLeft}>
        {pinned && <span className={styles.pinIcon}>📌</span>}
        <span className={`${styles.tag} ${CATEGORY_STYLE[notice.category]}`}>
          {CATEGORY_LABEL[notice.category]}
        </span>
        <span className={styles.rowTitle}>{notice.title}</span>
      </div>
      <div className={styles.rowMeta}>
        <span>{notice.author}</span>
        <span>{notice.date}</span>
        <span>조회 {notice.views}</span>
      </div>
    </Link>
  )
}
