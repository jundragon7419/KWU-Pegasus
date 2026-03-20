const express = require('express')
const cors = require('cors')

const app = express()

// ── 미들웨어 ──────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // Vite 개발 서버
  credentials: true,
}))
app.use(express.json())

// ── 라우터 ────────────────────────────────────────
// TODO: Phase 3에서 라우터 추가
// const authRouter    = require('./routes/auth')
// const noticesRouter = require('./routes/notices')
// const postsRouter   = require('./routes/posts')
// const rosterRouter  = require('./routes/roster')

// app.use('/api/auth',    authRouter)
// app.use('/api/notices', noticesRouter)
// app.use('/api/posts',   postsRouter)
// app.use('/api/roster',  rosterRouter)

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
  console.error(err.stack)
  res.status(500).json({ message: '서버 오류가 발생했습니다.' })
})

module.exports = app
