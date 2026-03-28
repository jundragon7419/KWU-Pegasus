require('dotenv').config()
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

async function runSchema() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })

  const schemaPath = path.join(__dirname, 'sql', 'schema.sql')
  const sql = fs.readFileSync(schemaPath, 'utf8')

  // DROP DATABASE / CREATE DATABASE / USE 구문 제외하고 실행
  const statements = sql
    .split(';')
    .map(s => s.replace(/--[^\n]*/g, '').trim())
    .filter(s => {
      if (!s) return false
      const upper = s.replace(/\s+/g, ' ').trimStart().toUpperCase()
      return !upper.startsWith('DROP DATABASE') &&
             !upper.startsWith('CREATE DATABASE') &&
             !upper.startsWith('USE ')
    })

  for (const stmt of statements) {
    try {
      await conn.execute(stmt)
    } catch (err) {
      // 인덱스 중복 등 무해한 오류는 무시
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log(`인덱스 이미 존재 (무시): ${stmt.trim().slice(0, 60)}`)
      } else {
        console.error(`마이그레이션 오류: ${err.message}`)
        console.error(`구문: ${stmt.trim().slice(0, 100)}`)
      }
    }
  }

  await conn.end()
  console.log('스키마 마이그레이션 완료')
}

runSchema().catch(err => {
  console.error('마이그레이션 실패:', err)
  process.exit(1)
})
