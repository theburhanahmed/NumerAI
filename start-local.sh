#!/bin/bash

# Quick start script for local development with Docker

set -e

echo "🚀 Starting NumerAI services with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Start all services
echo "📦 Starting all services..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if postgres is ready
echo "🔍 Checking database connection..."
until docker compose exec -T postgres pg_isready -U numerai > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done

# Run migrations
echo "🗄️  Running database migrations..."
docker compose exec -T backend python manage.py migrate --noinput || echo "⚠️  Migrations may have failed, but continuing..."

# Check if superuser exists, if not create one
echo "👤 Checking for superuser..."
if ! docker compose exec -T backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(is_superuser=True).exists()" 2>/dev/null | grep -q "True"; then
    echo "📝 No superuser found. You'll need to create one:"
    echo "   docker compose exec backend python manage.py createsuperuser"
fi

echo ""
echo "✅ All services are running!"
echo ""
echo "📍 Services available at:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000/api/v1/"
echo "   Admin:     http://localhost:8000/admin/"
echo ""
echo "📋 Useful commands:"
echo "   View logs:    docker compose logs -f"
echo "   Stop all:     docker compose down"
echo "   Restart:      docker compose restart [service-name]"
echo ""
echo "💡 Note: Use 'docker compose' (with space) not 'docker-compose' (with hyphen)"
echo ""

