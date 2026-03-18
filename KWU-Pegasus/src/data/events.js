/**
 * 팀 일정 데이터
 * 실제 서버 연동 시 이 파일을 API 호출로 대체할 것
 *
 * type: 'game' | 'training' | 'meeting' | 'anniversary'
 */

export const EVENT_TYPES = {
  game:        { label: '경기',  color: '#6fa3f5' },
  training:    { label: '훈련',  color: '#6dc87a' },
  meeting:     { label: '모임',  color: '#c87adc' },
  anniversary: { label: '기념일', color: '#f5a623' },
}

export const EVENTS = [
  { id: 1,  date: '2026-03-07', type: 'training',    title: '정기 훈련' },
  { id: 2,  date: '2026-03-14', type: 'training',    title: '정기 훈련' },
  { id: 3,  date: '2026-03-15', type: 'meeting',     title: '정기 총회' },
  { id: 4,  date: '2026-03-21', type: 'training',    title: '정기 훈련' },
  { id: 5,  date: '2026-03-22', type: 'game',        title: '연습경기' },
  { id: 6,  date: '2026-03-28', type: 'training',    title: '정기 훈련' },
  { id: 7,  date: '2026-04-04', type: 'training',    title: '정기 훈련' },
  { id: 8,  date: '2026-04-05', type: 'game',        title: '춘계 리그 1차전' },
  { id: 9,  date: '2026-04-11', type: 'training',    title: '정기 훈련' },
  { id: 10, date: '2026-04-12', type: 'game',        title: '춘계 리그 2차전' },
  { id: 11, date: '2026-04-18', type: 'training',    title: '정기 훈련' },
  { id: 12, date: '2026-04-19', type: 'game',        title: '춘계 리그 3차전' },
  { id: 13, date: '2026-04-25', type: 'training',    title: '정기 훈련' },
  { id: 14, date: '2026-04-26', type: 'meeting',     title: '회식' },
  { id: 15, date: '2026-05-02', type: 'training',    title: '정기 훈련' },
  { id: 16, date: '2026-05-09', type: 'training',    title: '정기 훈련' },
  { id: 17, date: '2026-05-10', type: 'game',        title: '연습경기' },
  { id: 18, date: '2026-05-16', type: 'training',    title: '정기 훈련' },
  { id: 19, date: '2026-05-23', type: 'training',    title: '정기 훈련' },
  { id: 20, date: '2026-05-24', type: 'anniversary', title: '창단 기념일' },
  { id: 21, date: '2026-05-30', type: 'training',    title: '정기 훈련' },
  { id: 20, date: '2026-05-30', type: 'anniversary', title: '창단 기념일' },
  { id: 22, date: '2026-06-06', type: 'training',    title: '정기 훈련' },
  { id: 23, date: '2026-06-13', type: 'training',    title: '정기 훈련' },
  { id: 24, date: '2026-06-14', type: 'game',        title: '하계 리그 1차전' },
  { id: 25, date: '2026-06-20', type: 'training',    title: '정기 훈련' },
  { id: 26, date: '2026-06-21', type: 'game',        title: '하계 리그 2차전' },
  { id: 27, date: '2026-06-27', type: 'training',    title: '정기 훈련' },
  { id: 28, date: '2026-06-28', type: 'meeting',     title: '상반기 총회' },
]

/**
 * 특정 날짜의 이벤트 목록 반환
 * @param {string} dateStr - 'YYYY-MM-DD' 형식
 */
export function getEvents(dateStr) {
  return EVENTS.filter(e => e.date === dateStr)
}

/**
 * 특정 연월의 이벤트를 날짜별 Map으로 반환
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {Map<string, Event[]>}  key: 'DD' (두 자리)
 */
export function getEventMap(year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`
  const map = new Map()
  for (const e of EVENTS) {
    if (e.date.startsWith(prefix)) {
      const day = e.date.slice(8)
      if (!map.has(day)) map.set(day, [])
      map.get(day).push(e)
    }
  }
  return map
}
