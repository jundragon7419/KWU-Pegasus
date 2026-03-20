import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Write.module.css'

export default function BoardWrite() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: 서버 연동 후 실제 저장 로직 구현
    navigate('/board')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>게시글 작성</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">제목</label>
          <input
            id="title"
            type="text"
            className={styles.input}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="content">내용</label>
          <textarea
            id="content"
            className={styles.textarea}
            placeholder="내용을 입력하세요"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={() => navigate('/board')}>
            취소
          </button>
          <button type="submit" className={styles.submitButton}>
            등록
          </button>
        </div>
      </form>
    </div>
  )
}
