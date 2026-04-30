const pool = require('../db')

exports.getPosts = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, author, DATE_FORMAT(date, "%Y-%m-%d") AS date, views FROM posts ORDER BY id DESC'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

exports.getPost = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, author, DATE_FORMAT(date, "%Y-%m-%d") AS date, views, content FROM posts WHERE id = ?',
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' })
    res.json(rows[0])
    pool.query('UPDATE posts SET views = views + 1 WHERE id = ?', [req.params.id]).catch(err => console.error('View increment failed:', err))
  } catch (err) {
    next(err)
  }
}

exports.createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body
    const author = req.user.username
    const [result] = await pool.query(
      'INSERT INTO posts (title, author, date, views, content) VALUES (?, ?, CURDATE(), 0, ?)',
      [title, author, content]
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    next(err)
  }
}

exports.updatePost = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT author FROM posts WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' })

    const isOwner = rows[0].author === req.user.username
    const canOverride = ['manager', 'staff', 'root'].includes(req.user.role)
    if (!isOwner && !canOverride) return res.status(403).json({ message: '본인 게시글만 수정할 수 있습니다.' })

    const { title, content } = req.body
    await pool.query(
      'UPDATE posts SET title = ?, content = ? WHERE id = ?',
      [title, content, req.params.id]
    )
    res.json({ message: '수정 완료' })
  } catch (err) {
    next(err)
  }
}

exports.deletePost = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT author FROM posts WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' })

    const isOwner = rows[0].author === req.user.username
    const canOverride = ['manager', 'staff', 'root'].includes(req.user.role)
    if (!isOwner && !canOverride) return res.status(403).json({ message: '본인 게시글만 삭제할 수 있습니다.' })

    await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id])
    res.json({ message: '삭제 완료' })
  } catch (err) {
    next(err)
  }
}
