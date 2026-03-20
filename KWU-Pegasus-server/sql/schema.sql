-- ================================================================
-- KWU PEGASUS DATABASE SCHEMA
-- ================================================================

CREATE DATABASE IF NOT EXISTS kwu_pegasus
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kwu_pegasus;

-- ── 로스터 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roster (
  number   INT          NOT NULL PRIMARY KEY,
  name     VARCHAR(50)  NOT NULL,
  role     ENUM('player','staff','retired') NOT NULL DEFAULT 'player',
  title    VARCHAR(30)  DEFAULT NULL
);

-- ── 게시판 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(50)  NOT NULL,
  date       DATE         NOT NULL,
  views      INT          NOT NULL DEFAULT 0,
  content    TEXT         NOT NULL
);

-- ── 공지사항 ────────────────────────────────────────────────────
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
CREATE TABLE IF NOT EXISTS events (
  id     INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  year   INT          NOT NULL,
  month  INT          NOT NULL,
  day    INT          NOT NULL,
  type   ENUM('game','training','meeting','anniversary') NOT NULL,
  name   VARCHAR(100) NOT NULL
);

-- ── 공휴일 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS holidays (
  id       INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  year     INT          NOT NULL,
  month    INT          NOT NULL,
  day      INT          NOT NULL,
  type     VARCHAR(20)  NOT NULL DEFAULT 'holiday',
  name     VARCHAR(100) NOT NULL,
  is_fixed TINYINT(1)   NOT NULL DEFAULT 0
);

-- ── 유저 ────────────────────────────────────────────────────────
-- role:       user(일반) | manager(매니저) | staff(회장·감독) | root(최고관리자)
-- staff_type: president(회장) | coach(감독) — staff 권한일 때만 사용
-- ob_yb:      ob(졸업생) | yb(재학생)
-- status:     pending(승인 대기) | active(활성) | rejected(거부)
CREATE TABLE IF NOT EXISTS users (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  ob_yb       ENUM('ob','yb') NOT NULL,
  role        ENUM('user','manager','staff','root') NOT NULL DEFAULT 'user',
  staff_type  ENUM('president','coach') DEFAULT NULL,
  status      ENUM('pending','active','rejected') NOT NULL DEFAULT 'pending',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
