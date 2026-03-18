import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NOTICES } from '../data/notices'
import styles from './Notice.module.css'

const PAGE_SIZE = 10

const CATEGORY_LABEL = {
  notice: '공지',
  event: '행사',
  game: '경기',
}

const CATEGORY_STYLE = {
  notice: styles.tagNotice,
  event: styles.tagEvent,
  game: styles.tagGame,
}

export default function Notice() {
  const [page, setPage] = useState(1)

  const pinned = NOTICES.filter(n => n.isPinned)
  const normal = NOTICES.filter(n => !n.isPinned)

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
