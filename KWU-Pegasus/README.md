# KWU Pegasus — 프론트엔드

광운대학교 페가수스 아마야구 동아리 웹사이트의 프론트엔드입니다.

## 기술 스택

- **Framework** React 19
- **Build Tool** Vite 8
- **Routing** React Router 7
- **Styling** CSS Modules

## 디렉토리 구조

```
KWU-Pegasus/
└── src/
    ├── main.jsx
    ├── App.jsx                     라우팅 설정
    ├── lib/
    │   ├── api.js                  API 베이스 URL 상수
    │   └── constants.js            공통 상수 (ROLE_LABEL, EVENT_TYPES 등)
    ├── components/
    │   └── Pagination.jsx          페이지네이션 공통 컴포넌트
    ├── context/
    │   └── AuthContext.jsx         전역 로그인 상태 관리
    ├── layouts/
    │   └── Header.jsx              공통 헤더
    └── pages/
        ├── auth/
        │   ├── Login.jsx           로그인
        │   └── Signup.jsx          회원가입
        ├── notice/
        │   ├── Notice.jsx          공지사항 목록
        │   ├── NoticeDetail.jsx    공지사항 상세
        │   └── NoticeWrite.jsx     공지사항 작성
        ├── board/
        │   ├── Board.jsx           게시판 목록
        │   ├── BoardDetail.jsx     게시글 상세
        │   └── BoardWrite.jsx      게시글 작성
        ├── Write.module.css        공지/게시 작성 공유 CSS
        ├── Home.jsx                홈 (공지사항 미리보기, 미니 캘린더)
        ├── Roster.jsx              선수단 명단
        ├── Schedule.jsx            팀 일정 캘린더
        ├── Admin.jsx               관리자
        ├── Unauthorized.jsx        권한 없음
        └── NotFound.jsx            404
```

## 시작하기

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경변수 설정

`.env` 파일을 생성합니다:

```env
VITE_API_BASE=http://localhost:3001
```

### 3. 백엔드 서버 실행

프론트엔드 실행 전 백엔드 서버(`KWU-Pegasus-server`)가 먼저 실행되어 있어야 합니다.

### 4. 개발 서버 실행
```bash
npm run dev
```

`http://localhost:5173` 에서 실행됩니다.

### 5. 빌드
```bash
npm run build
```

---

## 페이지 목록

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | Home | 공지사항 미리보기 + 미니 캘린더 |
| `/login` | Login | 로그인 |
| `/signup` | Signup | 회원가입 신청 |
| `/roster` | Roster | 선수단 명단 (연도별, 필터/검색) |
| `/schedule` | Schedule | 팀 일정 월별 캘린더 |
| `/notice` | Notice | 공지사항 목록 (고정글 상단) |
| `/notice/:id` | NoticeDetail | 공지사항 상세 |
| `/notice/write` | NoticeWrite | 공지사항 작성 |
| `/board` | Board | 게시판 목록 |
| `/board/:id` | BoardDetail | 게시글 상세 |
| `/board/write` | BoardWrite | 게시글 작성 |
| `/admin` | Admin | 관리자 (staff/root 전용) |
| `/unauthorized` | Unauthorized | 권한 없음 |
| `*` | NotFound | 404 |

---

## API 연동

모든 데이터는 백엔드 API를 통해 가져옵니다.

| 페이지 | API |
|--------|-----|
| Roster | `GET /api/roster?year=`, `GET /api/roster/years`, `GET /api/roster/active-year` |
| Schedule | `GET /api/events?year=`, `GET /api/holidays?year=` |
| Notice | `GET /api/notices`, `POST /api/notices` |
| Board | `GET /api/posts`, `POST /api/posts` |
| Home | `GET /api/notices`, `GET /api/events`, `GET /api/holidays` |
| Admin | `GET/POST /api/admin/pending`, `GET/PUT /api/admin/users`, `GET/POST/DELETE /api/admin/members`, `PUT /api/admin/roster-year` |
