#!/bin/bash
# 사용법: ~/KWU-Pegasus 에서 ./deploy.sh
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$REPO_DIR/KWU-Pegasus-server"
FRONTEND_DIR="$REPO_DIR/KWU-Pegasus"

echo "==> git pull"
cd "$REPO_DIR"
git pull origin main

echo "==> DB 마이그레이션 확인"
set -a
source "$SERVER_DIR/.env"
set +a

mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# schema.sql에 이미 포함된 인덱스이므로 적용된 것으로 표시
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  -e "INSERT IGNORE INTO schema_migrations (filename) VALUES ('001_add_indexes.sql')"

for f in "$SERVER_DIR"/sql/migrations/*.sql; do
  name=$(basename "$f")
  applied=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -N -B "$DB_NAME" \
    -e "SELECT COUNT(*) FROM schema_migrations WHERE filename='$name'")
  if [ "$applied" -eq 0 ]; then
    echo "  적용: $name"
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$f"
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
      -e "INSERT INTO schema_migrations (filename) VALUES ('$name')"
  else
    echo "  건너뜀: $name (이미 적용됨)"
  fi
done

echo "==> 프론트엔드 빌드"
cd "$FRONTEND_DIR"
npm install
npm run build

echo "==> 서버 재시작"
pm2 restart kwu-pegasus-server

echo "==> 완료"
