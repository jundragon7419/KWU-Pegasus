import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import { POST_TYPE_LABEL } from '../../lib/constants'
import ContentRenderer from '../../components/ContentRenderer'
import styles from './BoardDetail.module.css'

const TYPE_CLASS = {
  notice:          styles.tagNotice,
  event:           styles.tagEvent,
  game:            styles.tagGame,
  family_occasion: styles.tagFamily,
}

export default function BoardDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/posts/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then(data => { if (data) setPost(data) })
  }, [id])

  if (notFound) {
    return (
      <div className={styles.notFound}>
        <p>존재하지 않는 게시글입니다.</p>
        <Link to="/board" className={styles.backLink}>목록으로</Link>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate('/board')}>
        ← 목록
      </button>

      <article className={styles.article}>
        <div className={styles.articleHeader}>
          {post.type && post.type !== 'normal' && (
            <span className={`${styles.typeTag} ${TYPE_CLASS[post.type] ?? ''}`}>
              {POST_TYPE_LABEL[post.type]}
            </span>
          )}
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>
            <span>{post.author}</span>
            <span>{post.date}</span>
            <span>조회 {post.views}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.body}>
          <ContentRenderer content={post.content} />
        </div>
      </article>
    </div>
  )
}
