#!/bin/bash
set -e

# Check if DATABASE_URL is set (managed database) or use individual DB settings
if [ -z "$DATABASE_URL" ]; then
  # Fallback to individual DB settings for local development
  DB_HOST=${DB_HOST:-postgres}
  DB_PORT=${DB_PORT:-5432}
  DB_USER=${DB_USER:-numerai}
  DB_NAME=${DB_NAME:-numerai}
  DB_PASSWORD=${DB_PASSWORD:-changeme123}
  MAX_RETRIES=60
  RETRY_INTERVAL=2

  echo "Waiting for PostgreSQL to be ready..."
  echo "Connection details: host=${DB_HOST}, port=${DB_PORT}, user=${DB_USER}, dbname=${DB_NAME}"

  RETRY_COUNT=0
  until python -c "
import psycopg2
import sys
try:
    conn = psycopg2.connect(
        host='${DB_HOST}',
        port='${DB_PORT}',
        user='${DB_USER}',
        password='${DB_PASSWORD}',
        dbname='${DB_NAME}',
        connect_timeout=5
    )
    conn.close()
    sys.exit(0)
except Exception as e:
    sys.exit(1)
" 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
      echo "ERROR: PostgreSQL is still unavailable after $MAX_RETRIES attempts. Giving up."
      exit 1
    fi
    echo "PostgreSQL is unavailable - sleeping (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
  done
  echo "PostgreSQL is up and running!"
else
  echo "Using managed database via DATABASE_URL"
fi

echo "Executing database migrations..."
python manage.py migrate --noinput || {
  echo "WARNING: Migration failed, but continuing..."
}

echo "Collecting static files..."
python manage.py collectstatic --noinput || {
  echo "WARNING: Collectstatic failed, but continuing..."
}

echo "Starting Gunicorn on port ${PORT:-8000}..."
exec gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 4 --threads 2 --timeout 120 --access-logfile - --error-logfile - numerai.wsgi:application

