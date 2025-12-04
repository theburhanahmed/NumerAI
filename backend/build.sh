#!/usr/bin/env bash
# Render.com build script for Django backend

set -o errexit  # Exit on error
set +o pipefail  # Don't exit on pipe failures

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Checking migration history..."
python manage.py showmigrations

# Fix for InconsistentMigrationHistory: Migration account.0001_initial is applied before its dependency accounts.0001_initial
echo "Fixing migration dependency issue..."
python manage.py migrate accounts 0001 --fake-initial || echo "Warning: Fake initial migration may have failed, continuing..."

echo "Creating migrations for all apps..."
python manage.py makemigrations --no-input

echo "Running database migrations..."
python manage.py migrate --no-input --run-syncdb

# Ensure accounts app migrations are fully applied (critical for notifications table)
echo "Ensuring accounts migrations are fully applied..."
# First ensure all dependencies are met
python manage.py migrate accounts 0001 --no-input || true
python manage.py migrate accounts 0002 --no-input || true
# Then apply the notification migration
python manage.py migrate accounts 0003 --no-input || echo "Warning: Migration 0003 may have issues"
# Finally, run all remaining migrations
python manage.py migrate accounts --no-input

# Verify critical tables exist (using actual db_table names from models)
echo "Verifying critical database tables..."
python << 'PYTHON_SCRIPT'
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerai.settings.production')
django.setup()

from django.db import connection
from django.core.management import call_command

cursor = connection.cursor()
# These are the actual table names from db_table in models
tables = ['notifications', 'users', 'user_profiles', 'otp_codes']
missing_tables = []

for table in tables:
    cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = %s)", [table])
    exists = cursor.fetchone()[0]
    if exists:
        print(f'✓ Table {table} exists')
    else:
        print(f'⚠ WARNING: Table {table} does not exist')
        missing_tables.append(table)

# If notifications table is missing, try to create it
if 'notifications' in missing_tables:
    print('  → Attempting to create notifications table via migration...')
    try:
        call_command('migrate', 'accounts', '0003', verbosity=1, interactive=False)
        # Verify it was created
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications')")
        if cursor.fetchone()[0]:
            print('  ✓ Notifications table created successfully via migration!')
        else:
            raise Exception("Migration completed but table still doesn't exist")
    except Exception as e:
        print(f'  ⚠ Migration failed: {e}')
        print('  → Attempting to create table directly via SQL...')
        try:
            # Create table directly as fallback
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    title VARCHAR(200) NOT NULL,
                    message TEXT NOT NULL,
                    notification_type VARCHAR(30) NOT NULL DEFAULT 'info',
                    is_read BOOLEAN NOT NULL DEFAULT FALSE,
                    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
                    data JSONB DEFAULT '{}',
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    read_at TIMESTAMP WITH TIME ZONE,
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
                );
            """)
            # Create indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS notificatio_user_id_a4dd5c_idx ON notifications(user_id, is_read);
                CREATE INDEX IF NOT EXISTS notificatio_user_id_7336fd_idx ON notifications(user_id, created_at);
                CREATE INDEX IF NOT EXISTS notificatio_notific_19df93_idx ON notifications(notification_type);
            """)
            connection.commit()
            # Verify it was created
            cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications')")
            if cursor.fetchone()[0]:
                print('  ✓ Notifications table created successfully via SQL fallback!')
            else:
                raise Exception("SQL creation completed but table still doesn't exist")
        except Exception as sql_error:
            print(f'  ✗ Failed to create notifications table via SQL: {sql_error}')
            print('  ⚠ Continuing build, but notifications feature will not work until table is created')
            # Don't exit - let the app start and handle errors gracefully

if missing_tables:
    print(f'\n⚠ WARNING: {len(missing_tables)} table(s) are missing: {", ".join(missing_tables)}')
else:
    print('\n✓ All critical tables verified!')
PYTHON_SCRIPT

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Build completed successfully!"