const express = require('express')
const cors = require('cors')

const app = express()

// ── 미들웨어 ──────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// ── 라우터 ────────────────────────────────────────
const rosterRouter   = require('./routes/roster')
const postsRouter    = require('./routes/posts')
const noticesRouter  = require('./routes/notices')
const eventsRouter   = require('./routes/events')
const holidaysRouter = require('./routes/holidays')
const authRouter     = require('./routes/auth')
const adminRouter    = require('./routes/admin')

app.use('/api/roster',   rosterRouter)
app.use('/api/posts',    postsRouter)
app.use('/api/notices',  noticesRouter)
app.use('/api/events',   eventsRouter)
app.use('/api/holidays', holidaysRouter)
app.use('/api/auth',     authRouter)
app.use('/api/admin',    adminRouter)

// ── 헬스체크 ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// ── 404 처리 ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: '존재하지 않는 API입니다.' })
})

// ── 에러 핸들러 ───────────────────────────────────
app.use((err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: '이미 존재하는 데이터입니다.' })
  }
  console.error(err.stack)
  res.status(500).json({ message: '서버 오류가 발생했습니다.' })
})

module.exports = app
