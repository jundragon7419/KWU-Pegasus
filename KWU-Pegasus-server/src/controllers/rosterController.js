const pool = require('../db')

exports.getRoster = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT number, name, role, title FROM roster ORDER BY number ASC'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}
