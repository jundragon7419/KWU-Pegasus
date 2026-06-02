const pool = require('../db')
const { log } = require('../services/activityLogService')

exports.getComments = async (req, res, next) => {
  try {
    const { postId } = req.query
    if (!postId) return res.status(400).json({ message: 'postId가 필요합니다.' })
    const [rows] = await pool.query(
      `SELECT c.id, c.user_id,
              CONCAT(u.username, '(', u.name, ')') AS author,
              c.content, c.is_edited AS isEdited,
              DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i') AS created_at
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    )
    res.json(rows)
  } catch (err) { next(err) }
}

exports.createComment = async (req, res, next) => {
  try {
    const { postId, content } = req.body
    if (!postId || !content?.trim()) return res.status(400).json({ message: '내용을 입력해주세요.' })

    // 원글 제목 조회 (스냅샷용)
    const [[post]] = await pool.query('SELECT title FROM posts WHERE id = ?', [postId])

    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, req.user.id, content.trim()]
    )
    const [[created]] = await pool.query(
      `SELECT c.id, c.user_id,
              CONCAT(u.username, '(', u.name, ')') AS author,
              c.content, c.is_edited AS isEdited,
              DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i') AS created_at
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    )
    log(req.user.id, 'comment_create', 'comment', result.insertId,
      { content: content.trim(), post_id: parseInt(postId), post_title: post?.title ?? '' })
    res.status(201).json(created)
  } catch (err) { next(err) }
}

exports.updateComment = async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ message: '내용을 입력해주세요.' })

    const [rows] = await pool.query(
      'SELECT c.user_id, c.post_id, p.title AS post_title FROM comments c JOIN posts p ON c.post_id = p.id WHERE c.id = ?',
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' })
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '본인 댓글만 수정할 수 있습니다.' })

    await pool.query('UPDATE comments SET content = ?, is_edited = 1 WHERE id = ?', [content.trim(), req.params.id])
    log(req.user.id, 'comment_update', 'comment', parseInt(req.params.id),
      { content: content.trim(), post_id: rows[0].post_id, post_title: rows[0].post_title })
    res.json({ message: '수정 완료' })
  } catch (err) { next(err) }
}

exports.deleteComment = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT c.user_id, c.content, c.post_id, p.title AS post_title FROM comments c JOIN posts p ON c.post_id = p.id WHERE c.id = ?',
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' })

    const isOwner   = rows[0].user_id === req.user.id
    const isManager = ['manager', 'staff', 'root'].includes(req.user.role)
    if (!isOwner && !isManager) return res.status(403).json({ message: '삭제 권한이 없습니다.' })

    const snapshot = { content: rows[0].content, post_id: rows[0].post_id, post_title: rows[0].post_title }
    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id])
    log(req.user.id, 'comment_delete', 'comment', parseInt(req.params.id), snapshot)
    res.json({ message: '삭제 완료' })
  } catch (err) { next(err) }
}
