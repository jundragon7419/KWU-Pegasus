-- ================================================================
-- KWU PEGASUS DATABASE SCHEMA
-- ================================================================

DROP DATABASE IF EXISTS kwu_pegasus;
CREATE DATABASE kwu_pegasus
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kwu_pegasus;

-- ── 유저 ────────────────────────────────────────────────────────
-- id               : 유저 고유 식별자. PK로 사용됨 (자동 증가)
-- username         : 유저 닉네임(로그인 아이디). 중복 불가 (UNIQUE)
-- password         : 비밀번호 (해시 저장)
-- email            : 이메일 주소. 중복 불가 (UNIQUE)
-- name             : 실명. 기본 NULL이며 멤버 등록 시 입력 필요
-- student_id       : 학번 (10자리). 기본 NULL이며 멤버 등록 시 입력 필요. 중복 불가 (UNIQUE)
-- ob_yb            : OB(졸업생) / YB(재학생) 구분. 기본 NULL이며 멤버 등록 시 지정 필요
-- authority        : 계정 권한. 가입 시 basic이 기본으로 부여되며 상위 권한은 하위 권한을 모두 포함함
--                     basic   - 최초 가입 시 부여. 아무 권한 없음
--                     member  - 멤버 신청 후 상위 권한자가 승인 시 부여. 게시판 글쓰기·관리자 페이지 외 모든 페이지 사용 가능
--                     manager - 멤버 가입 신청 수락 가능. 공지사항 작성 가능
--                     staff   - 회장·감독 권한. 일반 멤버에게 manager 권한 부여 가능
--                     root    - 최고 권한. 모든 기능 사용 가능하며 staff(회장·감독) 지정 가능
-- staff_type       : authority가 staff일 때만 사용. 회장(president) 또는 감독(headcoach) 구분. 기본 NULL
-- membership_status: 멤버 등록 진행 상태
--                     none(미신청) | pending(신청중) | approved(승인) | rejected(거부)
-- created_at       : 계정 생성 일시 (자동 기록)
CREATE TABLE IF NOT EXISTS users (
  id                INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username          VARCHAR(50)   NOT NULL UNIQUE,
  password          VARCHAR(255)  NOT NULL,
  email             VARCHAR(100)  NOT NULL UNIQUE,
  name              VARCHAR(50)   NULL DEFAULT NULL,
  student_id        CHAR(10)      NULL DEFAULT NULL UNIQUE,
  ob_yb             ENUM('ob','yb') NULL DEFAULT NULL,
  authority         ENUM('basic','member','manager','staff','root') NOT NULL DEFAULT 'basic',
  staff_type        ENUM('president','headcoach') NULL DEFAULT NULL,
  membership_status ENUM('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 로스터 ──────────────────────────────────────────────────────
-- year       : 해당 로스터의 연도. 연도마다 로스터가 독립적으로 관리됨
-- number     : 해당 연도 로스터에 등록된 등번호. (year, number) 복합 PK
-- name       : 선수 실명
-- student_id : 학번 (10자리). 로스터 등록 시 관리자가 직접 입력.
--              같은 연도 내 중복 불가 (UNIQUE per year).
--              유저 테이블의 student_id와 일치하는 멤버가 있으면 user_id를 연동
-- user_id    : users 테이블의 id. 기본 NULL이며,
--              roster.student_id와 users.student_id가 일치할 때 자동으로 연동됨.
--              연동 후 해당 유저의 멤버십 정보와 연결하여 차후 활용
-- role       : 로스터 내 역할. 유저 권한(authority)과는 별개로 관리됨
--               president  - 회장
--               headcoach  - 감독
--               retired    - 영구결번 등 명예 등록 선수
--               player     - 일반 선수
CREATE TABLE IF NOT EXISTS roster (
  year        INT          NOT NULL,
  number      INT          NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  student_id  CHAR(10)     NOT NULL,
  user_id     INT          NULL DEFAULT NULL,
  role        ENUM('president','headcoach','retired','player') NOT NULL DEFAULT 'player',
  PRIMARY KEY (year, number),
  UNIQUE KEY uq_roster_student (year, student_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ── 설정 ────────────────────────────────────────────────────────
-- 키-값 쌍으로 서버 전역 설정값을 저장하는 테이블
-- key   : 설정 항목의 고유 이름. PK로 사용됨
-- value : 설정값. 문자열로 저장
-- 현재 사용 중인 설정값:
--   active_roster_year - 현재 활성 시즌 연도.
--                        로스터 조회 시 연도 미지정이면 이 값을 기본으로 사용.
--                        관리자 페이지에서 변경 가능
CREATE TABLE IF NOT EXISTS settings (
  `key`    VARCHAR(50)  NOT NULL PRIMARY KEY,
  `value`  VARCHAR(100) NOT NULL
);

-- ── 게시판 ──────────────────────────────────────────────────────
-- 팀 멤버들이 자유롭게 글을 올리는 게시판 (차후 member 권한 이상 작성 가능)
-- id      : 게시글 고유 식별자. PK (자동 증가)
-- title   : 게시글 제목
-- author  : 작성자 이름
-- date    : 작성 날짜
-- views   : 조회수. 기본 0
-- content : 게시글 본문
CREATE TABLE IF NOT EXISTS posts (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(50)  NOT NULL,
  date       DATE         NOT NULL,
  views      INT          NOT NULL DEFAULT 0,
  content    TEXT         NOT NULL
);

-- ── 공지사항 ────────────────────────────────────────────────────
-- 관리자(manager 이상)가 작성하는 공지사항 테이블 (차후 작성 권한 제한 예정)
-- id        : 공지 고유 식별자. PK (자동 증가)
-- category  : 공지 분류
--              notice - 일반 공지
--              event  - 팀 행사 관련
--              game   - 경기 관련
-- is_pinned : 상단 고정 여부. 1이면 고정, 0이면 일반
-- title     : 공지 제목
-- author    : 작성자 이름
-- date      : 작성 날짜
-- views     : 조회수. 기본 0
-- content   : 공지 본문
CREATE TABLE IF NOT EXISTS notices (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category   ENUM('notice','event','game') NOT NULL DEFAULT 'notice',
  is_pinned  TINYINT(1)   NOT NULL DEFAULT 0,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(50)  NOT NULL,
  date       DATE         NOT NULL,
  views      INT          NOT NULL DEFAULT 0,
  content    TEXT         NOT NULL
);

-- ── 팀 일정 ─────────────────────────────────────────────────────
-- 캘린더에 표시되는 팀 일정 테이블. 같은 날 동일한 이름의 일정은 중복 불가
-- id    : 일정 고유 식별자. PK (자동 증가)
-- year  : 일정 연도
-- month : 일정 월
-- day   : 일정 일
-- type  : 일정 유형
--          game        - 공식 경기
--          training    - 정기 훈련
--          meeting     - 팀 회의
--          anniversary - 기념일
-- name  : 일정 이름
CREATE TABLE IF NOT EXISTS events (
  id     INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  year   INT          NOT NULL,
  month  INT          NOT NULL,
  day    INT          NOT NULL,
  type   ENUM('game','training','meeting','anniversary') NOT NULL,
  name   VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_event (year, month, day, name)
);

-- ── 공휴일 ──────────────────────────────────────────────────────
-- 캘린더에 표시되는 공휴일 테이블
-- id       : 공휴일 고유 식별자. PK (자동 증가)
-- year     : 공휴일 연도
-- month    : 공휴일 월
-- day      : 공휴일 일
-- type     : 공휴일 유형 (기본 'holiday')
-- name     : 공휴일 이름
-- is_fixed : 매년 고정 여부. 1이면 매년 같은 날짜(삼일절 등), 0이면 해마다 날짜가 바뀌는 공휴일(설날·추석 등)
CREATE TABLE IF NOT EXISTS holidays (
  id       INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  year     INT          NOT NULL,
  month    INT          NOT NULL,
  day      INT          NOT NULL,
  type     VARCHAR(20)  NOT NULL DEFAULT 'holiday',
  name     VARCHAR(100) NOT NULL,
  is_fixed TINYINT(1)   NOT NULL DEFAULT 0
);

-- ── 인덱스 ──────────────────────────────────────────────────────
-- roster.student_id  : users.student_id와의 JOIN 및 이력 조회에 사용
-- users.student_id   : 로스터 연동 시 매칭에 사용 (UNIQUE이나 명시적 인덱스 추가)
-- events.year        : 연도별 일정 조회에 사용
-- holidays.year      : 연도별 공휴일 조회에 사용
CREATE INDEX idx_roster_student_id ON roster(student_id);
CREATE INDEX idx_events_year       ON events(year);
CREATE INDEX idx_holidays_year     ON holidays(year);
