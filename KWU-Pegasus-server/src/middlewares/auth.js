const jwt = require('jsonwebtoken')
const pool = require('../db')

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: '로그인이 필요합니다.' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const [rows] = await pool.query(
      'SELECT id, username, authority AS role, staff_type, ob_yb, membership_status FROM users WHERE id = ?',
      [decoded.id]
    )
    if (rows.length === 0) return res.status(401).json({ message: '유효하지 않은 토큰입니다.' })

    const user = rows[0]
    if (user.membership_status === 'banned') {
      return res.status(403).json({ message: '차단된 계정입니다. 관리자에게 문의하세요.' })
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: '권한이 없습니다.' })
    }
    next()
  }
}

module.exports = { authenticate, requireRole }
