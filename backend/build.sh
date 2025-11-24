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

# Check if accounts.0001_initial is not applied but account.0001_initial is applied
ACCOUNTS_APPLIED=$(python manage.py showmigrations accounts | grep "0001_initial" | grep -c "^\[X\]")
ACCOUNT_APPLIED=$(python manage.py showmigrations account | grep "0001_initial" | grep -c "^\[X\]")

if [ "$ACCOUNTS_APPLIED" -eq 0 ] && [ "$ACCOUNT_APPLIED" -eq 1 ]; then
    echo "Detected inconsistent migration history:"
    echo "  - account.0001_initial is applied [X]"
    echo "  - accounts.0001_initial is not applied [ ]"
    echo "Faking accounts.0001_initial migration to resolve dependency order..."
    python manage.py migrate accounts 0001_initial --fake --no-input || true
else
    echo "Migration state appears consistent or already resolved."
fi

echo "Creating migrations for all apps..."
python manage.py makemigrations --no-input

echo "Running database migrations..."
python manage.py migrate --no-input

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Build completed successfully!"