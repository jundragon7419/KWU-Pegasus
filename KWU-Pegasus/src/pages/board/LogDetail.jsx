import { useLocation, useNavigate, Link, useParams } from 'react-router-dom'
import { POST_TYPE_LABEL } from '../../lib/constants'
import ContentRenderer from '../../components/ContentRenderer'
import styles from './LogDetail.module.css'

const ACTION_LABEL = {
  post_create:    '게시글 작성',
  post_update:    '게시글 수정',
  post_delete:    '게시글 삭제',
  comment_create: '댓글 작성',
  comment_update: '댓글 수정',
  comment_delete: '댓글 삭제',
}

export default function LogDetail() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const log = state?.log

  if (!log || !log.snapshot) {
    return (
      <div className={styles.page}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>← 뒤로</button>
        <p className={styles.empty}>로그 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const { snapshot, action, targetId } = log
  const isPost    = action.startsWith('post_')
  const isComment = action.startsWith('comment_')

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>← 뒤로</button>

      <article className={styles.article}>
        <div className={styles.articleHeader}>
          <div className={styles.badges}>
            <span className={styles.actionBadge} data-action={action}>
              {ACTION_LABEL[action]}
            </span>
            {snapshot.type && (
              <span className={styles.typeBadge}>{POST_TYPE_LABEL[snapshot.type]}</span>
            )}
          </div>

          {isPost && (
            <h1 className={styles.title}>{snapshot.title}</h1>
          )}

          {isComment && (
            <h1 className={styles.title}>
              <Link
                to={`/board/${snapshot.post_id}`}
                className={styles.titleLink}
              >
                {snapshot.post_title}
              </Link>
              <span className={styles.titleSuffix}> - 게시글에 작성한 댓글</span>
            </h1>
          )}

          <div className={styles.meta}>
            <span>{username}</span>
            <span>{log.created_at}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.body}>
          <ContentRenderer content={isPost ? (snapshot.content ?? '') : (snapshot.content ?? '')} />
        </div>
      </article>
    </div>
  )
}
