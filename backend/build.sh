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
if python manage.py showmigrations accounts | grep -q "^\[ \] 0001_initial"; then
    if python manage.py showmigrations account | grep -q "^\[X\] 0001_initial"; then
        echo "Detected inconsistent migration history. Faking accounts.0001_initial migration..."
        python manage.py migrate accounts 0001_initial --fake --no-input || true
    fi
fi

echo "Creating migrations for all apps..."
python manage.py makemigrations --no-input

echo "Running database migrations..."
python manage.py migrate --no-input

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Build completed successfully!"