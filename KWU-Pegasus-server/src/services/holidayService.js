const pool = require('../db')

const API_BASE = 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo'

async function syncHolidaysFromAPI(year) {
  const key = process.env.ANNIVERSARY_OPEN_API
  const url = `${API_BASE}?ServiceKey=${encodeURIComponent(key)}&solYear=${year}&numOfRows=50&_type=json`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`API 요청 실패: ${res.status}`)

  const data = await res.json()
  const raw = data?.response?.body?.items?.item

  if (!raw) return 0

  const items = Array.isArray(raw) ? raw : [raw]
  const holidays = items.filter(item => item.isHoliday === 'Y')

  await pool.query('DELETE FROM holidays WHERE year = ?', [year])

  if (holidays.length > 0) {
    const values = holidays.map(item => {
      const dateStr = String(item.locdate)
      const month = parseInt(dateStr.substring(4, 6))
      const day   = parseInt(dateStr.substring(6, 8))
      return [year, month, day, 'holiday', item.dateName]
    })
    await pool.query(
      'INSERT INTO holidays (year, month, day, type, name) VALUES ?',
      [values]
    )
  }

  return holidays.length
}

module.exports = { syncHolidaysFromAPI }
