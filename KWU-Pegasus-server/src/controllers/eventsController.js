const pool = require('../db')

exports.getEvents = async (req, res, next) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear()
    const [rows] = await pool.query(
      'SELECT id, DATE_FORMAT(date, "%Y-%m-%d") AS date, type, name FROM events WHERE YEAR(date) = ? ORDER BY date ASC',
      [year]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

exports.createEvent = async (req, res, next) => {
  try {
    const { date, type, name } = req.body
    const [result] = await pool.query(
      'INSERT INTO events (date, type, name) VALUES (?, ?, ?)',
      [date, type, name]
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    next(err)
  }
}

exports.updateEvent = async (req, res, next) => {
  try {
    const { date, type, name } = req.body
    const [result] = await pool.query(
      'UPDATE events SET date = ?, type = ?, name = ? WHERE id = ?',
      [date, type, name, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: '일정을 찾을 수 없습니다.' })
    res.json({ message: '수정 완료' })
  } catch (err) {
    next(err)
  }
}

exports.deleteEvent = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id])
    res.json({ message: '삭제 완료' })
  } catch (err) {
    next(err)
  }
}
