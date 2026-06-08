const express = require('express')
const router = express.Router()
const { getPoll, getPollByPostId, submitVote, deletePoll } = require('../controllers/pollController')
const { authenticate } = require('../middlewares/auth')
const jwt = require('jsonwebtoken')
const pool = require('../db')

// 선택적 인증 미들웨어
async function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const [rows] = await pool.query(
      'SELECT id, username, authority AS role, staff_type, ob_yb FROM users WHERE id = ?',
      [decoded.id]
    )
    if (rows.length > 0) {
      req.user = rows[0]
    }
  } catch (err) {
    // 토큰이 유효하지 않아도 무시
  }
  next()
}

router.get('/post/:postId', optionalAuth, getPollByPostId)
router.get('/:pollId', optionalAuth, getPoll)
router.post('/:pollId/vote', authenticate, submitVote)
router.delete('/:pollId', authenticate, deletePoll)

module.exports = router
