-- ================================================================
-- Migration 004: activity_logs 테이블 추가
-- ================================================================

USE kwu_pegasus;

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
