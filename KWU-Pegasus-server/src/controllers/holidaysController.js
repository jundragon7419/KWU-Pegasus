const pool = require('../db')

exports.getHolidays = async (req, res, next) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear()
    const [rows] = await pool.query(
      'SELECT id, year, month, day, type, name, is_fixed AS isFixed FROM holidays WHERE year = ? ORDER BY month ASC, day ASC',
      [year]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}
