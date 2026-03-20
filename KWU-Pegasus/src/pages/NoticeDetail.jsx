import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import styles from './NoticeDetail.module.css'

const CATEGORY_LABEL = {
  notice: '공지',
  event: '행사',
  game: '경기',
}

export default function NoticeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [notice, setNotice] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`http://localhost:3001/api/notices/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then(data => { if (data) setNotice(data) })
  }, [id])

  if (notFound) {
    return (
      <div className={styles.notFound}>
        <p>존재하지 않는 게시글입니다.</p>
        <Link to="/notice" className={styles.backLink}>목록으로</Link>
      </div>
    )
  }

  if (!notice) return null

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
    </div>
  )
}
