const pool = require('../db')

// ── 멤버 신청 대기 목록 (membership_status=pending)
exports.getPendingMembers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, name, student_id, ob_yb, created_at
       FROM users WHERE membership_status = 'pending' ORDER BY created_at ASC`
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// ── 멤버 신청 승인
exports.approveMember = async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE users SET membership_status = 'approved' WHERE id = ?",
      [req.params.id]
    )
    res.json({ message: '승인 완료' })
  } catch (err) {
    next(err)
  }
}

// ── 멤버 신청 거부
exports.rejectMember = async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE users SET membership_status = 'rejected' WHERE id = ?",
      [req.params.id]
    )
    res.json({ message: '거부 완료' })
  } catch (err) {
    next(err)
  }
}

// ── 영구결번 추가
exports.addRetired = async (req, res, next) => {
  try {
    const { number, name } = req.body
    if (!name || number == null) {
      return res.status(400).json({ message: '번호와 이름을 입력해주세요.' })
    }
    await pool.query(
      'INSERT INTO retired_numbers (number, name) VALUES (?, ?)',
      [parseInt(number), name]
    )
    res.status(201).json({ message: '영구결번 등록 완료' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 등록된 번호입니다.' })
    }
    next(err)
  }
}

// ── 영구결번 전체 조회
exports.getRetired = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT number, name FROM retired_numbers ORDER BY number ASC')
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// ── 영구결번 삭제
exports.deleteRetired = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM retired_numbers WHERE number = ?', [req.params.number])
    res.json({ message: '삭제 완료' })
  } catch (err) {
    next(err)
  }
}

// ── 로스터 조회 (관리용, 연도 지정) — users.student_id와 매칭해 username 표시
exports.getRosterAdmin = async (req, res, next) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : null
    if (!year) return res.status(400).json({ message: '연도를 지정해주세요.' })
    const [rows] = await pool.query(
      `SELECT r.year, r.number, r.name, r.student_id, r.role,
              u.username
       FROM roster r
       LEFT JOIN users u ON u.student_id = r.student_id
       WHERE r.year = ?
       ORDER BY r.number ASC`,
      [year]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// ── 로스터 항목 추가
exports.addRosterEntry = async (req, res, next) => {
  try {
    const { year, number, name, student_id, role } = req.body
    if (!year || number == null || !name || !student_id || !role) {
      return res.status(400).json({ message: '모든 항목을 입력해주세요.' })
    }
    if (!/^\d{10}$/.test(student_id)) {
      return res.status(400).json({ message: '학번은 10자리 숫자여야 합니다.' })
    }
    const validRoles = ['coach', 'president', 'player']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: '유효한 역할을 선택해주세요.' })
    }
    await pool.query(
      'INSERT INTO roster (year, number, name, student_id, role) VALUES (?, ?, ?, ?, ?)',
      [parseInt(year), parseInt(number), name, student_id, role]
    )
    res.status(201).json({ message: '등록 완료' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '해당 연도에 이미 사용 중인 번호 또는 학번입니다.' })
    }
    next(err)
  }
}

// ── 로스터 항목 삭제
exports.deleteRosterEntry = async (req, res, next) => {
  try {
    const { year, number } = req.params
    await pool.query('DELETE FROM roster WHERE year = ? AND number = ?', [year, number])
    res.json({ message: '삭제 완료' })
  } catch (err) {
    next(err)
  }
}

// ── 로스터 항목 수정
exports.updateRosterEntry = async (req, res, next) => {
  try {
    const { year, number } = req.params
    const { newNumber, name, student_id, role } = req.body
    if (student_id && !/^\d{10}$/.test(student_id)) {
      return res.status(400).json({ message: '학번은 10자리 숫자여야 합니다.' })
    }
    await pool.query(
      'UPDATE roster SET number = ?, name = ?, student_id = ?, role = ? WHERE year = ? AND number = ?',
      [parseInt(newNumber), name, student_id, role, parseInt(year), parseInt(number)]
    )
    res.json({ message: '수정 완료' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 사용 중인 번호 또는 학번입니다.' })
    }
    next(err)
  }
}

// ── 전체 유저 목록 (로스터 연동: student_id 기준)
exports.getUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.name, u.email, u.ob_yb, u.role, u.manager_type, u.membership_status, u.created_at,
              r.year AS roster_year, r.number AS roster_number
       FROM users u
       LEFT JOIN roster r ON r.student_id = u.student_id
       ORDER BY u.created_at ASC`
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// ── 권한 변경 (root만 가능)
exports.setRole = async (req, res, next) => {
  try {
    const { role, manager_type } = req.body

    if (!['normal', 'manager', 'root'].includes(role)) {
      return res.status(400).json({ message: '유효하지 않은 권한입니다.' })
    }
    if (role === 'manager' && !['president', 'coach', 'manager'].includes(manager_type)) {
      return res.status(400).json({ message: '관리자 직함을 선택해주세요.' })
    }

    const newManagerType = role === 'manager' ? manager_type : null
    await pool.query(
      'UPDATE users SET role = ?, manager_type = ? WHERE id = ?',
      [role, newManagerType, req.params.id]
    )
    res.json({ message: '권한 변경 완료' })
  } catch (err) {
    next(err)
  }
}

// ── 활성 로스터 연도 변경
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
