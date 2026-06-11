# CLAUDE.md

## 1. 프로젝트 구조와 목적

이 프로젝트는 광운대학교 아마야구 동아리 웹사이트를 만드는 프로젝트이다.
프론트엔드와 백엔드로 나뉘며 구조는 다음과 같다.

### 프론트엔드 (KWU-Pegasus/KWU-Pegasus)

스택: React 19 + Vite + React Router 7, CSS Modules

구조:
- `src/pages/` — 라우트별 페이지 (auth, board, schedule, Admin, Home, MyPage, Roster 등)
- `src/components/` — 공용 컴포넌트 (ContentRenderer, Pagination, PollVote 등)
- `src/context/AuthContext.jsx` — 전역 인증 상태
- `src/hooks/` — useScheduleData, useTabIndicator
- `src/lib/` — api, constants, countryCodes

### 백엔드 (KWU-Pegasus/KWU-Pegasus-server)

구조:
- `src/routes/` — API 라우터 (auth, posts, comments, events, admin, roster, records, poll 등)
- `src/controllers/` — 비즈니스 로직
- `src/middlewares/auth.js` — 인증/권한 미들웨어
- `src/services/` — activityLogService, emailService, holidayService
- `sql/` — DB 스키마

## 2. 기술 스택 및 로컬 개발 환경

### 기술 스택

- 프론트엔드: React 19 + Vite + React Router 7, CSS Modules
- 백엔드: Node.js (CommonJS) + Express 5 + mysql2, JWT/bcrypt 인증

정확한 버전은 각 `package.json`(`KWU-Pegasus/package.json`, `KWU-Pegasus-server/package.json`)을 참고한다.

### 사전 요구사항

- Node.js
- MySQL 8

### 백엔드 (`KWU-Pegasus-server/`)

1. `npm install`
2. `.env` 파일 생성 (값은 비밀이므로 직접 적지 않음). 필요한 키:
   `PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, CORS_ORIGIN, ANNIVERSARY_OPEN_API, UNIQUE_PLAY_TOKEN, UNIQUE_PLAY_TEAM_ID, UNIQUE_PLAY_SUBLEAGUE_ID, MAIL_USER, MAIL_PASS`
3. MySQL에 `sql/schema.sql` 적용 (필요 시 `sql/seed.sql`로 테스트 데이터 추가)
4. 실행: `npm run dev` (nodemon, `server.js`)

### 프론트엔드 (`KWU-Pegasus/`)

1. `npm install`
2. (선택) `.env`에 `VITE_API_BASE` 설정 — 미설정 시 `http://localhost:3001`로 동작 (`src/lib/api.js`)
3. 실행: `npm run dev` (vite)

## 3. 코딩 컨벤션 / 스타일 가이드

기존 코드에서 사용 중인 스타일을 따른다.

### 공통

- 세미콜론 미사용 (ASI)
- 작은따옴표(`'`) 사용
- 들여쓰기 2칸
- 사용자에게 보여지는 메시지·주석은 한국어로 작성

### 프론트엔드

- 컴포넌트는 `function ComponentName() { ... }` 선언식 사용 (화살표 함수 컴포넌트 지양)
- 모듈 최상단에 상수를 `UPPER_SNAKE_CASE`로 선언하고, 관련 상수끼리는 `=` 위치를 정렬해 가독성 확보
  ```js
  const MANAGER_TYPES  = ['notice', 'event', 'game']
  const PINNABLE_TYPES = ['notice', 'event', 'game', 'family_occasion']
  ```
- 스타일링은 CSS Modules (`styles.xxx`) 사용
- API 호출은 `fetch` + `lib/api.js`의 `API_BASE` 사용 (별도 HTTP 클라이언트 라이브러리 도입 지양)
- ESLint `no-unused-vars`는 `^[A-Z_]` 패턴(상수)에 한해 예외 허용

### 백엔드

- CommonJS 모듈 시스템 사용 (`require` / `exports.fnName`), ESM(`import`/`export`) 지양
- 컨트롤러 함수는 아래 패턴 고정
  ```js
  exports.fnName = async (req, res, next) => {
    try {
      // ...
    } catch (err) {
      next(err)
    }
  }
  ```
- DB 접근은 raw SQL + `?` 파라미터 바인딩(mysql2) 사용, ORM 도입 지양
- 응답 메시지는 한국어, 에러 응답은 `res.status(xxx).json({ message: '...' })` 형식 통일

## 4. 과거 발생 오류와 해결 방법

과거 오류와 해결 방법은 `docs/errors/`에 파일 단위로 기록한다.

- `docs/errors/000.md` — 이 워크플로우 도입 이전까지 누적된 오류/해결 기록 (CORS, DB 스키마, DB 마이그레이션, 배포, API/프론트엔드 연동)
- 새 오류를 기록할 때는 `docs/errors/template.md`를 복사해 다음 번호(`001.md`, `002.md`, ...)로 작성한다.

작업 시작 전 관련 파일명을 보고 과거에 동일/유사 오류가 없었는지 `docs/errors/`를 먼저 확인한다.

## 5. 변경 시 주의해야 할 핵심 로직

아래 로직은 보안/데이터 무결성에 직접 영향을 준다. 권한/접근 제어에 영향을 주는 변경을 할 때는 README.md의 "권한 체계" / "페이지별 기능 및 권한" / "활동 로그" 표를 함께 갱신하고, 검증 단계에서 `current-task.md`에 기록된 "기준 커밋"(작업 시작 시점) 대비 `git diff`로 README 변경분을 코드 변경과 대조해 일치 여부를 확인한다.

### 인증/인가 미들웨어 — `src/middlewares/auth.js`

- `authenticate`: JWT 검증 + `banned` 계정 차단
- `requireRole`: 권한 체크
- 느슨해지면 차단된 유저나 권한 없는 유저가 API에 접근 가능

### 권한 계층 정의 — `src/lib/constants.js`

- `MANAGER_ROLES`, `isManagerRole()` — `root > staff > manager > member > basic` 계층의 기준점
- 잘못 변경하면 글쓰기 권한, 관리자 기능 등 전체 권한 체계가 무너짐

### 회원가입/로그인 — `src/controllers/authController.js`

- 비밀번호 정규식 검증, `bcrypt.hash`/`bcrypt.compare`
- `banned` 상태 체크 (회원가입 시 이메일 재사용 차단, 로그인 시 차단 계정 거부)
- JWT 서명 시 포함되는 클레임(`role`, `staff_type` 등) — 잘못 다루면 권한 상승/토큰 위변조로 이어짐

### SQL 파라미터 바인딩 패턴

- 모든 컨트롤러의 `pool.query(sql, [params])` 형태 — 문자열 concat으로 바꾸면 SQL Injection 위험

### activity_logs 기록 로직 — `activityLogService`

- "부정 사용 방지" 목적의 감사 로그. 누락되면 운영상 추적 불가능

## 6. 멀티 에이전트 협업 워크플로우 (5터미널 / 9에이전트)

모든 작업은 5개의 터미널(독립 Claude Code 세션)에서 9개의 역할별 에이전트가 단계적으로 진행한다. (`/코딩준비` 스킬로 5터미널 시작)

### 터미널 / 에이전트 매핑

| 터미널 | 에이전트 | 정의 파일 | 역할 |
| --- | --- | --- | --- |
| 1. Plan | 기획자 | `.claude/agents/planner.md` | 요구사항이 모호하면 질문/가정 제시 후, 전체 로드맵 작성 및 단계별 담당 배정 (설계/구현 X) |
| 2. Design | 코드 설계 | `.claude/agents/code-designer.md` | 기존 코드/구조·컨벤션(섹션 3)을 먼저 파악한 뒤, 로드맵을 구현 가능한 설계(변경 파일/접근 방식)로 구체화 |
| 3. Review | 보안 리뷰 | `.claude/agents/security-reviewer.md` | 섹션 5(인증/권한/SQL/activity_logs) 기준 보안 점검, 권한 변경 시 README 갱신 여부 확인 |
| 3. Review | 설계 리뷰 | `.claude/agents/design-reviewer.md` | 설계가 로드맵·컨벤션(섹션 3)에 부합하는지, "시니어 엔지니어라면 이 설계의 아키텍처적 허점은 무엇인가?" 자가 검토, 요청 범위를 벗어난 변경(Surgical Changes 위반)은 없는지 검증 |
| 4. Debug&Fix | 디버깅 | `.claude/agents/debugger.md` | dev서버/lint 실행해 오류 재현 및 원인 파악 |
| 4. Debug&Fix | 수정 | `.claude/agents/fixer.md` | 설계·리뷰·디버깅 결과를 반영해 최소 단위로 코드 수정 (Surgical Changes: 요청과 무관한 리팩터링/스타일 변경 금지) |
| 4. Debug&Fix | 불필요 코드 제거 | `.claude/agents/dead-code-remover.md` | 이번 변경으로 발생한 미사용 코드 정리 |
| 5. Doc&Verify | 검증 | `.claude/agents/verifier.md` | 정적 게이트 + 동작 확인 + 권한 회귀 체크리스트 + 문서 정합성 (4단계, 아래 참고). 실패 시 실패 범위만 설계로 회귀 |
| 5. Doc&Verify | 문서 작성 | `.claude/agents/doc-writer.md` | 검증 통과 후 진행상황·신규 오류/해결법(`docs/errors/00X.md`)·구조 변경을 CLAUDE.md에 반영 |

### 공유 상태 파일

`.claude/workflow/current-task.md` — 터미널 간 핸드오프용 공유 문서. 각 에이전트는 시작 시 이 파일을 읽고, 종료 시 자신의 섹션을 갱신한다.

섹션 구성: `1. 로드맵` / `2. 설계` / `3. 리뷰 결과` / `4. 실행 로그` / `5. 검증 결과` / `상태(PLANNING~DONE)`

### 흐름

```
[터미널1: 기획자] → 로드맵 작성
     ↓
[터미널2: 코드 설계] → 설계안 작성
     ↓
[터미널3: 보안리뷰 + 설계리뷰] → 통과 시 다음, 실패 시 터미널2로 반려
     ↓
[터미널4: 디버깅 → 수정 → 불필요 코드 제거]
     ↓
[터미널5: 검증] → 실패 시 실패 범위만 터미널2(설계)로 회귀 / 통과 시 문서 작성 → DONE
```

검증 실패 시 전체를 처음부터 다시 하지 않고, "5. 검증 결과"에 기록된 실패 범위(파일/기능)만 터미널2에서 재설계한다.

### 동시 작업 방지

5개 터미널이 동시에 같은 파일을 수정/덮어쓰지 않도록, 각 에이전트는 다음을 지킨다.

- 작업 시작 전 `current-task.md`의 "상태"를 확인하고, 자신의 단계에 해당하는 상태일 때만 코드/문서 파일을 수정한다.
- 자신의 차례가 아니면 파일을 수정하지 않고 읽기 전용 작업만 하거나 대기한다.
- 한 시점에는 "상태"에 대응하는 터미널 1곳만 코드/문서를 수정 중이어야 하며, 종료 시 반드시 "상태"를 다음 단계 값으로 갱신해 다음 터미널로 핸드오프한다.
- 작업 중 직전에 읽은 내용과 현재 파일 내용이 다르면(다른 터미널이 먼저 수정함) 작업을 중단하고 충돌 사실을 `current-task.md`에 기록한다.

### 검증 4단계 (테스트 프레임워크 부재 대응)

이 프로젝트는 자동화된 테스트 프레임워크가 없으므로, 검증 에이전트는 아래 4단계를 모두 통과해야 "5. 검증 결과"를 통과로 기록한다. 하나라도 실패하면 실패 단계와 구체적 범위(파일/기능/시나리오)를 기록하고 상태를 `DESIGNING`으로 되돌린다.

1. **정적 게이트**: 프론트 `npm run lint` & `npm run build` 통과. 백엔드는 `node server.js`(또는 `npm run dev`)를 백그라운드로 실행해 정상 기동(문법/require 오류 없음)을 로그로 확인한 뒤 반드시 프로세스를 종료(kill)한다.
2. **기능 검증**: `/run` 또는 `/verify` 스킬로 dev 서버를 띄워 "2. 설계"에 명시된 변경 사항을 정상 케이스 + 에지 케이스로 직접 조작/요청해 확인. 에러 처리, activity_logs 기록 등 운영상 필요한 로직 누락 여부도 함께 확인.
3. **권한 회귀 체크리스트**: 변경이 페이지 접근/권한에 영향을 준다면, README.md의 "페이지별 기능 및 권한" 표에서 관련 행을 추출해 권한별(basic/member/manager/staff/root)로 동작이 표와 일치하는지 점검.
4. **문서 정합성 체크**: 권한 관련 변경이 있었다면 "기준 커밋" 대비 `git diff`로 README.md 변경분을 확인해 코드 변경과 README 갱신 내용이 일치하는지 검토.
