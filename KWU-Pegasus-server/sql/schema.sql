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
  phone             VARCHAR(20)   NULL DEFAULT NULL,
  phone_country     VARCHAR(10)   NULL DEFAULT '82',
  authority         ENUM('basic','member','manager','staff','root') NOT NULL DEFAULT 'basic',
  staff_type        ENUM('president','headcoach') NULL DEFAULT NULL,
  membership_status    ENUM('none','pending','approved','rejected','banned') NOT NULL DEFAULT 'none',
  marketing_agreed     TINYINT(1)    NOT NULL DEFAULT 0,
  marketing_email      TINYINT(1)    NOT NULL DEFAULT 0,
  marketing_sms        TINYINT(1)    NOT NULL DEFAULT 0,
  marketing_kakao      TINYINT(1)    NOT NULL DEFAULT 0,
  marketing_agreed_at  DATETIME      NULL DEFAULT NULL,
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 로스터 ──────────────────────────────────────────────────────
-- id         : 로스터 고유 식별자. PK (자동 증가)
-- year       : 해당 로스터의 연도. 연도마다 로스터가 독립적으로 관리됨
-- number     : 해당 연도 로스터에 등록된 등번호. 등번호 없는 매니저는 'M'으로 저장
-- name       : 선수 실명
-- student_id : 학번 (10자리). 로스터 등록 시 관리자가 직접 입력.
--              같은 연도 내 중복 불가 (UNIQUE per year).
--              유저 테이블의 student_id와 일치하는 멤버가 있으면 user_id를 연동
-- generation : 기수 (예: 40기, 41기, ...)
-- user_id    : users 테이블의 id. 기본 NULL이며,
--              roster.student_id와 users.student_id가 일치할 때 자동으로 연동됨.
--              연동 후 해당 유저의 멤버십 정보와 연결하여 차후 활용
-- role       : 로스터 내 역할. 유저 권한(authority)과는 별개로 관리됨
--               president  - 회장
--               headcoach  - 감독
--               manager    - 매니저 (등번호 없는 경우 'M'으로 표시)
--               retired    - 영구결번 등 명예 등록 선수
--               player     - 일반 선수
CREATE TABLE IF NOT EXISTS roster (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  year        INT          NOT NULL,
  number      VARCHAR(10)  NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  student_id  CHAR(10)     NOT NULL,
  generation  INT          NOT NULL,
  user_id     INT          NULL DEFAULT NULL,
  role        ENUM('roster_president','roster_headcoach','roster_retired','roster_player','roster_manager') NOT NULL DEFAULT 'roster_player',
  UNIQUE KEY uq_roster_student (year, student_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ── 설정 ────────────────────────────────────────────────────────
-- 키-값 쌍으로 서버 전역 설정값을 저장하는 테이블
-- setting_key : 설정 항목의 고유 이름. PK로 사용됨
-- setting_val : 설정값. 문자열로 저장
-- 현재 사용 중인 설정값:
--   active_roster_year - 현재 활성 시즌 연도.
--                        로스터 조회 시 연도 미지정이면 이 값을 기본으로 사용.
--                        관리자 페이지에서 변경 가능
CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(50)  NOT NULL PRIMARY KEY,
  setting_val VARCHAR(100) NOT NULL
);

-- ── 게시판 ──────────────────────────────────────────────────────
-- 공지사항과 일반 게시글을 통합 관리하는 테이블
-- id        : 게시글 고유 식별자. PK (자동 증가)
-- user_id   : 작성자 users.id. 탈퇴 시 NULL
-- type      : 게시글 유형
--              notice         - 공지사항        (manager 이상)
--              event          - 행사 공지        (manager 이상)
--              game           - 경기 공지        (manager 이상)
--              family_occasion - 경조사          (member 이상 작성, pin은 manager 이상)
--              normal         - 일반 게시글      (member 이상, pin 불가)
-- pin_until : 상단 고정 만료일 (manager 이상만 설정 가능, normal 타입은 항상 NULL)
--              NULL       - 고정 안 함
--              DATE       - 해당 날짜까지만 고정
--              9999-12-31 - 무한 고정 (수동으로 내릴 때까지)
-- title     : 제목
-- author    : 작성자 이름
-- date      : 작성 날짜
-- views     : 조회수. 기본 0
-- content   : 본문
CREATE TABLE IF NOT EXISTS posts (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NULL DEFAULT NULL,
  type       ENUM('notice','event','game','family_occasion','normal') NOT NULL DEFAULT 'normal',
  pin_until  DATE         NULL DEFAULT NULL,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(50)  NOT NULL,
  date       DATE         NOT NULL,
  views      INT          NOT NULL DEFAULT 0,
  content    TEXT         NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ── 댓글 ────────────────────────────────────────────────────────
-- 게시글에 달리는 댓글 테이블. member 이상만 작성 가능
-- id         : 댓글 고유 식별자. PK (자동 증가)
-- post_id    : 소속 게시글. posts.id 참조. 게시글 삭제 시 댓글도 함께 삭제
-- user_id    : 작성자. users.id 참조. 회원 탈퇴 시 댓글도 함께 삭제
-- content    : 댓글 내용
-- created_at : 작성 일시 (자동 기록)
CREATE TABLE IF NOT EXISTS comments (
  id         INT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
  post_id    INT      NOT NULL,
  user_id    INT      NOT NULL,
  content    TEXT        NOT NULL,
  is_edited  TINYINT(1)  NOT NULL DEFAULT 0,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)  ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE
);

-- ── 활동 로그 ───────────────────────────────────────────────────
-- 유저의 모든 행동을 기록하는 테이블. 삭제된 데이터도 snapshot JSON으로 보존
-- target_id : FK 없이 INT — 삭제 후에도 기록 유지
-- snapshot  : 당시 내용 스냅샷 (JSON)
CREATE TABLE IF NOT EXISTS activity_logs (
  id          INT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     INT      NOT NULL,
  action      ENUM(
    'post_create','post_update','post_delete',
    'comment_create','comment_update','comment_delete',
    'event_create','event_update','event_delete',
    'member_approve','member_reject','member_demote',
    'role_set_manager','role_unset_manager','role_set_staff','role_unset_staff',
    'user_ban','user_unban',
    'roster_add','roster_update','roster_delete',
    'roster_year_set'
  ) NOT NULL,
  target_type ENUM('post','comment','event','user','roster','setting') NOT NULL,
  target_id   INT      NULL,
  snapshot    JSON     NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_logs_user_id ON activity_logs(user_id);

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
  id    INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  date  DATE         NOT NULL,
  type  ENUM('training','meeting','events','etc') NOT NULL,
  name  VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_event (date, name)
);

-- ── 공휴일 ──────────────────────────────────────────────────────
-- 캘린더에 표시되는 공휴일 테이블
-- id       : 공휴일 고유 식별자. PK (자동 증가)
-- year     : 공휴일 연도
-- month    : 공휴일 월
-- day      : 공휴일 일
-- type     : 공휴일 유형 (기본 'holiday')
-- name     : 공휴일 이름
CREATE TABLE IF NOT EXISTS holidays (
  id    INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  year  INT          NOT NULL,
  month INT          NOT NULL,
  day   INT          NOT NULL,
  type  VARCHAR(20)  NOT NULL DEFAULT 'holiday',
  name  VARCHAR(100) NOT NULL
);

-- ── 인덱스 ──────────────────────────────────────────────────────
-- roster.student_id  : users.student_id와의 JOIN 및 이력 조회에 사용
-- users.student_id   : 로스터 연동 시 매칭에 사용 (UNIQUE이나 명시적 인덱스 추가)
-- events.year        : 연도별 일정 조회에 사용
-- holidays.year      : 연도별 공휴일 조회에 사용
CREATE INDEX idx_roster_student_id ON roster(student_id);
CREATE INDEX idx_events_date       ON events(date);
CREATE INDEX idx_comments_post_id  ON comments(post_id);
CREATE INDEX idx_holidays_year     ON holidays(year);
