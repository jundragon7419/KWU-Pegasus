const pool = require('../db')

exports.getNotices = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, category, is_pinned AS isPinned, title, author, DATE_FORMAT(date, "%Y-%m-%d") AS date, views FROM notices ORDER BY is_pinned DESC, id DESC'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

exports.getNotice = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, category, is_pinned AS isPinned, title, author, DATE_FORMAT(date, "%Y-%m-%d") AS date, views, content FROM notices WHERE id = ?',
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' })
    await pool.query('UPDATE notices SET views = views + 1 WHERE id = ?', [req.params.id])
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
}

exports.createNotice = async (req, res, next) => {
  try {
    const { category, isPinned, title, author, content } = req.body
    const [result] = await pool.query(
      'INSERT INTO notices (category, is_pinned, title, author, date, views, content) VALUES (?, ?, ?, ?, CURDATE(), 0, ?)',
      [category, isPinned ? 1 : 0, title, author, content]
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    next(err)
  }
}

exports.updateNotice = async (req, res, next) => {
  try {
    const { category, isPinned, title, content } = req.body
    await pool.query(
      'UPDATE notices SET category = ?, is_pinned = ?, title = ?, content = ? WHERE id = ?',
      [category, isPinned ? 1 : 0, title, content, req.params.id]
    )
    res.json({ message: '수정 완료' })
  } catch (err) {
    next(err)
  }
}

exports.deleteNotice = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM notices WHERE id = ?', [req.params.id])
    res.json({ message: '삭제 완료' })
  } catch (err) {
    next(err)
  }
}
