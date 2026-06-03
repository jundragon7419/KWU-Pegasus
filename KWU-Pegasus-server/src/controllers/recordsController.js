const pool         = require('../db')
const TEAM_ID      = process.env.UNIQUE_PLAY_TEAM_ID      || '3405'
const SUBLEAGUE_ID = process.env.UNIQUE_PLAY_SUBLEAGUE_ID || '842'
const BASE         = 'https://service-api.unique-play.com'

async function getRosterNumbers() {
  const [[setting]] = await pool.query(
    "SELECT setting_val FROM settings WHERE setting_key = 'active_roster_year'"
  )
  const year = setting?.setting_val ?? new Date().getFullYear()
  const [rows] = await pool.query(
    'SELECT name, number FROM roster WHERE year = ?', [year]
  )
  const map = {}
  for (const r of rows) map[r.name] = r.number
  return map
}

function attachNumbers(players, numberMap) {
  return players.map(p => ({
    ...p,
    _number: numberMap[p.user?.name] ?? null,
  }))
}

// FanGraphs 표준 wOBA 가중치
const W = { BB: 0.688, HBP: 0.721, B1: 0.884, B2: 1.261, B3: 1.601, HR: 2.072 }

async function fetchFromAPI(params) {
  const token = process.env.UNIQUE_PLAY_TOKEN
  if (!token) return []
  const res = await fetch(`${BASE}/games/records/ranking?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  return res.json()
}

function calcPA(p) {
  return (p.hab || 0) + (p.hbb || 0) + (p.hhitByPitch || 0) + (p.hsacf || 0) + (p.hsacb || 0)
}

function calcWoba(p) {
  const bb  = Math.max(0, (p.hbb || 0) - (p.hibb || 0))
  const hbp = p.hhitByPitch || 0
  const b1  = p.h1 || 0
  const b2  = p.h2 || 0
  const b3  = p.h3 || 0
  const hr  = p.hr || 0
  const ab  = p.hab || 0
  const sf  = p.hsacf || 0
  const ibb = p.hibb || 0

  const num = W.BB*bb + W.HBP*hbp + W.B1*b1 + W.B2*b2 + W.B3*b3 + W.HR*hr
  const den = ab + (p.hbb || 0) - ibb + sf + hbp
  return den > 0 ? num / den : 0
}

function enrichWithWrcPlus(players, lgPlayers) {
  // 리그 wOBA 계산
  let lgNum = 0, lgDen = 0, lgR = 0, lgPA = 0
  for (const p of lgPlayers) {
    const bb  = Math.max(0, (p.hbb || 0) - (p.hibb || 0))
    const hbp = p.hhitByPitch || 0
    const ibb = p.hibb || 0
    lgNum += W.BB*bb + W.HBP*hbp + W.B1*(p.h1||0) + W.B2*(p.h2||0) + W.B3*(p.h3||0) + W.HR*(p.hr||0)
    lgDen += (p.hab||0) + (p.hbb||0) - ibb + (p.hsacf||0) + hbp
    lgR   += p.r || 0
    lgPA  += calcPA(p)
  }
  const lgWoba    = lgDen > 0 ? lgNum / lgDen : 0.320
  const lgRPA     = lgPA  > 0 ? lgR / lgPA    : 0.115
  const wOBAScale = 1.15  // PF = 1.00 고정

  const RPW = 9.0

  return players.map(p => {
    const pa   = calcPA(p)
    const woba = calcWoba(p)

    const wrcPlus = pa > 0
      ? Math.round(((woba - lgWoba) / wOBAScale + lgRPA) / lgRPA * 100)
      : null

    const battingRuns    = (woba - lgWoba) / wOBAScale * pa
    const baseRunning    = (p.sb  || 0) * 0.2 - (p.sbo || 0) * 0.4
    const replacementAdj = 20 * (pa / 600)
    const owar = pa > 0
      ? +((battingRuns + baseRunning + replacementAdj) / RPW).toFixed(3)
      : null

    return { ...p, _woba: +woba.toFixed(3), _wrcPlus: wrcPlus, _owar: owar }
  })
}

exports.getBatting = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear()

    const [team, league] = await Promise.all([
      fetchFromAPI(new URLSearchParams({
        teamId: TEAM_ID, orderBy: 'havg', orderDir: 'desc',
        pageNo: 0, batter: true, subLeagueId: SUBLEAGUE_ID,
        seasonYear: year, regulatedIn: true,
      })),
      fetchFromAPI(new URLSearchParams({
        orderBy: 'havg', orderDir: 'desc',
        pageNo: 0, batter: true, subLeagueId: SUBLEAGUE_ID,
        seasonYear: year, regulatedIn: false,
      })),
    ])

    const lgPlayers  = league.length > 0 ? league : team
    const numberMap  = await getRosterNumbers()
    res.json(attachNumbers(enrichWithWrcPlus(team, lgPlayers), numberMap))
  } catch (err) { next(err) }
}

function parseIP(s) {
  const [full, outs = '0'] = String(s).split('.')
  return parseInt(full) + parseInt(outs) / 3
}

function calcFIP(pitchers, lgPitchers) {
  // 리그 FIP 상수 계산
  let lgER = 0, lgIP = 0, lgHR = 0, lgBB = 0, lgHBP = 0, lgK = 0
  for (const p of lgPitchers) {
    const ip = parseIP(p.innings)
    if (ip <= 0) continue
    lgER  += p.er || 0
    lgIP  += ip
    lgHR  += p.phr || 0
    lgBB  += (p.pbb || 0) - (p.pibb || 0)
    lgHBP += p.phitByPitch || 0
    lgK   += p.so || 0
  }
  const lgERA  = lgIP > 0 ? (lgER / lgIP) * 9 : 4.00
  const lgFIPcore = lgIP > 0 ? (13*lgHR + 3*(lgBB+lgHBP) - 2*lgK) / lgIP : 0
  const cFIP = lgERA - lgFIPcore

  const RPW = 9.0
  const REPLACEMENT_ADJ = 1.5

  return pitchers.map(p => {
    const ip = parseIP(p.innings)
    if (ip <= 0) return { ...p, _fip: null, _pwar: null }
    const bb   = (p.pbb || 0) - (p.pibb || 0)
    const fip  = (13*(p.phr||0) + 3*(bb+(p.phitByPitch||0)) - 2*(p.so||0)) / ip + cFIP
    const pwar = +((lgERA - fip + REPLACEMENT_ADJ) * ip / 9 / RPW).toFixed(3)
    return { ...p, _fip: +fip.toFixed(2), _pwar: pwar }
  })
}

exports.getPitching = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear()
    const [team, league] = await Promise.all([
      fetchFromAPI(new URLSearchParams({
        teamId: TEAM_ID, orderBy: 'era', orderDir: 'asc',
        pageNo: 0, batter: false, subLeagueId: SUBLEAGUE_ID,
        seasonYear: year, regulatedIn: true,
      })),
      fetchFromAPI(new URLSearchParams({
        orderBy: 'era', orderDir: 'asc',
        pageNo: 0, batter: false, subLeagueId: SUBLEAGUE_ID,
        seasonYear: year, regulatedIn: true,
      })),
    ])
    const lgPitchers = league.length > 0 ? league : team
    const numberMap  = await getRosterNumbers()
    res.json(attachNumbers(calcFIP(team, lgPitchers), numberMap))
  } catch (err) { next(err) }
}
