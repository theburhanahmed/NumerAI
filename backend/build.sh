#!/usr/bin/env bash
# Render.com build script for Django backend

set -o errexit  # Exit on error

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Checking migration history..."
python manage.py showmigrations

echo "Handling migration inconsistencies..."
# Handle the specific migration dependency issue between accounts and account apps
# This is a known issue when using django-allauth with custom user models
# Try to apply our fix migrations in order
python manage.py migrate accounts 0002_fix_allauth_migration_order --no-input || true
python manage.py migrate accounts 0003_fix_allauth_dependencies --no-input || true

# If the above fail, try to fake the initial migration
python manage.py migrate accounts 0001_initial --fake --no-input || true

echo "Creating migrations for all apps..."
python manage.py makemigrations --no-input

echo "Running database migrations..."
python manage.py migrate --no-input

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Build completed successfully!"