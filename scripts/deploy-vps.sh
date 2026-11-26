#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${VPS_HOST:-}" || -z "${VPS_USER:-}" ]]; then
  echo "Usage: VPS_USER=<ssh-user> VPS_HOST=<vps-ip-or-host> [VPS_PORT=22] [VPS_DIR=/opt/sepanta-co] ./scripts/deploy-vps.sh"
  exit 1
fi

VPS_PORT="${VPS_PORT:-22}"
VPS_DIR="${VPS_DIR:-/opt/sepanta-co}"
IMAGE_NAME="sepanta-web:phase1"
ARCHIVE_PATH="/tmp/sepanta-web-phase1.tar.gz"

cleanup() {
  rm -f "${ARCHIVE_PATH}"
}
trap cleanup EXIT

echo "[1/5] Building production Docker image (${IMAGE_NAME}) locally..."
docker build -t "${IMAGE_NAME}" .

echo "[2/5] Exporting and compressing image archive..."
docker save "${IMAGE_NAME}" | gzip -9 > "${ARCHIVE_PATH}"
ls -lh "${ARCHIVE_PATH}"

echo "[3/5] Transferring archive and docker-compose.yml to ${VPS_USER}@${VPS_HOST}:${VPS_DIR}..."
ssh -p "${VPS_PORT}" "${VPS_USER}@${VPS_HOST}" "mkdir -p ${VPS_DIR}"
rsync -avz --progress -e "ssh -p ${VPS_PORT}" "${ARCHIVE_PATH}" docker-compose.yml "${VPS_USER}@${VPS_HOST}:${VPS_DIR}/"

echo "[4/5] Loading image and restarting service on VPS..."
ssh -p "${VPS_PORT}" "${VPS_USER}@${VPS_HOST}" "
  set -euo pipefail
  cd ${VPS_DIR}
  gunzip -c sepanta-web-phase1.tar.gz | docker load
  rm -f sepanta-web-phase1.tar.gz
  docker compose up -d --remove-orphans
  sleep 2
  curl -fsS http://127.0.0.1:8080/healthz
  docker image prune -f
"

echo "[5/5] Deployment to ${VPS_HOST} completed successfully."
