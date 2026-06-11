CREATE INDEX idx_roster_year       ON roster(year);
CREATE INDEX idx_posts_user_id     ON posts(user_id);
CREATE INDEX idx_comments_user_id  ON comments(user_id);
CREATE INDEX idx_poll_votes_user_id ON poll_votes(user_id);
