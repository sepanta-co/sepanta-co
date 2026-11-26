#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="./backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
RAW_BACKUP="${BACKUP_DIR}/sepanta-${TIMESTAMP}.db"

mkdir -p "${BACKUP_DIR}"

echo "[1/3] Creating safe online SQLite WAL backup inside sepanta-app..."
docker exec sepanta-app node -e '
const Database = require("better-sqlite3");
const dbPath = process.env.DATABASE_PATH || "/app/data/sepanta.db";
const db = new Database(dbPath);
db.backup("/app/data/backup-latest.db")
  .then(() => {
    db.close();
  })
  .catch((err) => {
    console.error("SQLite backup error:", err);
    process.exit(1);
  });
'

echo "[2/3] Copying snapshot to ${RAW_BACKUP} and cleaning temp container file..."
docker cp sepanta-app:/app/data/backup-latest.db "${RAW_BACKUP}"
docker exec sepanta-app rm -f /app/data/backup-latest.db

echo "[3/3] Compressing backup..."
gzip -9 -f "${RAW_BACKUP}"
ls -lh "${RAW_BACKUP}.gz"
