#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
DC="docker compose -f docker-compose.prod.yml"

echo "backup before deploy"
/bin/bash "$(dirname "$0")/backup.sh" || { echo "backup failed, deploy aborted"; exit 1; }

echo "pulling last version repo"
git pull --ff-only

[ -f ../frontend/dist/index.html ] || { echo "frontend/dist is missing: upload the build first"; exit 1; }

echo "building and starting image"
$DC up -d --build

echo "waiting for the backend"
sleep 8
$DC ps
$DC logs --tail 15 backend

echo "cleaning old images"
docker image prune -f