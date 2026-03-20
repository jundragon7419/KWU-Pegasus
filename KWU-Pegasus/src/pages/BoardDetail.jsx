import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPost, POSTS } from '../data/board'
import styles from './BoardDetail.module.css'

export default function BoardDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const post = getPost(id)

  if (!post) {
    return (
      <div className={styles.notFound}>
        <p>존재하지 않는 게시글입니다.</p>
        <Link to="/board" className={styles.backLink}>목록으로</Link>
      </div>
    )
  }

  const currentIndex = POSTS.findIndex(p => p.id === post.id)
  const prev = POSTS[currentIndex + 1] ?? null
  const next = POSTS[currentIndex - 1] ?? null

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate('/board')}>
        ← 목록
      </button>

      <article className={styles.article}>
        <div className={styles.articleHeader}>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>
            <span>{post.author}</span>
            <span>{post.date}</span>
            <span>조회 {post.views}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.body}>
          {post.content.split('\n').map((line, i) =>
            line === '' ? <br key={i} /> : <p key={i}>{line}</p>
          )}
        </div>
      </article>

      <div className={styles.nav}>
        {next ? (
          <Link to={`/board/${next.id}`} className={styles.navItem}>
            <span className={styles.navLabel}>다음 글</span>
            <span className={styles.navTitle}>{next.title}</span>
          </Link>
        ) : (
          <div className={styles.navItem} />
        )}
        {prev ? (
          <Link to={`/board/${prev.id}`} className={`${styles.navItem} ${styles.navPrev}`}>
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
