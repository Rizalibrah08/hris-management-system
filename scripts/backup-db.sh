#!/bin/bash
# =============================================================================
# HRIS Database Backup Script
# =============================================================================
# Usage:
#   ./scripts/backup-db.sh
#
# Crontab (daily at 2 AM):
#   0 2 * * * cd ~/hris-prod && ./scripts/backup-db.sh
# =============================================================================

set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$APP_DIR/backups"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db-$TIMESTAMP.sql.gz"

echo "📦 Creating database backup..."

cd "$APP_DIR"

if ! docker compose ps mysql | grep -q "Up"; then
    echo "❌ MySQL is not running"
    exit 1
fi

# Export + compress
docker compose exec -T mysql mysqldump \
    -uroot \
    -p"$(grep DB_PASSWORD .env | cut -d= -f2)" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    hris_db 2>/dev/null | gzip > "$BACKUP_FILE"

echo "✅ Backup saved: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Cleanup old backups
DELETED=$(find "$BACKUP_DIR" -name "db-*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
    echo "🧹 Cleaned $DELETED old backup(s)"
fi

echo "📊 Backup directory: $(du -sh "$BACKUP_DIR" | cut -f1)"
