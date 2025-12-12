#!/bin/bash
# NumerAI Deployment Script for DigitalOcean
# This script deploys the application to a production server

set -e  # Exit on error (but we'll handle env file loading separately)

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
else
    # Check for syntax issues in .env.production (informational only)
    # We don't source it, but docker-compose will read it via --env-file
    if head -2 "${ENV_FILE}" | tail -1 | grep -q "(" 2>/dev/null; then
        echo -e "${YELLOW}Note: .env.production line 2 may have special characters${NC}"
        echo -e "${YELLOW}This is fine - we use --env-file instead of sourcing${NC}"
    fi
fi

# Pull latest code
echo -e "${GREEN}[1/7] Pulling latest code from Git...${NC}"
if [ -d ".git" ]; then
    git pull origin main || git pull origin master
else
    echo -e "${YELLOW}Not a git repository. Skipping git pull.${NC}"
fi

# Validate .env.production file syntax (check for common issues)
if [ -f "${ENV_FILE}" ]; then
    # Check if file has syntax issues that would break bash
    if grep -q "(" "${ENV_FILE}" 2>/dev/null && ! grep -q "^[^#]*=.*\".*(" "${ENV_FILE}" 2>/dev/null; then
        echo -e "${YELLOW}Warning: .env.production may have unquoted parentheses${NC}"
        echo -e "${YELLOW}This is okay - docker-compose will handle it via --env-file${NC}"
    fi
fi

# Load environment variables (optional - docker-compose will use --env-file)
# We skip sourcing to avoid syntax errors - docker-compose reads the file directly
if [ -f "${ENV_FILE}" ]; then
    echo -e "${GREEN}Environment file found - docker-compose will use --env-file${NC}"
    # Extract specific variables we need in the script (if any)
    # For now, we don't need to source since docker-compose handles it
    # If we need shell variables, we can extract them individually:
    # DB_USER=$(grep "^DB_USER=" "${ENV_FILE}" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo "numerai")
else
    echo -e "${YELLOW}Warning: ${ENV_FILE} not found${NC}"
    echo -e "${YELLOW}Docker-compose commands will run without --env-file${NC}"
fi

# Build Docker images
echo -e "${GREEN}[2/7] Building Docker images...${NC}"
if [ -f "${ENV_FILE}" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file "${ENV_FILE}" build --no-cache
else
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
fi

# Stop existing containers
echo -e "${GREEN}[3/7] Stopping existing containers...${NC}"
if [ -f "${ENV_FILE}" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file "${ENV_FILE}" down
else
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
fi

# Start database and redis first
echo -e "${GREEN}[4/7] Starting database and Redis...${NC}"
if [ -f "${ENV_FILE}" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file "${ENV_FILE}" up -d postgres redis
else
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres redis
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10
for i in {1..30}; do
    # Get DB_USER from env file or use default
    DB_USER_VAL=${DB_USER:-numerai}
    if [ -f "${ENV_FILE}" ]; then
        DB_USER_FROM_FILE=$(grep "^DB_USER=" "${ENV_FILE}" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" | head -1)
        if [ -n "${DB_USER_FROM_FILE}" ]; then
            DB_USER_VAL="${DB_USER_FROM_FILE}"
        fi
    fi
    COMPOSE_CMD_CHECK="docker-compose -f docker-compose.yml -f docker-compose.prod.yml"
    [ -f "${ENV_FILE}" ] && COMPOSE_CMD_CHECK="${COMPOSE_CMD_CHECK} --env-file ${ENV_FILE}"
    if ${COMPOSE_CMD_CHECK} exec -T postgres pg_isready -U ${DB_USER_VAL} > /dev/null 2>&1; then
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
if [ -f "${ENV_FILE}" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file "${ENV_FILE}" run --rm backend python manage.py migrate --no-input
else
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend python manage.py migrate --no-input
fi

# Collect static files
echo -e "${GREEN}[6/7] Collecting static files...${NC}"
if [ -f "${ENV_FILE}" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file "${ENV_FILE}" run --rm backend python manage.py collectstatic --no-input
else
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --no-input
fi

# Copy static files to nginx directory
if [ -d "${APP_DIR}/backend/staticfiles" ]; then
    echo "Copying static files to nginx directory..."
    sudo cp -r ${APP_DIR}/backend/staticfiles/* /var/www/numerai/static/ 2>/dev/null || true
    sudo chown -R www-data:www-data /var/www/numerai/static
fi

# Start all services
echo -e "${GREEN}[7/7] Starting all services...${NC}"
if [ -f "${ENV_FILE}" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file "${ENV_FILE}" up -d
else
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
fi

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
if [ -f "${ENV_FILE}" ]; then
    COMPOSE_CMD="docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file ${ENV_FILE}"
else
    COMPOSE_CMD="docker-compose -f docker-compose.yml -f docker-compose.prod.yml"
fi

if ${COMPOSE_CMD} ps backend | grep -q "Up"; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
fi

# Check frontend
if ${COMPOSE_CMD} ps frontend | grep -q "Up"; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend is not running${NC}"
fi

# Check database
if ${COMPOSE_CMD} ps postgres | grep -q "Up"; then
    echo -e "${GREEN}✓ Database is running${NC}"
else
    echo -e "${RED}✗ Database is not running${NC}"
fi

# Check Redis
if ${COMPOSE_CMD} ps redis | grep -q "Up"; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}✗ Redis is not running${NC}"
fi

# Show container status
echo ""
echo "Container status:"
${COMPOSE_CMD} ps

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment completed!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Verify nginx configuration is correct"
echo "2. Test the application: curl http://localhost/api/v1/health/"
echo "3. Check logs: ${COMPOSE_CMD} logs"
echo ""
