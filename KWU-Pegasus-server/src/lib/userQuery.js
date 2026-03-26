const pool = require('../db')

async function getUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, username, email, name, student_id, ob_yb, authority AS role, staff_type, membership_status, created_at FROM users WHERE id = ?',
    [id]
  )
  return rows[0] ?? null
}

module.exports = { getUserById }
