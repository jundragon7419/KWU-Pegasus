const pool = require('../db')

exports.getEvents = async (req, res, next) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear()
    const [rows] = await pool.query(
      'SELECT id, year, month, day, type, name FROM events WHERE year = ? ORDER BY month ASC, day ASC',
      [year]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

exports.createEvent = async (req, res, next) => {
  try {
    const { year, month, day, type, name } = req.body
    const [result] = await pool.query(
      'INSERT INTO events (year, month, day, type, name) VALUES (?, ?, ?, ?, ?)',
      [year, month, day, type, name]
    )
    res.status(201).json({ id: result.insertId })
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
