#!/bin/bash
# NumerAI Deployment Script for DigitalOcean
# This script deploys the application to a production server

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/numerai"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${APP_DIR}/.env.production"

echo "=========================================="
echo "NumerAI Deployment Script"
echo "=========================================="

# Check if running as numerai user or with sudo
if [ "$USER" != "numerai" ] && [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as 'numerai' user or with sudo${NC}"
    exit 1
fi

# Navigate to application directory
cd "${APP_DIR}" || {
    echo -e "${RED}Application directory ${APP_DIR} does not exist${NC}"
    echo "Please run setup-server.sh first or create the directory"
    exit 1
}

# Check if .env.production exists
if [ ! -f "${ENV_FILE}" ]; then
    echo -e "${YELLOW}Warning: ${ENV_FILE} not found${NC}"
    echo "Please create it from .env.production.example"
    echo "You can use: ./deploy/digitalocean/update-env.sh"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pull latest code
echo -e "${GREEN}[1/7] Pulling latest code from Git...${NC}"
if [ -d ".git" ]; then
    git pull origin main || git pull origin master
else
    echo -e "${YELLOW}Not a git repository. Skipping git pull.${NC}"
fi

# Load environment variables
if [ -f "${ENV_FILE}" ]; then
    set -a
    source "${ENV_FILE}"
    set +a
fi

# Build Docker images
echo -e "${GREEN}[2/7] Building Docker images...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# Stop existing containers
echo -e "${GREEN}[3/7] Stopping existing containers...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Start database and redis first
echo -e "${GREEN}[4/7] Starting database and Redis...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres redis

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10
for i in {1..30}; do
    if docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres pg_isready -U ${DB_USER:-numerai} > /dev/null 2>&1; then
        echo "Database is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Database failed to start${NC}"
        exit 1
    fi
    sleep 2
done

# Run database migrations
echo -e "${GREEN}[5/7] Running database migrations...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend python manage.py migrate --no-input

# Collect static files
echo -e "${GREEN}[6/7] Collecting static files...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --no-input

# Copy static files to nginx directory
if [ -d "${APP_DIR}/backend/staticfiles" ]; then
    echo "Copying static files to nginx directory..."
    sudo cp -r ${APP_DIR}/backend/staticfiles/* /var/www/numerai/static/ 2>/dev/null || true
    sudo chown -R www-data:www-data /var/www/numerai/static
fi

# Start all services
echo -e "${GREEN}[7/7] Starting all services...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Restart Celery services (via systemd)
echo "Restarting Celery services..."
sudo systemctl restart celery-worker.service || echo -e "${YELLOW}Celery worker service not found (may need to be set up)${NC}"
sudo systemctl restart celery-beat.service || echo -e "${YELLOW}Celery beat service not found (may need to be set up)${NC}"

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 15

# Verify deployment
echo -e "${GREEN}Verifying deployment...${NC}"

# Check backend health
if docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps backend | grep -q "Up"; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
fi

# Check frontend
if docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps frontend | grep -q "Up"; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend is not running${NC}"
fi

# Check database
if docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
    echo -e "${GREEN}✓ Database is running${NC}"
else
    echo -e "${RED}✗ Database is not running${NC}"
fi

# Check Redis
if docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps redis | grep -q "Up"; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}✗ Redis is not running${NC}"
fi

# Show container status
echo ""
echo "Container status:"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment completed!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Verify nginx configuration is correct"
echo "2. Test the application: curl http://localhost/api/v1/health/"
echo "3. Check logs: docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs"
echo ""
