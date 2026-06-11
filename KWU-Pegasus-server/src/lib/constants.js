const STUDENT_ID_REGEX = /^\d{10}$/

const ROSTER_ROLES = ['roster_headcoach', 'roster_president', 'roster_player', 'roster_retired', 'roster_manager']

const STAFF_TYPES = ['president', 'headcoach']

const MANAGER_ROLES = ['manager', 'staff', 'root']

function isManagerRole(role) {
  return MANAGER_ROLES.includes(role)
}

// roster 정렬: 영구결번(M)을 마지막으로, 나머지는 등번호 오름차순, 그 다음 기수 오름차순
const ROSTER_ORDER_BY = `
  ORDER BY
    CASE WHEN r.number = 'M' THEN 1 ELSE 0 END ASC,
    CASE WHEN r.number != 'M' THEN CAST(r.number AS UNSIGNED) END ASC,
    r.generation ASC`

module.exports = { STUDENT_ID_REGEX, ROSTER_ROLES, STAFF_TYPES, MANAGER_ROLES, isManagerRole, ROSTER_ORDER_BY }
