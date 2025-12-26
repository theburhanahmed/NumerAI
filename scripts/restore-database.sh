#!/bin/bash

# Database restore script for NumerAI
# Usage: ./restore-database.sh <backup_file.sql.gz>

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Example: $0 /backups/numerai_backup_20240115_020000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Database configuration
DB_NAME="${DB_NAME:-numerai}"
DB_USER="${DB_USER:-numerai}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Verify backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Verify backup file integrity
echo "Verifying backup file integrity..."
gunzip -t "${BACKUP_FILE}" || {
    echo "ERROR: Backup file is corrupted"
    exit 1
}

# Confirm restore
echo "WARNING: This will overwrite the current database!"
echo "Database: ${DB_NAME}"
echo "Backup file: ${BACKUP_FILE}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Stop application (if running)
echo "Stopping application..."
systemctl stop numerai-backend || echo "Application not running or not managed by systemd"

# Create backup of current database before restore
CURRENT_BACKUP="/backups/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
echo "Creating backup of current database: ${CURRENT_BACKUP}"
pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    --no-owner --no-acl | gzip > "${CURRENT_BACKUP}"

# Drop and recreate database (or just restore)
echo "Restoring database from backup..."
gunzip -c "${BACKUP_FILE}" | psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"

# Verify restore
echo "Verifying restore..."
RECORD_COUNT=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM users;" | xargs)
echo "Users in database: ${RECORD_COUNT}"

if [ "${RECORD_COUNT}" -eq 0 ]; then
    echo "WARNING: No users found in database. Restore may have failed."
    read -p "Do you want to restore from pre-restore backup? (yes/no): " RESTORE_PRE
    if [ "${RESTORE_PRE}" == "yes" ]; then
        echo "Restoring from pre-restore backup..."
        gunzip -c "${CURRENT_BACKUP}" | psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"
    fi
else
    echo "Restore completed successfully"
fi

# Start application
echo "Starting application..."
systemctl start numerai-backend || echo "Application not managed by systemd"

echo "Database restore completed at $(date)"

