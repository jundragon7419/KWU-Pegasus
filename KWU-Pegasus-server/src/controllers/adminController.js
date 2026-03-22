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

// ── 멤버 신청 승인 (role 지정 + membership_status=approved)
exports.approveMember = async (req, res, next) => {
  try {
    const { role, staff_type } = req.body
    const requestorRole = req.user.role
    const validRoles = requestorRole === 'root'
      ? ['player', 'manager', 'staff']
      : ['player', 'manager']

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: '유효하지 않은 권한입니다.' })
    }
    if (role === 'staff' && requestorRole !== 'root') {
      return res.status(403).json({ message: 'staff 권한은 root만 지정할 수 있습니다.' })
    }

    const newStaffType = role === 'staff' ? (staff_type ?? null) : null
    await pool.query(
      "UPDATE users SET membership_status = 'approved', role = ?, staff_type = ? WHERE id = ?",
      [role, newStaffType, req.params.id]
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

// ── 로스터 신청 대기 목록
exports.getPendingRosterRequests = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT rr.id, rr.year, rr.created_at,
              u.id AS user_id, u.username, u.name, u.role AS user_role
       FROM roster_requests rr
       JOIN users u ON rr.user_id = u.id
       WHERE rr.status = 'pending'
       ORDER BY rr.created_at ASC`
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// ── 로스터 신청 승인 (등번호 지정 → roster 삽입)
exports.approveRosterRequest = async (req, res, next) => {
  try {
    const { number, role } = req.body
    const requestId = req.params.id

    if (number == null || isNaN(parseInt(number))) {
      return res.status(400).json({ message: '등번호를 입력해주세요.' })
    }
    const validRoles = ['coach', 'president', 'player']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: '유효한 역할을 선택해주세요.' })
    }

    const [reqRows] = await pool.query(
      'SELECT user_id, year FROM roster_requests WHERE id = ?',
      [requestId]
    )
    if (reqRows.length === 0) return res.status(404).json({ message: '신청을 찾을 수 없습니다.' })
    const { user_id, year } = reqRows[0]

    const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [user_id])
    if (userRows.length === 0) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' })
    const name = userRows[0].name

    await pool.query(
      'INSERT INTO roster (year, number, name, role, user_id) VALUES (?, ?, ?, ?, ?)',
      [year, parseInt(number), name, role, user_id]
    )
    await pool.query(
      "UPDATE roster_requests SET status = 'approved' WHERE id = ?",
      [requestId]
    )
    res.json({ message: '로스터 등록 완료' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '해당 연도에 이미 등록된 번호입니다.' })
    }
    next(err)
  }
}

// ── 로스터 신청 거부
exports.rejectRosterRequest = async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE roster_requests SET status = 'rejected' WHERE id = ?",
      [req.params.id]
    )
    res.json({ message: '거부 완료' })
  } catch (err) {
    next(err)
  }
}

// ── 영구결번 추가 (연도 무관)
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

// ── 로스터 조회 (관리용, 연도 지정)
exports.getRosterAdmin = async (req, res, next) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : null
    if (!year) return res.status(400).json({ message: '연도를 지정해주세요.' })
    const [rows] = await pool.query(
      'SELECT year, number, name, role, user_id FROM roster WHERE year = ? ORDER BY number ASC',
      [year]
    )
    res.json(rows)
  } catch (err) {
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

// ── 로스터 항목 수정 (등번호, 역할)
exports.updateRosterEntry = async (req, res, next) => {
  try {
    const { year, number } = req.params
    const { newNumber, role } = req.body
    await pool.query(
      'UPDATE roster SET number = ?, role = ? WHERE year = ? AND number = ?',
      [parseInt(newNumber), role, parseInt(year), parseInt(number)]
    )
    res.json({ message: '수정 완료' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 사용 중인 번호입니다.' })
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

// ── 전체 유저 목록
exports.getUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, name, email, ob_yb, role, staff_type, membership_status, created_at FROM users ORDER BY created_at ASC'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// ── 권한 변경 (staff 지정은 root만)
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
