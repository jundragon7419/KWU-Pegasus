import { useParams, Link, useNavigate } from 'react-router-dom'
import { getNotice, NOTICES } from '../data/notices'
import styles from './NoticeDetail.module.css'

const CATEGORY_LABEL = {
  notice: '공지',
  event: '행사',
  game: '경기',
}

export default function NoticeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notice = getNotice(id)

  if (!notice) {
    return (
      <div className={styles.notFound}>
        <p>존재하지 않는 게시글입니다.</p>
        <Link to="/notice" className={styles.backLink}>목록으로</Link>
      </div>
    )
  }

  const currentIndex = NOTICES.findIndex(n => n.id === notice.id)
  const prev = NOTICES[currentIndex + 1] ?? null
  const next = NOTICES[currentIndex - 1] ?? null

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate('/notice')}>
        ← 목록
      </button>

      <article className={styles.article}>
        <div className={styles.articleHeader}>
          <span className={styles.tag}>{CATEGORY_LABEL[notice.category]}</span>
          <h1 className={styles.title}>{notice.title}</h1>
          <div className={styles.meta}>
            <span>{notice.author}</span>
            <span>{notice.date}</span>
            <span>조회 {notice.views}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.body}>
          {notice.content.split('\n').map((line, i) =>
            line === '' ? <br key={i} /> : <p key={i}>{line}</p>
          )}
        </div>
      </article>

      <div className={styles.nav}>
        {next ? (
          <Link to={`/notice/${next.id}`} className={styles.navItem}>
            <span className={styles.navLabel}>다음 글</span>
            <span className={styles.navTitle}>{next.title}</span>
          </Link>
        ) : (
          <div className={styles.navItem} />
        )}
        {prev ? (
          <Link to={`/notice/${prev.id}`} className={`${styles.navItem} ${styles.navPrev}`}>
            <span className={styles.navLabel}>이전 글</span>
            <span className={styles.navTitle}>{prev.title}</span>
          </Link>
        ) : (
          <div className={styles.navItem} />
        )}
      </div>
    </div>
  )
}
