const pool = require('../db')
const { STUDENT_ID_REGEX, ROSTER_ROLES, USER_ROLES, STAFF_TYPES } = require('../lib/constants')

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
      "UPDATE users SET membership_status = 'approved', authority = 'member' WHERE id = ? AND authority = 'basic'",
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
    if (!STUDENT_ID_REGEX.test(student_id)) {
      return res.status(400).json({ message: '학번은 10자리 숫자여야 합니다.' })
    }
    if (!ROSTER_ROLES.includes(role)) {
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
    if (student_id && !STUDENT_ID_REGEX.test(student_id)) {
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


// ── 멤버/매니저/스태프 목록 (로스터 연동)
exports.getOrgMembers = async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.name, u.ob_yb, u.authority, u.staff_type, u.membership_status, u.created_at,
              r.year AS roster_year, r.number AS roster_number
       FROM users u
       LEFT JOIN roster r ON r.student_id = u.student_id
         AND r.year = (SELECT MAX(r2.year) FROM roster r2 WHERE r2.student_id = u.student_id)
       WHERE u.authority IN ('staff', 'manager', 'member')
       ORDER BY u.created_at ASC`
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// ── 멤버 강등 (authority='member' → 'basic', membership_status='none')
exports.demoteMember = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT authority FROM users WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' })
    if (rows[0].authority !== 'member') {
      return res.status(400).json({ message: '멤버만 강등할 수 있습니다.' })
    }
    await pool.query(
      "UPDATE users SET authority = 'basic', membership_status = 'none', name = NULL, student_id = NULL, ob_yb = NULL WHERE id = ?",
      [req.params.id]
    )
    res.json({ message: '회원 강등 완료' })
  } catch (err) {
    next(err)
  }
}

// ── 일반 유저 목록 (authority='basic', 차단 제외)
exports.getBasicUsers = async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, authority, created_at FROM users WHERE authority = 'basic' AND membership_status != 'banned' ORDER BY created_at ASC`
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// ── 계정 차단 (membership_status = 'banned')
exports.banUser = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT authority FROM users WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' })
    await pool.query("UPDATE users SET membership_status = 'banned' WHERE id = ?", [req.params.id])
    res.json({ message: '계정이 차단되었습니다.' })
  } catch (err) {
    next(err)
  }
}

// ── 멤버 목록 (staff/root용, 매니저 임명에 사용)
exports.getMembers = async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, name, ob_yb, authority, created_at FROM users WHERE authority = 'member' ORDER BY created_at ASC`
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// ── 현재 매니저 목록 (staff/root용)
exports.getManagers = async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, name, ob_yb, authority, created_at FROM users WHERE authority = 'manager' ORDER BY username ASC`
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// ── 현재 스태프 목록 (root용)
exports.getStaffs = async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, name, ob_yb, staff_type, authority, created_at FROM users WHERE authority = 'staff'
       ORDER BY FIELD(staff_type, 'president', 'headcoach'), username ASC`
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

// ── 스태프 임명 (root가 member/manager → staff로 승격)
exports.setStaff = async (req, res, next) => {
  try {
    const { staff_type } = req.body
    if (!STAFF_TYPES.includes(staff_type)) {
      return res.status(400).json({ message: '스태프 직함을 선택해주세요.' })
    }
    const [rows] = await pool.query(
      'SELECT authority FROM users WHERE id = ?',
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' })
    if (!['member', 'manager'].includes(rows[0].authority)) {
      return res.status(400).json({ message: '멤버 또는 매니저만 스태프로 임명할 수 있습니다.' })
    }
    await pool.query(
      "UPDATE users SET authority = 'staff', staff_type = ? WHERE id = ?",
      [staff_type, req.params.id]
    )
    res.json({ message: '스태프 임명 완료' })
  } catch (err) {
    next(err)
  }
}

// ── 매니저 해제 (staff/root가 manager → member로 강등)
exports.unsetManager = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT authority FROM users WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' })
    if (rows[0].authority !== 'manager') {
      return res.status(400).json({ message: '매니저만 해제할 수 있습니다.' })
    }
    await pool.query("UPDATE users SET authority = 'member' WHERE id = ?", [req.params.id])
    res.json({ message: '매니저 해제 완료' })
  } catch (err) {
    next(err)
  }
}

// ── 스태프 해제 (root가 staff → member로 강등)
exports.unsetStaff = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT authority FROM users WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' })
    if (rows[0].authority !== 'staff') {
      return res.status(400).json({ message: '스태프만 해제할 수 있습니다.' })
    }
    await pool.query("UPDATE users SET authority = 'member', staff_type = NULL WHERE id = ?", [req.params.id])
    res.json({ message: '스태프 해제 완료' })
  } catch (err) {
    next(err)
  }
}

// ── 매니저 임명 (staff/root가 member → manager로 승격)
exports.setManager = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT authority FROM users WHERE id = ?',
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' })
    if (rows[0].authority !== 'member') {
      return res.status(400).json({ message: '멤버만 매니저로 임명할 수 있습니다.' })
    }
    await pool.query(
      "UPDATE users SET authority = 'manager' WHERE id = ?",
      [req.params.id]
    )
    res.json({ message: '매니저 임명 완료' })
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
      "INSERT INTO settings (setting_key, setting_val) VALUES ('active_roster_year', ?) ON DUPLICATE KEY UPDATE setting_val = ?",
      [String(year), String(year)]
    )
    res.json({ message: '활성 로스터 연도 변경 완료', year: parseInt(year) })
  } catch (err) {
    next(err)
  }
}
