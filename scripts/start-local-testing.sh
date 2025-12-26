#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting NumerAI Local Testing Environment${NC}"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop and try again.${NC}"
    exit 1
fi

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose.${NC}"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

echo -e "${YELLOW}📦 Starting Docker services (PostgreSQL, Redis, Backend, Celery)...${NC}"
echo ""

# Start Docker services
$DOCKER_COMPOSE -f docker-compose.local.yml up -d --build

echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"

# Wait for PostgreSQL
echo -n "Waiting for PostgreSQL..."
until docker exec numerai-postgres pg_isready -U numerai > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo -e " ${GREEN}✓${NC}"

# Wait for Redis
echo -n "Waiting for Redis..."
until docker exec numerai-redis redis-cli ping > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo -e " ${GREEN}✓${NC}"

# Wait for Backend
echo -n "Waiting for Backend API..."
MAX_RETRIES=60
RETRY_COUNT=0
until curl -f http://localhost:8000/api/v1/health/ > /dev/null 2>&1; do
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e " ${RED}✗${NC}"
        echo -e "${RED}❌ Backend failed to start. Check logs with: docker logs numerai-backend${NC}"
        exit 1
    fi
    echo -n "."
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
done
echo -e " ${GREEN}✓${NC}"

echo ""
echo -e "${GREEN}✅ All Docker services are running!${NC}"
echo ""
echo "Service Status:"
echo "  - PostgreSQL:  localhost:5432"
echo "  - Redis:       localhost:6379"
echo "  - Backend API: http://localhost:8000"
echo "  - Celery Worker: Running"
echo "  - Celery Beat:  Running"
echo ""

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Frontend directory not found.${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi

# Set environment variable for frontend
export NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

echo -e "${YELLOW}🌐 Starting Frontend (running locally)...${NC}"
echo ""
echo -e "${GREEN}Frontend will be available at: http://localhost:3000${NC}"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start frontend in foreground
cd frontend
npm run dev

