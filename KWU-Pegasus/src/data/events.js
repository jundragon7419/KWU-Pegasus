/**
 * 팀 일정 데이터
 * 실제 서버 연동 시 이 파일을 API 호출로 대체할 것
 *
 * 형식: { month, day, type, name }
 * type: 'game' | 'training' | 'meeting' | 'anniversary'
 */

export const EVENT_TYPES = {
  game:        { label: '경기',  color: '#6fa3f5' },
  training:    { label: '훈련',  color: '#6dc87a' },
  meeting:     { label: '모임',  color: '#c87adc' },
  anniversary: { label: '기념일', color: '#f5a623' },
}

export const EVENTS = {
  2026: [
    { month: 3,  day: 7,  type: 'training',    name: '정기 훈련' },
    { month: 3,  day: 14, type: 'training',    name: '정기 훈련' },
    { month: 3,  day: 15, type: 'meeting',     name: '정기 총회' },
    { month: 3,  day: 21, type: 'training',    name: '정기 훈련' },
    { month: 3,  day: 22, type: 'game',        name: '연습경기' },
    { month: 3,  day: 28, type: 'training',    name: '정기 훈련' },
    { month: 4,  day: 4,  type: 'training',    name: '정기 훈련' },
    { month: 4,  day: 5,  type: 'game',        name: '춘계 리그 1차전' },
    { month: 4,  day: 11, type: 'training',    name: '정기 훈련' },
    { month: 4,  day: 12, type: 'game',        name: '춘계 리그 2차전' },
    { month: 4,  day: 18, type: 'training',    name: '정기 훈련' },
    { month: 4,  day: 19, type: 'game',        name: '춘계 리그 3차전' },
    { month: 4,  day: 25, type: 'training',    name: '정기 훈련' },
    { month: 4,  day: 26, type: 'meeting',     name: '회식' },
    { month: 5,  day: 2,  type: 'training',    name: '정기 훈련' },
    { month: 5,  day: 9,  type: 'training',    name: '정기 훈련' },
    { month: 5,  day: 10, type: 'game',        name: '연습경기' },
    { month: 5,  day: 16, type: 'training',    name: '정기 훈련' },
    { month: 5,  day: 23, type: 'training',    name: '정기 훈련' },
    { month: 5,  day: 24, type: 'anniversary', name: '창단 기념일' },
    { month: 5,  day: 30, type: 'training',    name: '정기 훈련' },
    { month: 6,  day: 6,  type: 'training',    name: '정기 훈련' },
    { month: 6,  day: 13, type: 'training',    name: '정기 훈련' },
    { month: 6,  day: 14, type: 'game',        name: '하계 리그 1차전' },
    { month: 6,  day: 20, type: 'training',    name: '정기 훈련' },
    { month: 6,  day: 21, type: 'game',        name: '하계 리그 2차전' },
    { month: 6,  day: 27, type: 'training',    name: '정기 훈련' },
    { month: 6,  day: 28, type: 'meeting',     name: '상반기 총회' },
  ],
  // ※ 다음 연도 데이터는 일정 확정 후 이곳에 추가할 것
}

/**
 * 특정 연월의 이벤트를 날짜별 Map으로 반환
 * @param {number} year
 * @param {number} month - 0-indexed (JS Date 기준)
 * @returns {Map<string, object[]>} key: 'DD' (두 자리), value: 이벤트 배열
 */
export function getEventMap(year, month) {
  const map = new Map()
  for (const e of (EVENTS[year] || [])) {
    if (e.month === month + 1) {
      const day = String(e.day).padStart(2, '0')
      if (!map.has(day)) map.set(day, [])
      map.get(day).push(e)
    }
  }
  return map
}
