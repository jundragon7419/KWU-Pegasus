const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../db')

// 회원가입 신청
exports.signup = async (req, res, next) => {
  try {
    const { username, password, email, ob_yb } = req.body

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    )
    if (existing.length > 0) {
      return res.status(409).json({ message: '이미 사용 중인 아이디 또는 이메일입니다.' })
    }

    const hashed = await bcrypt.hash(password, 10)
    await pool.query(
      'INSERT INTO users (username, password, email, ob_yb) VALUES (?, ?, ?, ?)',
      [username, hashed, email, ob_yb]
    )

    res.status(201).json({ message: '회원가입 신청이 완료됐습니다. 관리자 승인 후 로그인할 수 있습니다.' })
  } catch (err) {
    next(err)
  }
}

// 로그인
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body

    const [rows] = await pool.query(
      'SELECT id, username, password, role, staff_type, ob_yb, status FROM users WHERE username = ?',
      [username]
    )
    const user = rows[0]

    if (!user) return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' })
    if (user.status === 'pending') return res.status(403).json({ message: '관리자 승인 대기 중입니다.' })
    if (user.status === 'rejected') return res.status(403).json({ message: '가입이 거부됐습니다.' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' })

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, staff_type: user.staff_type, ob_yb: user.ob_yb },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, username: user.username, role: user.role, staff_type: user.staff_type, ob_yb: user.ob_yb } })
  } catch (err) {
    next(err)
  }
}

// 내 정보 조회
exports.me = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, ob_yb, role, staff_type, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
}
