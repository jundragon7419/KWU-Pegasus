const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { signup, login, me } = require('../controllers/authController')
const { authenticate } = require('../middlewares/auth')
const { sendVerificationCode, verifyCode } = require('../services/emailService')
const pool = require('../db')

const signupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: '잠시 후 다시 시도해주세요. (10분 후 재시도 가능)' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/signup', signupLimiter, signup)
router.post('/login',  login)
router.get('/me',      authenticate, me)

router.get('/check-username', async (req, res) => {
  const { username } = req.query
  if (!username) return res.status(400).json({ message: '아이디를 입력해주세요.' })
  const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
  res.json({ available: rows.length === 0 })
})

router.get('/check-email', async (req, res) => {
  const { email } = req.query
  if (!email) return res.status(400).json({ message: '이메일을 입력해주세요.' })
  const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
  res.json({ available: rows.length === 0 })
})

router.post('/send-email-code', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: '이메일을 입력해주세요.' })

  const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
  if (rows.length > 0) return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' })

  try {
    await sendVerificationCode(email)
    res.json({ message: '인증번호가 발송되었습니다.' })
  } catch (err) {
    console.error('[Email] 발송 실패:', err.message)
    res.status(500).json({ message: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' })
  }
})

router.post('/verify-email-code', (req, res) => {
  const { email, code } = req.body
  if (!email || !code) return res.status(400).json({ message: '이메일과 인증번호를 입력해주세요.' })
  const result = verifyCode(email, code)
  if (!result.ok) return res.status(400).json({ message: result.message })
  res.json({ message: '이메일 인증이 완료되었습니다.' })
})

module.exports = router
