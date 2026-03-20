/**
 * 한국 공휴일 데이터셋
 *
 * FIXED_HOLIDAYS  : 매년 날짜가 고정된 공휴일
 * VARIABLE_HOLIDAYS: 음력 기반 공휴일 + 대체공휴일 (연도별 관리)
 *
 * ※ 올해(2026)까지 데이터 포함.
 *   다음 연도 데이터는 정부 관보 확정 후 VARIABLE_HOLIDAYS에 추가할 것.
 */

// ─── 고정 공휴일 ────────────────────────────────────────────────
// from: 해당 연도부터 공휴일 적용 (생략 시 2000년부터)
export const FIXED_HOLIDAYS = [
  { month: 1,  day: 1,  type: 'holiday', name: '신정' },
  { month: 3,  day: 1,  type: 'holiday', name: '삼일절' },
  { month: 5,  day: 5,  type: 'holiday', name: '어린이날' },
  { month: 6,  day: 6,  type: 'holiday', name: '현충일' },
  { month: 8,  day: 15, type: 'holiday', name: '광복절' },
  { month: 10, day: 3,  type: 'holiday', name: '개천절' },
  { month: 10, day: 9,  type: 'holiday', name: '한글날', from: 2013 }, // 2013년 공휴일 재지정
  { month: 12, day: 25, type: 'holiday', name: '크리스마스' },
]

// ─── 음력 공휴일 + 대체공휴일 ────────────────────────────────────
// 대체공휴일 제도: 2014년 도입(설날·추석·어린이날)
//                 2021년 확대(삼일절·광복절·개천절·한글날)
//                 2023년 확대(부처님오신날·크리스마스)
export const VARIABLE_HOLIDAYS = {
  2000: [
    { month: 2, day: 4,  type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 5,  type: 'holiday', name: '설날' },
    { month: 2, day: 6,  type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 11, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 11, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 12, type: 'holiday', name: '추석' },
    { month: 9, day: 13, type: 'holiday', name: '추석 연휴' },
  ],
  2001: [
    { month: 1, day: 23, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 24, type: 'holiday', name: '설날' },
    { month: 1, day: 25, type: 'holiday', name: '설날 연휴' },
    { month: 4, day: 30, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 30, type: 'holiday', name: '추석 연휴' },
    { month: 10, day: 1, type: 'holiday', name: '추석' },
    { month: 10, day: 2, type: 'holiday', name: '추석 연휴' },
  ],
  2002: [
    { month: 2, day: 11, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 12, type: 'holiday', name: '설날' },
    { month: 2, day: 13, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 19, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 20, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 21, type: 'holiday', name: '추석' },
    { month: 9, day: 22, type: 'holiday', name: '추석 연휴' },
  ],
  2003: [
    { month: 1, day: 31, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 1,  type: 'holiday', name: '설날' },
    { month: 2, day: 2,  type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 8,  type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 10, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 11, type: 'holiday', name: '추석' },
    { month: 9, day: 12, type: 'holiday', name: '추석 연휴' },
  ],
  2004: [
    { month: 1, day: 21, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 22, type: 'holiday', name: '설날' },
    { month: 1, day: 23, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 26, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 27, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 28, type: 'holiday', name: '추석' },
    { month: 9, day: 29, type: 'holiday', name: '추석 연휴' },
  ],
  2005: [
    { month: 2, day: 8,  type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 9,  type: 'holiday', name: '설날' },
    { month: 2, day: 10, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 15, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 17, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 18, type: 'holiday', name: '추석' },
    { month: 9, day: 19, type: 'holiday', name: '추석 연휴' },
  ],
  2006: [
    { month: 1, day: 28, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 29, type: 'holiday', name: '설날' },
    { month: 1, day: 30, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 5,  type: 'holiday', name: '부처님오신날' }, // 어린이날과 동일
    { month: 10, day: 5, type: 'holiday', name: '추석 연휴' },
    { month: 10, day: 6, type: 'holiday', name: '추석' },
    { month: 10, day: 7, type: 'holiday', name: '추석 연휴' },
  ],
  2007: [
    { month: 2, day: 17, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 18, type: 'holiday', name: '설날' },
    { month: 2, day: 19, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 24, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 24, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 25, type: 'holiday', name: '추석' },
    { month: 9, day: 26, type: 'holiday', name: '추석 연휴' },
  ],
  2008: [
    { month: 2, day: 6,  type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 7,  type: 'holiday', name: '설날' },
    { month: 2, day: 8,  type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 12, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 13, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 14, type: 'holiday', name: '추석' },
    { month: 9, day: 15, type: 'holiday', name: '추석 연휴' },
  ],
  2009: [
    { month: 1, day: 25, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 26, type: 'holiday', name: '설날' },
    { month: 1, day: 27, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 2,  type: 'holiday', name: '부처님오신날' },
    { month: 10, day: 2, type: 'holiday', name: '추석 연휴' },
    { month: 10, day: 3, type: 'holiday', name: '추석' }, // 개천절과 동일
    { month: 10, day: 4, type: 'holiday', name: '추석 연휴' },
  ],
  2010: [
    { month: 2, day: 13, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 14, type: 'holiday', name: '설날' },
    { month: 2, day: 15, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 21, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 21, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 22, type: 'holiday', name: '추석' },
    { month: 9, day: 23, type: 'holiday', name: '추석 연휴' },
  ],
  2011: [
    { month: 2, day: 2,  type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 3,  type: 'holiday', name: '설날' },
    { month: 2, day: 4,  type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 10, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 11, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 12, type: 'holiday', name: '추석' },
    { month: 9, day: 13, type: 'holiday', name: '추석 연휴' },
  ],
  2012: [
    { month: 1, day: 22, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 23, type: 'holiday', name: '설날' },
    { month: 1, day: 24, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 28, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 29, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 30, type: 'holiday', name: '추석' },
    { month: 10, day: 1, type: 'holiday', name: '추석 연휴' },
  ],
  2013: [
    { month: 2, day: 9,  type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 10, type: 'holiday', name: '설날' },
    { month: 2, day: 11, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 17, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 18, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 19, type: 'holiday', name: '추석' },
    { month: 9, day: 20, type: 'holiday', name: '추석 연휴' },
  ],
  2014: [
    { month: 1, day: 30, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 31, type: 'holiday', name: '설날' },
    { month: 2, day: 1,  type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 3,  type: 'holiday', name: '대체공휴일' }, // 설날 연휴(2/1 토) 대체
    { month: 5, day: 6,  type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 7,  type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 8,  type: 'holiday', name: '추석' },
    { month: 9, day: 9,  type: 'holiday', name: '추석 연휴' },
  ],
  2015: [
    { month: 2, day: 18, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 19, type: 'holiday', name: '설날' },
    { month: 2, day: 20, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 25, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 26, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 27, type: 'holiday', name: '추석' },
    { month: 9, day: 28, type: 'holiday', name: '추석 연휴' },
  ],
  2016: [
    { month: 2, day: 7,  type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 8,  type: 'holiday', name: '설날' },
    { month: 2, day: 9,  type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 10, type: 'holiday', name: '대체공휴일' }, // 실제로는 2/10 임시공휴일 지정됨
    { month: 5, day: 14, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 14, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 15, type: 'holiday', name: '추석' },
    { month: 9, day: 16, type: 'holiday', name: '추석 연휴' },
  ],
  2017: [
    { month: 1, day: 27, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 28, type: 'holiday', name: '설날' },
    { month: 1, day: 29, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 3,  type: 'holiday', name: '부처님오신날' },
    { month: 10, day: 3, type: 'holiday', name: '추석 연휴' }, // 개천절과 동일
    { month: 10, day: 4, type: 'holiday', name: '추석' },
    { month: 10, day: 5, type: 'holiday', name: '추석 연휴' },
    { month: 10, day: 6, type: 'holiday', name: '대체공휴일' }, // 추석 연휴(10/3 = 개천절) 대체
  ],
  2018: [
    { month: 2, day: 15, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 16, type: 'holiday', name: '설날' },
    { month: 2, day: 17, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 19, type: 'holiday', name: '대체공휴일' }, // 설날 연휴(2/17 토) 대체
    { month: 5, day: 22, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 23, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 24, type: 'holiday', name: '추석' },
    { month: 9, day: 25, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 26, type: 'holiday', name: '대체공휴일' }, // 실제로는 임시공휴일 9/26 지정
  ],
  2019: [
    { month: 2, day: 4,  type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 5,  type: 'holiday', name: '설날' },
    { month: 2, day: 6,  type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 6,  type: 'holiday', name: '대체공휴일' }, // 어린이날(5/5 일) 대체
    { month: 5, day: 12, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 12, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 13, type: 'holiday', name: '추석' },
    { month: 9, day: 14, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 16, type: 'holiday', name: '대체공휴일' }, // 추석 연휴(9/14 토) 대체
  ],
  2020: [
    { month: 1, day: 24, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 25, type: 'holiday', name: '설날' },
    { month: 1, day: 26, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 27, type: 'holiday', name: '대체공휴일' }, // 설날(1/25 토), 연휴(1/26 일) 대체
    { month: 4, day: 30, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 30, type: 'holiday', name: '추석 연휴' },
    { month: 10, day: 1, type: 'holiday', name: '추석' },
    { month: 10, day: 2, type: 'holiday', name: '추석 연휴' },
  ],
  2021: [
    { month: 2, day: 11, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 12, type: 'holiday', name: '설날' },
    { month: 2, day: 13, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 15, type: 'holiday', name: '대체공휴일' }, // 설날 연휴(2/13 토) 대체
    { month: 5, day: 19, type: 'holiday', name: '부처님오신날' },
    { month: 8, day: 16, type: 'holiday', name: '대체공휴일' }, // 광복절(8/15 일) 대체
    { month: 9, day: 20, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 21, type: 'holiday', name: '추석' },
    { month: 9, day: 22, type: 'holiday', name: '추석 연휴' },
    { month: 10, day: 4, type: 'holiday', name: '대체공휴일' }, // 개천절(10/3 일) 대체
    { month: 10, day: 11, type: 'holiday', name: '대체공휴일' }, // 한글날(10/9 토) 대체
  ],
  2022: [
    { month: 1, day: 31, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 1,  type: 'holiday', name: '설날' },
    { month: 2, day: 2,  type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 8,  type: 'holiday', name: '부처님오신날' },
    { month: 6, day: 1,  type: 'holiday', name: '대체공휴일' },
    { month: 9, day: 9,  type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 10, type: 'holiday', name: '추석' },
    { month: 9, day: 11, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 12, type: 'holiday', name: '대체공휴일' }, // 추석(9/10 토), 연휴(9/11 일) 대체
  ],
  2023: [
    { month: 1, day: 21, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 22, type: 'holiday', name: '설날' },
    { month: 1, day: 23, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 24, type: 'holiday', name: '대체공휴일' }, // 설날 연휴(1/21 토, 1/22 일) 대체
    { month: 5, day: 27, type: 'holiday', name: '부처님오신날' },
    { month: 5, day: 29, type: 'holiday', name: '대체공휴일' }, // 부처님오신날(5/27 토) 대체 (2023년 적용 확대)
    { month: 9, day: 28, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 29, type: 'holiday', name: '추석' },
    { month: 9, day: 30, type: 'holiday', name: '추석 연휴' },
    { month: 10, day: 2, type: 'holiday', name: '대체공휴일' }, // 추석 연휴(9/30 토) 대체
  ],
  2024: [
    { month: 2, day: 9,  type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 10, type: 'holiday', name: '설날' },
    { month: 2, day: 11, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 12, type: 'holiday', name: '대체공휴일' }, // 설날(2/10 토), 연휴(2/11 일) 대체
    { month: 5, day: 6,  type: 'holiday', name: '대체공휴일' }, // 어린이날(5/5 일) 대체
    { month: 5, day: 15, type: 'holiday', name: '부처님오신날' },
    { month: 9, day: 16, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 17, type: 'holiday', name: '추석' },
    { month: 9, day: 18, type: 'holiday', name: '추석 연휴' },
  ],
  2025: [
    { month: 1, day: 28, type: 'holiday', name: '설날 연휴' },
    { month: 1, day: 29, type: 'holiday', name: '설날' },
    { month: 1, day: 30, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 5,  type: 'holiday', name: '부처님오신날' }, // 어린이날과 동일
    { month: 5, day: 6,  type: 'holiday', name: '대체공휴일' }, // 부처님오신날(5/5 월 = 어린이날) 대체
    { month: 10, day: 5, type: 'holiday', name: '추석 연휴' },
    { month: 10, day: 6, type: 'holiday', name: '추석' },
    { month: 10, day: 7, type: 'holiday', name: '추석 연휴' },
    { month: 10, day: 8, type: 'holiday', name: '대체공휴일' }, // 추석 연휴(10/5 일) 대체
  ],
  2026: [
    { month: 2, day: 16, type: 'holiday', name: '설날 연휴' },
    { month: 2, day: 17, type: 'holiday', name: '설날' },
    { month: 2, day: 18, type: 'holiday', name: '설날 연휴' },
    { month: 5, day: 24, type: 'holiday', name: '부처님오신날' },
    { month: 5, day: 25, type: 'holiday', name: '대체공휴일' }, // 부처님오신날(5/24 일) 대체
    { month: 8, day: 17, type: 'holiday', name: '대체공휴일' }, // 광복절(8/15 토) 대체
    { month: 9, day: 24, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 25, type: 'holiday', name: '추석' },
    { month: 9, day: 26, type: 'holiday', name: '추석 연휴' },
    { month: 9, day: 28, type: 'holiday', name: '대체공휴일' }, // 추석 연휴(9/26 토) 대체
    { month: 10, day: 5, type: 'holiday', name: '대체공휴일' }, // 개천절(10/3 토) 대체
  ],
  // ※ 2027년 이후 데이터는 정부 관보 확정 후 이곳에 추가할 것
}

/**
 * 특정 연도의 전체 공휴일을 날짜 키(MM-DD)로 조회할 수 있는 Map 반환
 * @param {number} year
 * @returns {Map<string, string[]>} key: 'MM-DD', value: 공휴일명 배열
 */
export function getHolidayMap(year) {
  const map = new Map()

  const add = (month, day, name) => {
    const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(name)
  }

  for (const h of FIXED_HOLIDAYS) {
    if (h.from && year < h.from) continue
    add(h.month, h.day, h.name)
  }

  for (const h of (VARIABLE_HOLIDAYS[year] || [])) {
    add(h.month, h.day, h.name)
  }

  return map
}
