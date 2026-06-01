const pool = require('../db')
const { syncHolidaysFromAPI } = require('../services/holidayService')

exports.getHolidays = async (req, res, next) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear()

    let [rows] = await pool.query(
      'SELECT id, year, month, day, type, name FROM holidays WHERE year = ? ORDER BY month ASC, day ASC',
      [year]
    )

    if (rows.length === 0) {
      await syncHolidaysFromAPI(year)
      ;[rows] = await pool.query(
        'SELECT id, year, month, day, type, name FROM holidays WHERE year = ? ORDER BY month ASC, day ASC',
        [year]
      )
    }

    res.json(rows)
  } catch (err) {
    next(err)
  }
}
