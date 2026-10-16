15 3 * * * cd /srv/portfolio && ./backup.sh >> backup.log 2>&1
find backups -mtime +14 -delete
