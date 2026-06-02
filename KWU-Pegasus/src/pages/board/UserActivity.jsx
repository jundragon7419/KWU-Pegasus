import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import { POST_TYPE_LABEL, EVENT_TYPES } from '../../lib/constants'

const ACTION_LABEL = {
  post_create: '게시글 작성', post_update: '게시글 수정', post_delete: '게시글 삭제',
  comment_create: '댓글 작성', comment_update: '댓글 수정', comment_delete: '댓글 삭제',
  event_create: '일정 추가', event_update: '일정 수정', event_delete: '일정 삭제',
  member_approve: '멤버 승인', member_reject: '멤버 거부', member_demote: '멤버 강등',
  role_set_manager: '매니저 임명', role_unset_manager: '매니저 해제',
  role_set_staff: '스태프 임명', role_unset_staff: '스태프 해제',
  user_ban: '계정 차단', user_unban: '차단 해제',
  roster_add: '로스터 추가', roster_update: '로스터 수정', roster_delete: '로스터 삭제',
  roster_year_set: '연도 설정',
}

const EVENT_TYPE_LABEL = { training: '훈련', meeting: '미팅', events: '이벤트', etc: '기타' }
import { useAuth } from '../../context/AuthContext'
import { useTabIndicator } from '../../hooks/useTabIndicator'
import Pagination from '../../components/Pagination'
import styles from './UserActivity.module.css'

const PAGE_SIZE = 15

const ROLE_ORDER = { basic: 0, member: 1, manager: 2, staff: 3, root: 4 }

function isHigherRole(viewerRole, targetRole) {
  return (ROLE_ORDER[viewerRole] ?? -1) > (ROLE_ORDER[targetRole] ?? -1)
}

export default function UserActivity() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tab, setTab] = useState('posts')
  const { containerRef, indicatorRef, update } = useTabIndicator(tab)

  const [targetUser, setTargetUser] = useState(null)
  const [posts, setPosts]           = useState([])
  const [comments, setComments]     = useState([])
  const [logs, setLogs]             = useState([])
  const [postsPage, setPostsPage]       = useState(1)
  const [commentsPage, setCommentsPage] = useState(1)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setNotFound(false)
    setLoading(true)
    setPosts([])
    setComments([])
    setTargetUser(null)
    setTab('posts')

    Promise.all([
      fetch(`${API_BASE}/api/users/${username}`),
      fetch(`${API_BASE}/api/users/${username}/posts`),
      fetch(`${API_BASE}/api/users/${username}/comments`),
      fetch(`${API_BASE}/api/users/${username}/logs`),
    ]).then(async ([userRes, postsRes, commentsRes, logsRes]) => {
      if (userRes.status === 404) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const [userData, postsData, commentsData, logsData] = await Promise.all([
        userRes.json(),
        postsRes.json(),
        commentsRes.json(),
        logsRes.json(),
      ])
      setTargetUser(userData)
      setPosts(Array.isArray(postsData) ? postsData : [])
      setComments(Array.isArray(commentsData) ? commentsData : [])
      setLogs(Array.isArray(logsData) ? logsData : [])
      setLoading(false)
    })
  }, [username])

  // 로딩 완료 후 탭 DOM이 생기면 인디케이터 위치를 잡아줌
  useEffect(() => {
    if (!loading) requestAnimationFrame(() => update(true))
  }, [loading, update])

  const canSeeLog = targetUser && user && isHigherRole(user.role, targetUser.role)

  const totalPostPages    = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  const totalCommentPages = Math.max(1, Math.ceil(comments.length / PAGE_SIZE))
  const pagedPosts    = posts.slice((postsPage - 1) * PAGE_SIZE, postsPage * PAGE_SIZE)
  const pagedComments = comments.slice((commentsPage - 1) * PAGE_SIZE, commentsPage * PAGE_SIZE)

  if (loading) return null

  if (notFound) {
    return (
      <div className={styles.page}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>← 뒤로</button>
        <div className={styles.notFound}>
          <p className={styles.notFoundTitle}>존재하지 않거나 탈퇴한 유저입니다.</p>
          <p className={styles.notFoundDesc}>해당 사용자의 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>← 뒤로</button>

      <h1 className={styles.title}>
        <span className={styles.username}>{username}</span>님의 활동 내역
      </h1>

      <div ref={containerRef} className={styles.tabs}>
        <button
          data-active={tab === 'posts'}
          className={`${styles.tab} ${tab === 'posts' ? styles.tabActive : ''}`}
          onClick={() => { setTab('posts'); setPostsPage(1) }}
        >
          게시글 <span className={styles.tabCount}>{posts.length}</span>
        </button>
        <button
          data-active={tab === 'comments'}
          className={`${styles.tab} ${tab === 'comments' ? styles.tabActive : ''}`}
          onClick={() => { setTab('comments'); setCommentsPage(1) }}
        >
          댓글 <span className={styles.tabCount}>{comments.length}</span>
        </button>
        {canSeeLog && (
          <button
            data-active={tab === 'log'}
            className={`${styles.tab} ${tab === 'log' ? styles.tabActive : ''} ${styles.tabLog}`}
            onClick={() => setTab('log')}
          >
            로그
          </button>
        )}
        <div ref={indicatorRef} className={styles.tabIndicator} />
      </div>

      {tab === 'posts' && (
        <>
          <div className={styles.list}>
            {pagedPosts.length === 0 ? (
              <p className={styles.empty}>작성한 글이 없습니다.</p>
            ) : pagedPosts.map(p => (
              <Link key={p.id} to={`/board/${p.id}`} className={styles.row}>
                <div className={styles.rowLeft}>
                  <span className={styles.tag}>{POST_TYPE_LABEL[p.type]}</span>
                  <span className={styles.rowTitle}>{p.title}</span>
                </div>
                <div className={styles.rowMeta}>
                  <span>조회 {p.views}</span>
                  <span>{p.date}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className={styles.pagination}>
            <Pagination page={postsPage} totalPages={totalPostPages} onPageChange={setPostsPage} />
          </div>
        </>
      )}

      {tab === 'comments' && (
        <>
          <div className={styles.list}>
            {pagedComments.length === 0 ? (
              <p className={styles.empty}>작성한 댓글이 없습니다.</p>
            ) : pagedComments.map(c => (
              <Link key={c.id} to={`/board/${c.post_id}`} className={styles.row}>
                <div className={styles.rowLeft}>
                  <span className={styles.tag}>{POST_TYPE_LABEL[c.post_type]}</span>
                  <div className={styles.rowContent}>
                    <span className={styles.rowTitle}>{c.content}</span>
                    <span className={styles.rowSub}>└ {c.post_title}</span>
                  </div>
                </div>
                <span className={styles.rowDate}>{c.created_at}</span>
              </Link>
            ))}
          </div>
          <div className={styles.pagination}>
            <Pagination page={commentsPage} totalPages={totalCommentPages} onPageChange={setCommentsPage} />
          </div>
        </>
      )}

      {tab === 'log' && canSeeLog && (
        <div className={styles.list}>
          {logs.length === 0 ? (
            <p className={styles.empty}>로그가 없습니다.</p>
          ) : logs.map(log => {
            const s = log.snapshot
            const isClickable = log.action.startsWith('post_') || log.action.startsWith('comment_')

            return (
              <div
                key={log.id}
                className={`${styles.logRow} ${isClickable ? styles.logRowClickable : ''}`}
                onClick={isClickable ? () => navigate(`/user/${username}/log/${log.id}`, { state: { log } }) : undefined}
              >
                <span className={styles.logBadge} data-action={log.action}>
                  {ACTION_LABEL[log.action] ?? log.action}
                </span>

                {/* 게시글 */}
                {log.action.startsWith('post_') && s && (
                  <div className={styles.logContent}>
                    <span className={styles.logTitle}>{s.title}</span>
                    {s.type && <span className={styles.logSub}>{POST_TYPE_LABEL[s.type]}</span>}
                  </div>
                )}

                {/* 댓글 */}
                {log.action.startsWith('comment_') && s && (
                  <div className={styles.logContent}>
                    <span className={styles.logTitle}>{s.content}</span>
                    <span className={styles.logSub}>└ {s.post_title}</span>
                  </div>
                )}

                {/* 일정 */}
                {log.action.startsWith('event_') && s && (
                  <div className={styles.logContent}>
                    <span className={styles.logTitle}>{s.name}</span>
                    <span className={styles.logSub}>{s.date} · {EVENT_TYPE_LABEL[s.type] ?? s.type}</span>
                  </div>
                )}

                {/* 멤버/권한/차단 */}
                {(log.action.startsWith('member_') || log.action.startsWith('role_') || log.action.startsWith('user_')) && s && (
                  <div className={styles.logContent}>
                    <span className={styles.logTitle}>{s.username ?? s.name}</span>
                    <span className={styles.logSub}>
                      {[s.name, s.student_id, s.ob_yb?.toUpperCase()].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                )}

                {/* 로스터 */}
                {log.action.startsWith('roster_') && !log.action.includes('year') && s && (
                  <div className={styles.logContent}>
                    <span className={styles.logTitle}>{s.name}</span>
                    <span className={styles.logSub}>{[s.student_id, s.role].filter(Boolean).join(' · ')}</span>
                  </div>
                )}

                {/* 연도 설정 */}
                {log.action === 'roster_year_set' && s && (
                  <div className={styles.logContent}>
                    <span className={styles.logTitle}>{s.year}년으로 설정</span>
                  </div>
                )}

                <span className={styles.logDate}>{log.created_at}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
