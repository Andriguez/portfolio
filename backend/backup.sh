#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
DC="docker compose -f docker-compose.prod.yml"
DEST=/srv/backups
STAMP=$(date +%F-%H%M)

umask 077
mkdir -p "$DEST"

echo "--database--"
$DC exec -T db sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --databases portfolio' \
    | gzip > "$DEST/db-$STAMP.sql.gz"

echo "--uploaded files--"
$DC exec -T backend tar czf - -C /app uploads cv_files > "$DEST/files-$STAMP.tgz"

echo "--health check--"
gzip -t "$DEST/db-$STAMP.sql.gz"
tar tzf "$DEST/files-$STAMP.tgz" > /dev/null

echo "--deleting copies older than 14 days--"
find "$DEST" -type f \( -name 'db-*.sql.gz' -o -name 'files-*.tgz' \) -mtime +14 -delete

# need to configure the remote rclone (maybe in Cloudflare R2)
# rclone copy "$DEST" remote:portfolio-backups --max-age 2d

echo "done: $DEST"


#15 3 * * * /srv/portfolio/backend/backup.sh >> srv/backups/backup.log 2>&1

##test
#  docker compose -f docker-compose.prod.yml exec db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE restore_test"'
#  gunzip -c /srv/backups/db-*.sql.gz | sed 's/`portfolio`/`restore_test`/g' | docker compose -f docker-compose.prod.yml exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"'