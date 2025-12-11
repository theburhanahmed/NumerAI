#!/bin/bash
# Install systemd services for Celery workers
# Run this script after setting up the server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICES_DIR="${SCRIPT_DIR}"

echo "=========================================="
echo "Installing Celery Systemd Services"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Copy service files
echo -e "${GREEN}Copying service files...${NC}"
cp "${SERVICES_DIR}/celery-worker.service" /etc/systemd/system/
cp "${SERVICES_DIR}/celery-beat.service" /etc/systemd/system/

# Reload systemd
echo -e "${GREEN}Reloading systemd daemon...${NC}"
systemctl daemon-reload

# Enable services
echo -e "${GREEN}Enabling services...${NC}"
systemctl enable celery-worker.service
systemctl enable celery-beat.service

echo ""
echo -e "${GREEN}Services installed successfully!${NC}"
echo ""
echo "To start the services:"
echo "  sudo systemctl start celery-worker"
echo "  sudo systemctl start celery-beat"
echo ""
echo "To check status:"
echo "  sudo systemctl status celery-worker"
echo "  sudo systemctl status celery-beat"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u celery-worker -f"
echo "  sudo journalctl -u celery-beat -f"
echo ""
