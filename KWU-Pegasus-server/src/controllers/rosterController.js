const pool = require('../db')

// 활성 로스터 연도 조회
async function getActiveYear() {
  const [rows] = await pool.query(
    "SELECT `value` FROM settings WHERE `key` = 'active_roster_year'"
  )
  return rows.length ? parseInt(rows[0].value) : new Date().getFullYear()
}

// GET /api/roster?year=XXXX — 연도 미지정 시 활성 연도 사용
// 영구결번은 연도 무관하게 항상 포함
exports.getRoster = async (req, res, next) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : await getActiveYear()
    const [rows] = await pool.query(
      `SELECT year, number, name, role, user_id FROM roster WHERE year = ?
       UNION ALL
       SELECT NULL AS year, number, name, 'retired' AS role, NULL AS user_id FROM retired_numbers
       ORDER BY number ASC`,
      [year]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// GET /api/roster/years — 등록된 연도 목록
exports.getRosterYears = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT year FROM roster ORDER BY year DESC'
    )
    res.json(rows.map(r => r.year))
  } catch (err) {
    next(err)
  }
}

// GET /api/roster/active-year — 현재 활성 연도
exports.getActiveYear = async (req, res, next) => {
  try {
    const year = await getActiveYear()
    res.json({ year })
  } catch (err) {
    next(err)
  }
}
