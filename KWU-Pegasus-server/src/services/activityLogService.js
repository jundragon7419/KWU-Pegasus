const pool = require('../db')

async function log(userId, action, targetType, targetId, snapshot) {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, target_type, target_id, snapshot) VALUES (?, ?, ?, ?, ?)',
      [userId, action, targetType, targetId ?? null, snapshot ? JSON.stringify(snapshot) : null]
    )
  } catch (err) {
    console.error('[ActivityLog] 기록 실패:', err.message)
    // 로그 실패가 메인 동작을 막지 않도록 throw 하지 않음
  }
}

module.exports = { log }
