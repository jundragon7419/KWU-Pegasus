import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import { POST_TYPE_LABEL, POST_TYPE_MANAGER } from '../../lib/constants'
import { useAuth } from '../../context/AuthContext'
import styles from '../Write.module.css'

const PINNABLE_TYPES = ['notice', 'event', 'game', 'family_occasion']

export default function BoardWrite() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const isManager = user && ['manager', 'staff', 'root'].includes(user.role)

  const [type, setType] = useState('normal')
  const [pinEnabled, setPinEnabled] = useState(false)
  const [pinForever, setPinForever] = useState(false)
  const [pinDate, setPinDate] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [emptyTitle, setEmptyTitle] = useState(false)
  const [emptyContent, setEmptyContent] = useState(false)

  const availableTypes = Object.entries(POST_TYPE_LABEL).filter(
    ([key]) => !POST_TYPE_MANAGER.includes(key) || isManager
  )

  const canPin = isManager && PINNABLE_TYPES.includes(type)

  function handleTypeChange(newType) {
    setType(newType)
    if (!PINNABLE_TYPES.includes(newType)) {
      setPinEnabled(false)
      setPinForever(false)
      setPinDate('')
    }
  }

  function handlePinForeverChange(checked) {
    setPinForever(checked)
    if (checked) setPinDate('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const noTitle   = !title.trim()
    const noContent = !content.trim()
    if (noTitle || noContent) {
      setEmptyTitle(noTitle)
      setEmptyContent(noContent)
      return
    }

    let pinUntil = null
    if (canPin && pinEnabled) {
      if (pinForever) pinUntil = 'infinite'
      else if (pinDate) pinUntil = pinDate
    }

    const res = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ type, pinUntil, title, content }),
    })
    if (res.ok) navigate('/board')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>게시글 작성</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>유형</label>
          <div className={styles.categoryRow}>
            {availableTypes.map(([key, label]) => (
              <label
                key={key}
                className={styles.radioLabel}
                style={type === key ? {
                  borderColor: 'var(--main-400)',
                  color: 'var(--main-300)',
                  background: 'rgba(166,146,109,0.1)',
                } : {}}
              >
                <input
                  type="radio"
                  className={styles.radioInput}
                  name="type"
                  value={key}
                  checked={type === key}
                  onChange={() => handleTypeChange(key)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {canPin && (
          <div className={styles.field}>
            <div className={styles.pinRow}>
              <label className={`${styles.pinCheck} ${pinEnabled ? styles.pinCheckActive : ''}`}>
                <input
                  type="checkbox"
                  checked={pinEnabled}
                  onChange={e => setPinEnabled(e.target.checked)}
                />
                상단 고정
              </label>

              {pinEnabled && (
                <>
                  <input
                    type="date"
                    className={styles.pinDateInput}
                    value={pinDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setPinDate(e.target.value)}
                    disabled={pinForever}
                    placeholder="날짜 선택"
                  />
                  <label className={`${styles.pinCheck} ${pinForever ? styles.pinCheckActive : ''}`}>
                    <input
                      type="checkbox"
                      checked={pinForever}
                      onChange={e => handlePinForeverChange(e.target.checked)}
                    />
                    항상 고정
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={`${styles.label} ${emptyTitle ? styles.labelError : ''}`} htmlFor="title">제목</label>
          <input
            id="title"
            type="text"
            className={`${styles.input} ${emptyTitle ? styles.inputError : ''}`}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={e => { setTitle(e.target.value); if (e.target.value.trim()) setEmptyTitle(false) }}
          />
        </div>

        <div className={styles.field}>
          <label className={`${styles.label} ${emptyContent ? styles.labelError : ''}`} htmlFor="content">내용</label>
          <textarea
            id="content"
            className={`${styles.textarea} ${emptyContent ? styles.textareaError : ''}`}
            placeholder="내용을 입력하세요"
            value={content}
            onChange={e => { setContent(e.target.value); if (e.target.value.trim()) setEmptyContent(false) }}
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
