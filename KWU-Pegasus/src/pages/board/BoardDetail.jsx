import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import { POST_TYPE_LABEL, isManagerRole } from '../../lib/constants'
import { useAuth } from '../../context/AuthContext'
import ContentRenderer from '../../components/ContentRenderer'
import PollVote from '../../components/PollVote'
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
  const { user, token } = useAuth()

  const [post, setPost]         = useState(null)
  const [adjacent, setAdjacent] = useState({ prev: null, next: null })
  const [notFound, setNotFound] = useState(false)

  const [comments, setComments]         = useState([])
  const [commentInput, setCommentInput] = useState('')
  const [submitting, setSubmitting]     = useState(false)

  const [editingId, setEditingId]       = useState(null)
  const [editContent, setEditContent]   = useState('')

  const [poll, setPoll]         = useState(null)
  const [pollLoading, setPollLoading]   = useState(false)

  const isManager = isManagerRole(user)

  async function handlePostDelete() {
    if (!post) return
    const isOwn = user.id === post.user_id
    const msg = isOwn
      ? '게시글을 삭제하시겠습니까?'
      : '이 행동은 로그에 기록됩니다.\n올바르지 않은 삭제는 제재를 받을 수 있습니다.\n\n삭제하시겠습니까?'
    if (!window.confirm(msg)) return

    const res = await fetch(`${API_BASE}/api/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) navigate('/board')
  }

  function loadComments() {
    fetch(`${API_BASE}/api/comments?postId=${id}`)
      .then(r => r.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
  }

  function loadPoll() {
    setPollLoading(true)
    const pollOptions = {}
    if (token) {
      pollOptions.headers = { Authorization: `Bearer ${token}` }
    }
    fetch(`${API_BASE}/api/polls/post/${id}`, pollOptions)
      .then(r => r.json())
      .then(data => {
        setPoll(data)
        setPollLoading(false)
      })
      .catch(err => {
        console.error('투표 로드 실패:', err)
        setPollLoading(false)
      })
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 게시글 id 변경 시 상태 초기화
    setPost(null)
    setAdjacent({ prev: null, next: null })
    setNotFound(false)
    setComments([])
    setCommentInput('')
    setEditingId(null)
    setPoll(null)
    setPollLoading(false)

    fetch(`${API_BASE}/api/posts/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null } return r.json() })
      .then(data => { if (data) setPost(data) })

    fetch(`${API_BASE}/api/posts/${id}/adjacent`)
      .then(r => r.json())
      .then(data => setAdjacent(data))

    loadPoll()
    loadComments()
  }, [id, token])

  async function handleCommentSubmit() {
    if (!commentInput.trim() || submitting) return
    setSubmitting(true)
    const res = await fetch(`${API_BASE}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ postId: id, content: commentInput.trim() }),
    })
    if (res.ok) {
      const created = await res.json()
      setComments(prev => [...prev, created])
      setCommentInput('')
    }
    setSubmitting(false)
  }

  function startEdit(comment) {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditContent('')
  }

  async function handleEditSave(commentId) {
    if (!editContent.trim()) return
    const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: editContent.trim() }),
    })
    if (res.ok) {
      setComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, content: editContent.trim(), isEdited: 1 } : c
      ))
      cancelEdit()
    }
  }

  async function handleDelete(commentId, isOwnComment) {
    const msg = isOwnComment
      ? '댓글을 삭제하시겠습니까?'
      : '이 행동은 로그에 기록됩니다.\n올바르지 않은 삭제는 제재를 받을 수 있습니다.\n\n삭제하시겠습니까?'
    if (!window.confirm(msg)) return
    const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (res.ok) setComments(prev => prev.filter(c => c.id !== commentId))
  }

  async function handleVoteSubmit(selectedOptionIds) {
    if (!user || !token) {
      alert('로그인이 필요합니다.')
      return
    }

    const res = await fetch(`${API_BASE}/api/polls/${poll.poll.id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ optionIds: selectedOptionIds }),
    })

    if (!res.ok) {
      const data = await res.json()
      alert(data.message || '투표 저장에 실패했습니다.')
      return
    }

    // 투표 재로드
    loadPoll()
  }

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
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.titleActions}>
              {user && user.id === post.user_id && (
                <button className={styles.editButton} onClick={() => navigate(`/board/${id}/edit`)}>
                  수정
                </button>
              )}
              {user && (user.id === post.user_id || isManager) && (
                <button className={styles.deleteButton} onClick={handlePostDelete}>
                  삭제
                </button>
              )}
            </div>
          </div>
          <div className={styles.meta}>
            <Link
              to={(() => { const un = post.author.replace(/\(.*\)$/, '').trim(); return un === user?.username ? '/mypage' : `/user/${un}` })()}
              className={styles.authorLink}
            >{post.author}</Link>
            <span>{post.date}</span>
            <span>조회 {post.views}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.body}>
          <ContentRenderer content={post.content} />
        </div>

        {/* 투표 섹션 */}
        {poll && !pollLoading && (
          <div className={styles.pollSection}>
            <PollVote poll={poll} onVote={handleVoteSubmit} user={user} />
          </div>
        )}
      </article>

      {/* ── 댓글 ── */}
      <section className={styles.commentSection}>
        <h3 className={styles.commentTitle}>
          댓글
          {comments.length > 0 && (
            <span className={styles.commentCount}>{comments.length}</span>
          )}
        </h3>

        <div className={styles.commentList}>
          {comments.length === 0 ? (
            <p className={styles.commentEmpty}>아직 댓글이 없습니다.</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.commentMeta}>
                  <span className={styles.commentAuthor}>{c.author}</span>
                  <span className={styles.commentDate}>
                    {c.created_at}
                    {!!c.isEdited && <span className={styles.commentEdited}>(수정)</span>}
                  </span>
                  {user && (user.id === c.user_id || isManager) && editingId !== c.id && (
                    <div className={styles.commentActions}>
                      {user.id === c.user_id && (
                        <button className={styles.commentActionBtn} onClick={() => startEdit(c)}>수정</button>
                      )}
                      <button className={`${styles.commentActionBtn} ${styles.commentDeleteBtn}`} onClick={() => handleDelete(c.id, user.id === c.user_id)}>삭제</button>
                    </div>
                  )}
                </div>

                {editingId === c.id ? (
                  <div className={styles.commentEditBox}>
                    <textarea
                      className={styles.commentInput}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <div className={styles.commentFormFooter}>
                      <span className={styles.commentInputCount}>{editContent.length} / 500</span>
                      <div className={styles.commentEditActions}>
                        <button className={styles.commentCancelBtn} onClick={cancelEdit}>취소</button>
                        <button className={styles.commentSubmit} onClick={() => handleEditSave(c.id)} disabled={!editContent.trim()}>저장</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className={styles.commentContent}>{c.content}</p>
                )}
              </div>
            ))
          )}
        </div>

        {user && (
          <div className={styles.commentForm}>
            <textarea
              className={styles.commentInput}
              placeholder="댓글을 입력하세요"
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={submitting}
            />
            <div className={styles.commentFormFooter}>
              <span className={styles.commentInputCount}>{commentInput.length} / 500</span>
              <button
                className={styles.commentSubmit}
                onClick={handleCommentSubmit}
                disabled={!commentInput.trim() || submitting}
              >
                {submitting ? '등록 중…' : '등록'}
              </button>
            </div>
          </div>
        )}
      </section>

      <nav className={styles.postNav}>
        <button
          className={styles.postNavBtn}
          onClick={() => adjacent.prev && navigate(`/board/${adjacent.prev.id}`)}
          disabled={!adjacent.prev}
          title={adjacent.prev?.title}
        >
          ‹ 이전 글
        </button>
        <Link to="/board" className={styles.postNavCenter}>목록</Link>
        <button
          className={styles.postNavBtn}
          onClick={() => adjacent.next && navigate(`/board/${adjacent.next.id}`)}
          disabled={!adjacent.next}
          title={adjacent.next?.title}
        >
          다음 글 ›
        </button>
      </nav>
    </div>
  )
}
