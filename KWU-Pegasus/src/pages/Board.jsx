import { useState } from 'react'
import { Link } from 'react-router-dom'
import { POSTS } from '../data/board'
import { NOTICES } from '../data/notices'
import styles from './Board.module.css'

const PAGE_SIZE = 10

const pinnedNotices = NOTICES.filter(n => n.isPinned)

export default function Board() {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(POSTS.length / PAGE_SIZE))
  const paged = POSTS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
        <div className={styles.pagination}>
          <button className={styles.pageArrow} onClick={() => setPage(p => Math.max(1, p - 5))} disabled={page === 1}>{'«'}</button>
          <button className={styles.pageArrow} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{'‹'}</button>
          {(() => {
            const half = 2
            let start = Math.max(1, page - half)
            const end = Math.min(totalPages, start + 4)
            start = Math.max(1, end - 4)
            return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
              <button
                key={p}
                className={`${styles.pageButton} ${p === page ? styles.pageButtonActive : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))
          })()}
          <button className={styles.pageArrow} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{'›'}</button>
          <button className={styles.pageArrow} onClick={() => setPage(p => Math.min(totalPages, p + 5))} disabled={page === totalPages}>{'»'}</button>
        </div>
        {/* TODO: 로그인 및 권한 확인 후 표시 */}
        <Link to="/board/write" className={styles.writeButton}>글쓰기</Link>
      </div>
    </div>
  )
}
