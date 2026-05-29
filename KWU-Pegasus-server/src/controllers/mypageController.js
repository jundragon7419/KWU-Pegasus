const pool = require('../db')
const { STUDENT_ID_REGEX } = require('../lib/constants')
const { getUserById } = require('../lib/userQuery')

// 내 정보 조회
exports.getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id)
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

// 프로필 수정 (실명, 학번, OB/YB) — membership_status=none 일 때만 가능
exports.updateProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT membership_status FROM users WHERE id = ?',
      [req.user.id]
    )
    if (!['none', 'rejected'].includes(rows[0].membership_status)) {
      return res.status(400).json({ message: '멤버 신청 이후에는 프로필을 수정할 수 없습니다.' })
    }

    const { name, student_id, ob_yb } = req.body
    if (!name || !ob_yb) {
      return res.status(400).json({ message: '이름과 OB/YB를 입력해주세요.' })
    }
    if (student_id && !STUDENT_ID_REGEX.test(student_id)) {
      return res.status(400).json({ message: '학번은 10자리 숫자여야 합니다.' })
    }

    await pool.query(
      'UPDATE users SET name = ?, student_id = ?, ob_yb = ? WHERE id = ?',
      [name, student_id || null, ob_yb, req.user.id]
    )
    res.json({ message: '프로필이 저장됐습니다.' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 등록된 학번입니다.' })
    }
    next(err)
  }
}

// 로스터 이력 조회 (student_id 매칭)
exports.getRosterHistory = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.year, r.number, r.role AS roster_role
       FROM roster r
       JOIN users u ON u.student_id = r.student_id
       WHERE u.id = ?
       ORDER BY r.year ASC`,
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// 아이디 중복 확인
exports.checkUsername = async (req, res, next) => {
  try {
    const { username } = req.query
    if (!username) return res.status(400).json({ message: '아이디를 입력해주세요.' })
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, req.user.id]
    )
    res.json({ available: rows.length === 0 })
  } catch (err) { next(err) }
}

// 이메일 중복 확인
exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.query
    if (!email) return res.status(400).json({ message: '이메일을 입력해주세요.' })
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    )
    res.json({ available: rows.length === 0 })
  } catch (err) { next(err) }
}

// 계정 정보 수정 (username, email, phone)
exports.updateAccount = async (req, res, next) => {
  try {
    const { username, email, phone, phone_country } = req.body
    if (!username || !email) {
      return res.status(400).json({ message: '아이디와 이메일은 필수입니다.' })
    }
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(username)) {
      return res.status(400).json({ message: '아이디는 영문 대/소문자, 숫자, _ 만 사용 가능하며 15자 이하여야 합니다.' })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '이메일 형식이 올바르지 않습니다.' })
    }
    const digitsOnly = phone ? phone.replace(/\D/g, '') : ''
    if (digitsOnly && !/^\d{7,15}$/.test(digitsOnly)) {
      return res.status(400).json({ message: '전화번호 형식이 올바르지 않습니다.' })
    }
    await pool.query(
      'UPDATE users SET username = ?, email = ?, phone = ?, phone_country = ? WHERE id = ?',
      [username, email, digitsOnly || null, phone_country || '82', req.user.id]
    )
    res.json({ message: '계정 정보가 수정됐습니다.' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const msg = err.message.includes('username') ? '이미 사용 중인 아이디입니다.' : '이미 사용 중인 이메일입니다.'
      return res.status(409).json({ message: msg })
    }
    next(err)
  }
}

// 멤버 신청 — membership_status=none이고 name이 입력된 경우만 가능
exports.requestMembership = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT membership_status, name, ob_yb FROM users WHERE id = ?',
      [req.user.id]
    )
    const user = rows[0]
    if (user.membership_status === 'pending') {
      return res.status(400).json({ message: '이미 신청 중입니다. 관리자 승인을 기다려주세요.' })
    }
    if (user.membership_status === 'approved') {
      return res.status(400).json({ message: '이미 멤버입니다.' })
    }
    if (!user.name || !user.ob_yb) {
      return res.status(400).json({ message: '먼저 프로필(실명, OB/YB)을 입력해주세요.' })
    }

    await pool.query(
      'UPDATE users SET membership_status = ? WHERE id = ?',
      ['pending', req.user.id]
    )
    res.json({ message: '멤버 신청이 완료됐습니다. 관리자 승인을 기다려주세요.' })
  } catch (err) {
    next(err)
  }
}

