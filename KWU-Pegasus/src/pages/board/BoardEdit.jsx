import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import { POST_TYPE_LABEL, POST_TYPE_MANAGER, isManagerRole } from '../../lib/constants'
import { useAuth } from '../../context/AuthContext'
import styles from '../Write.module.css'

const PINNABLE_TYPES = ['notice', 'event', 'game', 'family_occasion']

export default function BoardEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const isManager = isManagerRole(user)

  const [type, setType] = useState('normal')
  const [pinEnabled, setPinEnabled] = useState(false)
  const [pinForever, setPinForever] = useState(false)
  const [pinDate, setPinDate] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [emptyTitle, setEmptyTitle] = useState(false)
  const [emptyContent, setEmptyContent] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [forbidden, setForbidden] = useState(false)

  // 투표 관련 상태
  const [hasPoll, setHasPoll] = useState(false)
  const [pollData, setPollData] = useState(null)
  const [pollTitle, setPollTitle] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [isMultiple, setIsMultiple] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/posts/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then(post => {
        if (!post) return
        if (post.user_id !== user?.id) { setForbidden(true); return }
        setType(post.type ?? 'normal')
        setTitle(post.title ?? '')
        setContent(post.content ?? '')
        if (post.pin_until) {
          setPinEnabled(true)
          if (post.pin_until === '9999-12-31') {
            setPinForever(true)
          } else {
            setPinDate(post.pin_until)
          }
        }
      })

    // 투표 데이터 로드
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    fetch(`${API_BASE}/api/polls/post/${id}`, { headers })
      .then(r => {
        if (r.status === 404) return null
        return r.json()
      })
      .then(data => {
        if (data) {
          setHasPoll(true)
          setPollData(data)
          setPollTitle(data.poll.title)
          setIsMultiple(data.poll.isMultiple)
          setIsAnonymous(data.poll.isAnonymous)
          setIsPrivate(data.poll.isPrivate)
          setPollOptions(data.options.map(opt => opt.text))
        }
      })
  }, [id, token, user?.id])

  if (notFound)  return <p>존재하지 않는 게시글입니다.</p>
  if (forbidden) return <p>수정 권한이 없습니다.</p>

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

  function handleAddOption() {
    setPollOptions([...pollOptions, ''])
  }

  function handleRemoveOption(index) {
    setPollOptions(pollOptions.filter((_, i) => i !== index))
  }

  function handleOptionChange(index, value) {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
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

    // 투표 유효성 검사
    if (hasPoll) {
      if (!pollTitle.trim()) {
        alert('투표 제목을 입력하세요.')
        return
      }
      const validOptions = pollOptions.filter(opt => opt.trim())
      if (validOptions.length < 2) {
        alert('투표 옵션은 최소 2개 이상 필요합니다.')
        return
      }
    }

    let pinUntil = null
    if (canPin && pinEnabled) {
      if (pinForever) pinUntil = 'infinite'
      else if (pinDate) pinUntil = pinDate
    }

    const payload = {
      type,
      pinUntil,
      title,
      content,
    }

    // 투표 수정 (기존 투표가 있으면 삭제하고 새로 추가)
    if (hasPoll) {
      if (pollData) {
        // 기존 투표 삭제
        await fetch(`${API_BASE}/api/polls/${pollData.poll.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }

      // 새로운 투표 추가
      payload.poll = {
        title: pollTitle,
        isMultiple,
        isAnonymous,
        isPrivate,
        options: pollOptions.filter(opt => opt.trim()).map(text => ({ text })),
      }
    }

    const res = await fetch(`${API_BASE}/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    if (res.ok) navigate(`/board/${id}`)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>게시글 수정</h1>

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

        {/* 투표 섹션 */}
        {!pollData && (
          <div className={styles.field}>
            <label className={`${styles.pollCheck} ${hasPoll ? styles.pollCheckActive : ''}`}>
              <input
                type="checkbox"
                checked={hasPoll}
                onChange={e => setHasPoll(e.target.checked)}
              />
              투표 추가
            </label>
          </div>
        )}

        {hasPoll && (
          <div className={styles.pollSection}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="pollTitle">투표 제목</label>
              <input
                id="pollTitle"
                type="text"
                className={styles.input}
                placeholder="투표 제목을 입력하세요"
                value={pollTitle}
                onChange={e => setPollTitle(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>투표 옵션</label>
              {pollOptions.map((option, index) => (
                <div key={index} className={styles.optionRow}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={`옵션 ${index + 1}`}
                    value={option}
                    onChange={e => handleOptionChange(index, e.target.value)}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveOption(index)}
                      title="옵션 삭제"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className={styles.addButton}
                onClick={handleAddOption}
              >
                + 옵션 추가
              </button>
            </div>

            <div className={styles.field}>
              <div className={styles.pollOptionsRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isMultiple}
                    onChange={e => setIsMultiple(e.target.checked)}
                  />
                  다중선택
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)}
                  />
                  익명 투표
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={e => setIsPrivate(e.target.checked)}
                  />
                  비공개 (작성자&관리자만 결과 확인)
                </label>
              </div>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" className={`btn btn-ghost ${styles.cancelButton}`} onClick={() => navigate(`/board/${id}`)}>
            취소
          </button>
          <button type="submit" className={`btn btn-primary ${styles.submitButton}`}>
            저장
          </button>
        </div>
      </form>
    </div>
  )
}
