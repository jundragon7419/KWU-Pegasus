-- ================================================================
-- Migration 003: comments 테이블 추가
-- ================================================================

USE kwu_pegasus;

CREATE TABLE IF NOT EXISTS comments (
  id         INT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
  post_id    INT      NOT NULL,
  user_id    INT      NOT NULL,
  content    TEXT       NOT NULL,
  is_edited  TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)  ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
