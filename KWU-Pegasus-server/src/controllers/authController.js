const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../db')
const { getUserById } = require('../lib/userQuery')

// 회원가입 — 즉시 활성화 (아이디 + 비밀번호 + 이메일만)
exports.signup = async (req, res, next) => {
  try {
    const { username, password, email, marketingAgreed, marketingChannels } = req.body
    if (!username || !password || !email) {
      return res.status(400).json({ message: '아이디, 비밀번호, 이메일을 모두 입력해주세요.' })
    }
    if (!/^[a-zA-Z0-9_]{5,15}$/.test(username)) {
      return res.status(400).json({ message: '아이디는 영문 대/소문자, 숫자, _ 만 사용 가능하며 5~15자여야 합니다.' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: '비밀번호가 너무 짧습니다.' })
    }

    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*()_\-=\[\]{};:'",.<>?/\\|]/.test(password)

    const missing = []
    if (!hasLetter) missing.push('영문')
    if (!hasNumber) missing.push('숫자')
    if (!hasSpecial) missing.push('특수문자')

    if (missing.length > 0) {
      const msg = `${missing.join(', ')}${missing.length === 1 ? '이' : '가'} 포함되어야 합니다.`
      return res.status(400).json({ message: msg })
    }

    const [existing] = await pool.query(
      'SELECT username, email, membership_status FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    )
    if (existing.length > 0) {
      const dup = existing[0]
      if (dup.email === email && dup.membership_status === 'banned') {
        return res.status(403).json({ message: '사용할 수 없는 이메일입니다.' })
      }
      return res.status(409).json({ message: '이미 사용 중인 아이디 또는 이메일입니다.' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const marketingEmail = marketingAgreed === true ? 1 : 0
    await pool.query(
      `INSERT INTO users
        (username, password, email, marketing_email, marketing_sms, marketing_kakao, marketing_agreed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        username, hashed, email,
        marketingEmail,
        0,
        0,
        marketingAgreed === true ? new Date() : null,
      ]
    )

    res.status(201).json({ message: '회원가입이 완료됐습니다. 바로 로그인할 수 있습니다.' })
  } catch (err) {
    next(err)
  }
}

// 로그인
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body

    const [rows] = await pool.query(
      'SELECT id, username, password, authority AS role, staff_type, ob_yb, membership_status FROM users WHERE username = ?',
      [username]
    )
    const user = rows[0]

    if (!user) return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' })

    if (user.membership_status === 'banned') {
      return res.status(403).json({ message: '차단된 계정입니다. 관리자에게 문의하세요.' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, staff_type: user.staff_type, ob_yb: user.ob_yb },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        staff_type: user.staff_type,
        ob_yb: user.ob_yb,
        membership_status: user.membership_status,
      },
    })
  } catch (err) {
    next(err)
  }
}

// 내 정보 조회
exports.me = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id)
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    res.json(user)
  } catch (err) {
    next(err)
  }
}
