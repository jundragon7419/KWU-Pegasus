-- ================================================================
-- Migration 001: posts + notices 테이블 통합
-- 실행 전 반드시 데이터베이스를 백업하세요.
-- ================================================================

USE kwu_pegasus;

-- 1. posts 테이블에 새 컬럼 추가
ALTER TABLE posts
  ADD COLUMN type      ENUM('notice','event','game','family_occasion','normal') NOT NULL DEFAULT 'normal' AFTER user_id,
  ADD COLUMN is_pinned TINYINT(1) NOT NULL DEFAULT 0 AFTER type;

-- 2. notices 데이터를 posts 로 이관
--    notices.category → posts.type (값이 동일: notice / event / game)
INSERT INTO posts (user_id, type, is_pinned, title, author, date, views, content)
SELECT user_id, category, is_pinned, title, author, date, views, content
FROM notices;

-- 3. notices 테이블 삭제 (이관 확인 후 실행)
-- DROP TABLE notices;
