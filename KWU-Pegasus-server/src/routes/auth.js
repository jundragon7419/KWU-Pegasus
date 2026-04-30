const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { signup, login, me } = require('../controllers/authController')
const { authenticate } = require('../middlewares/auth')

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

module.exports = router
