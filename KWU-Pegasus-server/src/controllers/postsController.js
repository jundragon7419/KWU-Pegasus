const pool = require('../db')
const { log } = require('../services/activityLogService')

const MANAGER_TYPES  = ['notice', 'event', 'game']
const PINNABLE_TYPES = ['notice', 'event', 'game', 'family_occasion']
const PIN_INFINITE   = '9999-12-31'

exports.getPosts = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.type,
              DATE_FORMAT(p.pin_until, '%Y-%m-%d') AS pin_until,
              (p.pin_until IS NOT NULL AND p.pin_until >= CURDATE()) AS isPinned,
              p.title,
              COALESCE(CONCAT(u.username, '(', u.name, ')'), p.author) AS author,
              DATE_FORMAT(p.date, '%Y-%m-%d') AS date,
              p.views
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY isPinned DESC, p.date DESC, p.id DESC`
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

exports.getPost = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.user_id, p.type,
              DATE_FORMAT(p.pin_until, '%Y-%m-%d') AS pin_until,
              (p.pin_until IS NOT NULL AND p.pin_until >= CURDATE()) AS isPinned,
              p.title,
              COALESCE(CONCAT(u.username, '(', u.name, ')'), p.author) AS author,
              DATE_FORMAT(p.date, '%Y-%m-%d') AS date,
              p.views, p.content
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' })
    res.json(rows[0])
    pool.query('UPDATE posts SET views = views + 1 WHERE id = ?', [req.params.id])
      .catch(err => console.error('View increment failed:', err))
  } catch (err) {
    next(err)
  }
}

exports.createPost = async (req, res, next) => {
  try {
    const { type = 'normal', pinUntil, title, content } = req.body
    const isManager = ['manager', 'staff', 'root'].includes(req.user.role)

    if (MANAGER_TYPES.includes(type) && !isManager) {
      return res.status(403).json({ message: '해당 유형은 매니저 이상만 작성할 수 있습니다.' })
    }

    const resolvedPinUntil = resolvePinUntil(type, pinUntil, isManager)

    const [result] = await pool.query(
      'INSERT INTO posts (user_id, type, pin_until, title, author, date, views, content) VALUES (?, ?, ?, ?, ?, CURDATE(), 0, ?)',
      [req.user.id, type, resolvedPinUntil, title, req.user.username, content]
    )
    log(req.user.id, 'post_create', 'post', result.insertId, { type, title, content, pin_until: resolvedPinUntil })
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    next(err)
  }
}

exports.updatePost = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT user_id, type FROM posts WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' })

    const isOwner   = rows[0].user_id === req.user.id
    const isManager = ['manager', 'staff', 'root'].includes(req.user.role)
    if (!isOwner && !isManager) return res.status(403).json({ message: '본인 게시글만 수정할 수 있습니다.' })

    const { type, pinUntil, title, content } = req.body
    const newType = type || rows[0].type

    if (MANAGER_TYPES.includes(newType) && !isManager) {
      return res.status(403).json({ message: '해당 유형은 매니저 이상만 설정할 수 있습니다.' })
    }

    const resolvedPinUntil = resolvePinUntil(newType, pinUntil, isManager)

    await pool.query(
      'UPDATE posts SET type = ?, pin_until = ?, title = ?, content = ? WHERE id = ?',
      [newType, resolvedPinUntil, title, content, req.params.id]
    )
    log(req.user.id, 'post_update', 'post', parseInt(req.params.id), { type: newType, title, content, pin_until: resolvedPinUntil })
    res.json({ message: '수정 완료' })
  } catch (err) {
    next(err)
  }
}

exports.getAdjacentPosts = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const [[prev]] = await pool.query(
      'SELECT id, title FROM posts WHERE id < ? ORDER BY id DESC LIMIT 1', [id]
    )
    const [[next]] = await pool.query(
      'SELECT id, title FROM posts WHERE id > ? ORDER BY id ASC LIMIT 1', [id]
    )
    res.json({ prev: prev ?? null, next: next ?? null })
  } catch (err) {
    next(err)
  }
}

exports.deletePost = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT user_id, type, title, content FROM posts WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' })

    const isOwner   = rows[0].user_id === req.user.id
    const isManager = ['manager', 'staff', 'root'].includes(req.user.role)
    if (!isOwner && !isManager) return res.status(403).json({ message: '본인 게시글만 삭제할 수 있습니다.' })

    const snapshot = { type: rows[0].type, title: rows[0].title, content: rows[0].content }
    await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id])
    log(req.user.id, 'post_delete', 'post', parseInt(req.params.id), snapshot)
    res.json({ message: '삭제 완료' })
  } catch (err) {
    next(err)
  }
}

// pin 가능 타입 + 매니저 권한인 경우에만 pin_until 적용, 그 외 NULL 강제
function resolvePinUntil(type, pinUntil, isManager) {
  if (!PINNABLE_TYPES.includes(type) || !isManager) return null
  if (!pinUntil) return null
  if (pinUntil === 'infinite') return PIN_INFINITE
  return pinUntil
}
