const pool = require('../db')

exports.getUser = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT username, authority AS role FROM users WHERE username = ?',
      [req.params.username]
    )
    if (rows.length === 0) return res.status(404).json({ message: '존재하지 않거나 탈퇴한 유저입니다.' })
    res.json(rows[0])
  } catch (err) { next(err) }
}

async function findUser(username) {
  const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
  return rows[0] ?? null
}

exports.getUserLogs = async (req, res, next) => {
  try {
    const user = await findUser(req.params.username)
    if (!user) return res.status(404).json({ message: '존재하지 않거나 탈퇴한 유저입니다.' })
    const [rows] = await pool.query(
      `SELECT id, action, target_type AS targetType, target_id AS targetId,
              snapshot, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at
       FROM activity_logs WHERE user_id = ? ORDER BY id DESC`,
      [user.id]
    )
    res.json(rows.map(r => ({
      ...r,
      snapshot: r.snapshot
        ? (typeof r.snapshot === 'string' ? JSON.parse(r.snapshot) : r.snapshot)
        : null,
    })))
  } catch (err) { next(err) }
}

exports.getUserPosts = async (req, res, next) => {
  try {
    const user = await findUser(req.params.username)
    if (!user) return res.status(404).json({ message: '존재하지 않거나 탈퇴한 유저입니다.' })

    const [rows] = await pool.query(
      `SELECT p.id, p.type, p.title, p.views,
              DATE_FORMAT(p.date, '%Y-%m-%d') AS date
       FROM posts p
       WHERE p.user_id = ?
       ORDER BY p.id DESC`,
      [user.id]
    )
    res.json(rows)
  } catch (err) { next(err) }
}

exports.getUserComments = async (req, res, next) => {
  try {
    const user = await findUser(req.params.username)
    if (!user) return res.status(404).json({ message: '존재하지 않거나 탈퇴한 유저입니다.' })

    const [rows] = await pool.query(
      `SELECT c.id, c.post_id, c.content,
              p.title AS post_title, p.type AS post_type,
              DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i') AS created_at
       FROM comments c
       JOIN posts p ON c.post_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [user.id]
    )
    res.json(rows)
  } catch (err) { next(err) }
}
