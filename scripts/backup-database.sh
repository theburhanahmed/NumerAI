#!/bin/bash

# Database backup script for NumerAI
# Run daily via cron: 0 2 * * * /path/to/backup-database.sh

set -e

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
BACKUP_FILE="${BACKUP_DIR}/numerai_backup_${DATE}.sql.gz"
RETENTION_DAYS=30
S3_BUCKET="${S3_BACKUP_BUCKET:-numerai-backups}"
S3_PREFIX="database"

# Database configuration
DB_NAME="${DB_NAME:-numerai}"
DB_USER="${DB_USER:-numerai}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Perform backup
echo "Starting database backup at $(date)"
pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    --no-owner --no-acl | gzip > "${BACKUP_FILE}"

# Verify backup file
if [ ! -f "${BACKUP_FILE}" ] || [ ! -s "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file creation failed"
    exit 1
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Upload to S3 (if configured)
if [ -n "${AWS_ACCESS_KEY_ID}" ] && [ -n "${AWS_SECRET_ACCESS_KEY}" ]; then
    echo "Uploading backup to S3..."
    aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/${S3_PREFIX}/" || {
        echo "WARNING: S3 upload failed, but local backup exists"
    }
fi

# Cleanup old local backups
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "numerai_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Verify backup integrity (optional, can be slow)
# echo "Verifying backup integrity..."
# gunzip -t "${BACKUP_FILE}" || {
#     echo "ERROR: Backup file is corrupted"
#     exit 1
# }

echo "Backup completed successfully at $(date)"

# Send notification (optional)
# curl -X POST "${SLACK_WEBHOOK_URL}" \
#     -H 'Content-Type: application/json' \
#     -d "{\"text\": \"Database backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})\"}"

exit 0

