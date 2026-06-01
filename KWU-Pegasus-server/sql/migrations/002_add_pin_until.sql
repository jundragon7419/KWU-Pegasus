-- ================================================================
-- Migration 002: is_pinned → pin_until
-- ================================================================

USE kwu_pegasus;

ALTER TABLE posts
  DROP COLUMN  is_pinned,
  ADD  COLUMN  pin_until DATE NULL DEFAULT NULL AFTER type;
