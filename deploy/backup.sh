#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
DC="docker compose -f docker-compose.prod.yml"
DEST=/srv/backups
STAMP=$(date +%F-%H%M)

echo "=== backup started $($STAMP) ==="

umask 077
mkdir -p "$DEST"

echo "--database--"
$DC exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump -uroot --single-transaction --routines --databases portfolio' | gzip > "$DEST/db-$STAMP.sql.gz"

echo "--uploaded files--"
$DC exec -T backend tar czf - -C /app uploads cv_files > "$DEST/files-$STAMP.tgz"

echo "--health check--"
gzip -t "$DEST/db-$STAMP.sql.gz"
tar tzf "$DEST/files-$STAMP.tgz" > /dev/null

echo "--deleting copies older than 14 days--"
find "$DEST" -type f \( -name 'db-*.sql.gz' -o -name 'files-*.tgz' \) -mtime +14 -delete

rclone copy "$DEST" r2crypt: --max-age 2d

echo "done: $DEST"


#crontab entry to run this script every day at 3:15 AM
#15 3 * * * /bin/bash /srv/portfolio/deploy/backup.sh >> /srv/backups/backup.log 2>&1
