#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${VPS_HOST:-}" || -z "${VPS_USER:-}" ]]; then
  echo "Usage: VPS_USER=<ssh-user> VPS_HOST=<vps-ip-or-host> [VPS_PORT=22] [VPS_DIR=/opt/sepanta-co] ./scripts/deploy-vps.sh"
  exit 1
fi

VPS_PORT="${VPS_PORT:-22}"
VPS_DIR="${VPS_DIR:-/opt/sepanta-co}"
IMAGE_NAME="sepanta-app:phase2"
ARCHIVE_PATH="/tmp/sepanta-app-phase2.tar.gz"

cleanup() {
  rm -f "${ARCHIVE_PATH}"
}
trap cleanup EXIT

echo "[1/6] Building production Docker image (${IMAGE_NAME}) locally..."
docker build -t "${IMAGE_NAME}" .

echo "[2/6] Exporting and compressing image archive..."
docker save "${IMAGE_NAME}" | gzip -9 > "${ARCHIVE_PATH}"
ls -lh "${ARCHIVE_PATH}"

echo "[3/6] Ensuring target directory and running pre-deploy SQLite WAL backup on VPS..."
ssh -p "${VPS_PORT}" "${VPS_USER}@${VPS_HOST}" "
  set -euo pipefail
  mkdir -p ${VPS_DIR}
  if docker ps --format '{{.Names}}' | grep -q '^sepanta-app$'; then
    cd ${VPS_DIR}
    if [ -x ./scripts/backup-sqlite.sh ]; then
      ./scripts/backup-sqlite.sh
    fi
  fi
"

echo "[4/6] Transferring image archive, compose, nginx, public assets, and scripts..."
rsync -avz --progress -e "ssh -p ${VPS_PORT}" \
  "${ARCHIVE_PATH}" \
  docker-compose.yml \
  .env.example \
  "${VPS_USER}@${VPS_HOST}:${VPS_DIR}/"

rsync -avz --progress -e "ssh -p ${VPS_PORT}" \
  docker/ "${VPS_USER}@${VPS_HOST}:${VPS_DIR}/docker/"

rsync -avz --progress --delete -e "ssh -p ${VPS_PORT}" \
  public/ "${VPS_USER}@${VPS_HOST}:${VPS_DIR}/public/"

rsync -avz --progress -e "ssh -p ${VPS_PORT}" \
  scripts/backup-sqlite.sh "${VPS_USER}@${VPS_HOST}:${VPS_DIR}/scripts/"

echo "[5/6] Loading image and restarting hybrid stack (preserving sepanta_data & sepanta_uploads)..."
ssh -p "${VPS_PORT}" "${VPS_USER}@${VPS_HOST}" "
  set -euo pipefail
  cd ${VPS_DIR}
  chmod +x scripts/backup-sqlite.sh
  gunzip -c sepanta-app-phase2.tar.gz | docker load
  rm -f sepanta-app-phase2.tar.gz
  docker compose up -d --remove-orphans
  sleep 4
  curl -fsS http://127.0.0.1:8080/api/health/
  docker image prune -f
"

echo "[6/6] Phase 2 deployment to ${VPS_HOST} completed successfully."
