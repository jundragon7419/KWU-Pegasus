const pool = require('../db')

// 내 정보 조회
exports.getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, name, student_id, ob_yb, role, manager_type, membership_status, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    res.json(rows[0])
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
    if (rows[0].membership_status !== 'none') {
      return res.status(400).json({ message: '멤버 신청 이후에는 프로필을 수정할 수 없습니다.' })
    }

    const { name, student_id, ob_yb } = req.body
    if (!name || !ob_yb) {
      return res.status(400).json({ message: '이름과 OB/YB를 입력해주세요.' })
    }
    if (student_id && !/^\d{10}$/.test(student_id)) {
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

// 멤버 신청 — membership_status=none이고 name이 입력된 경우만 가능
exports.requestMembership = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT membership_status, name FROM users WHERE id = ?',
      [req.user.id]
    )
    const user = rows[0]
    if (user.membership_status !== 'none') {
      return res.status(400).json({ message: '이미 신청했거나 처리된 상태입니다.' })
    }
    if (!user.name) {
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

