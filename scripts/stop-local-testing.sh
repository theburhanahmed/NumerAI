#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping NumerAI Local Testing Environment${NC}"
echo ""

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "Docker Compose not found. Exiting."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

# Stop Docker services
echo "Stopping Docker services..."
$DOCKER_COMPOSE -f docker-compose.local.yml down

echo ""
echo -e "${GREEN}✅ All services stopped!${NC}"
echo ""
echo "Note: To remove volumes and clean up completely, run:"
echo "  docker compose -f docker-compose.local.yml down -v"

