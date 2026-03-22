const pool = require('../db')

// 승인 대기 목록 조회 (staff 이상)
exports.getPendingUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, ob_yb, created_at FROM users WHERE status = ? ORDER BY created_at ASC',
      ['pending']
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// 회원가입 승인 (staff 이상)
exports.approveUser = async (req, res, next) => {
  try {
    await pool.query('UPDATE users SET status = ? WHERE id = ?', ['active', req.params.id])
    res.json({ message: '승인 완료' })
  } catch (err) {
    next(err)
  }
}

// 회원가입 거부 (staff 이상)
exports.rejectUser = async (req, res, next) => {
  try {
    await pool.query('UPDATE users SET status = ? WHERE id = ?', ['rejected', req.params.id])
    res.json({ message: '거부 완료' })
  } catch (err) {
    next(err)
  }
}

// 전체 유저 목록 (staff 이상)
exports.getUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, ob_yb, role, staff_type, status, created_at FROM users ORDER BY created_at ASC'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// 활성 로스터 연도 변경 (staff 이상)
exports.setRosterYear = async (req, res, next) => {
  try {
    const { year } = req.body
    if (!year || isNaN(parseInt(year))) {
      return res.status(400).json({ message: '유효한 연도를 입력해주세요.' })
    }
    await pool.query(
      "INSERT INTO settings (`key`, `value`) VALUES ('active_roster_year', ?) ON DUPLICATE KEY UPDATE `value` = ?",
      [String(year), String(year)]
    )
    res.json({ message: '활성 로스터 연도 변경 완료', year: parseInt(year) })
  } catch (err) {
    next(err)
  }
}

// 권한 변경
// staff 지정 → root만 가능
// manager 지정 → staff 이상 가능
exports.setRole = async (req, res, next) => {
  try {
    const { role, staff_type } = req.body
    const requestorRole = req.user.role

    if (role === 'staff' && requestorRole !== 'root') {
      return res.status(403).json({ message: 'staff 권한은 root만 지정할 수 있습니다.' })
    }
    if (role === 'root') {
      return res.status(403).json({ message: 'root 권한은 변경할 수 없습니다.' })
    }

    const newStaffType = role === 'staff' ? (staff_type ?? null) : null
    await pool.query(
      'UPDATE users SET role = ?, staff_type = ? WHERE id = ?',
      [role, newStaffType, req.params.id]
    )
    res.json({ message: '권한 변경 완료' })
  } catch (err) {
    next(err)
  }
}
