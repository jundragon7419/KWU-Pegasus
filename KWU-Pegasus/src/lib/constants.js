export const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export const ROLE_LABEL = {
  basic: '일반', member: '멤버', manager: '매니저', staff: '스태프', root: 'ROOT',
}

export const STAFF_TYPE_LABEL = {
  president: '회장', headcoach: '감독',
}

export const CATEGORY_LABEL = { notice: '공지', event: '행사', game: '경기' }

export const POST_TYPE_LABEL = {
  notice:          '공지',
  event:           '행사',
  game:            '경기',
  family_occasion: '경조사',
  normal:          '게시글',
}

export const POST_TYPE_MANAGER = ['notice', 'event', 'game']

export const ROSTER_ROLE_LABEL = {
  roster_player: '선수', roster_headcoach: '감독', roster_president: '회장', roster_manager: '매니저', roster_retired: '영구결번',
}

export const EVENT_TYPES = {
  training: { color: 'var(--event-training)', bg: 'var(--event-training-bg)', border: 'var(--event-training-border)' },
  meeting:  { color: 'var(--event-meeting)',  bg: 'var(--event-meeting-bg)',  border: 'var(--event-meeting-border)'  },
  events:   { color: 'var(--event-events)',   bg: 'var(--event-events-bg)',   border: 'var(--event-events-border)'   },
  etc:      { color: 'var(--event-etc)',      bg: 'var(--event-etc-bg)',      border: 'var(--event-etc-border)'      },
}
