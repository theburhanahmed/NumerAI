#!/bin/bash
# SSH Deployment Script for DigitalOcean Droplet
# This script deploys the application from your local machine to the droplet via SSH

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env.production"
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_HOST="${REMOTE_HOST}"
REMOTE_DIR="${REMOTE_DIR:-/opt/numerai}"
SSH_KEY="${SSH_KEY}"

echo -e "${BLUE}=========================================="
echo "NumerAI SSH Deployment Script"
echo "==========================================${NC}"
echo ""

# Check if REMOTE_HOST is set
if [ -z "${REMOTE_HOST}" ]; then
    read -p "Enter droplet IP or hostname: " REMOTE_HOST
    if [ -z "${REMOTE_HOST}" ]; then
        echo -e "${RED}Error: Remote host is required${NC}"
        exit 1
    fi
fi

# Check if .env.production exists locally
if [ ! -f "${ENV_FILE}" ]; then
    echo -e "${YELLOW}Warning: .env.production not found locally${NC}"
    echo "Run: ./deploy/digitalocean/setup-secrets.sh to create it"
    read -p "Continue without local .env.production? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build SSH command
SSH_CMD="ssh"
if [ -n "${SSH_KEY}" ]; then
    SSH_CMD="${SSH_CMD} -i ${SSH_KEY}"
fi
SSH_CMD="${SSH_CMD} ${REMOTE_USER}@${REMOTE_HOST}"

# Test SSH connection
echo -e "${GREEN}[1/8] Testing SSH connection...${NC}"
if ! ${SSH_CMD} "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to ${REMOTE_HOST}${NC}"
    echo "Please check:"
    echo "  - SSH key is added to authorized_keys on the server"
    echo "  - Firewall allows SSH connections"
    echo "  - REMOTE_HOST is correct"
    exit 1
fi
echo -e "${GREEN}✓ SSH connection successful${NC}"
echo ""

# Check if remote directory exists
echo -e "${GREEN}[2/8] Checking remote directory...${NC}"
if ! ${SSH_CMD} "[ -d ${REMOTE_DIR} ]"; then
    echo -e "${YELLOW}Remote directory ${REMOTE_DIR} does not exist${NC}"
    echo "You may need to run setup-server.sh on the droplet first"
    read -p "Create directory now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${SSH_CMD} "mkdir -p ${REMOTE_DIR} && chown -R numerai:numerai ${REMOTE_DIR} 2>/dev/null || mkdir -p ${REMOTE_DIR}"
        echo -e "${GREEN}✓ Directory created${NC}"
    else
        exit 1
    fi
fi
echo -e "${GREEN}✓ Remote directory exists${NC}"
echo ""

# Copy .env.production if it exists locally
if [ -f "${ENV_FILE}" ]; then
    echo -e "${GREEN}[3/8] Copying .env.production to server...${NC}"
    scp ${SSH_KEY:+-i ${SSH_KEY}} "${ENV_FILE}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/.env.production"
    ${SSH_CMD} "chmod 600 ${REMOTE_DIR}/.env.production"
    echo -e "${GREEN}✓ Environment file copied${NC}"
else
    echo -e "${YELLOW}[3/8] Skipping .env.production (not found locally)${NC}"
    echo -e "${YELLOW}Make sure .env.production exists on the server at ${REMOTE_DIR}/.env.production${NC}"
fi
echo ""

# Check if git repository exists on remote
echo -e "${GREEN}[4/8] Checking Git repository...${NC}"
if ${SSH_CMD} "[ -d ${REMOTE_DIR}/.git ]"; then
    echo -e "${GREEN}Git repository found, pulling latest changes...${NC}"
    ${SSH_CMD} "cd ${REMOTE_DIR} && git pull origin main || git pull origin master"
else
    echo -e "${YELLOW}Git repository not found${NC}"
    read -p "Enter Git repository URL (or press Enter to skip): " GIT_REPO
    if [ -n "${GIT_REPO}" ]; then
        ${SSH_CMD} "cd ${REMOTE_DIR} && git clone ${GIT_REPO} . || (rm -rf * .* 2>/dev/null; git clone ${GIT_REPO} .)"
        echo -e "${GREEN}✓ Repository cloned${NC}"
    else
        echo -e "${YELLOW}Skipping Git clone. You may need to upload files manually.${NC}"
    fi
fi
echo ""

# Run deployment script on remote server
echo -e "${GREEN}[5/8] Running deployment on server...${NC}"
echo "This may take several minutes..."
${SSH_CMD} "cd ${REMOTE_DIR} && \
    if [ -f deploy/digitalocean/deploy.sh ]; then \
        chmod +x deploy/digitalocean/deploy.sh && \
        sudo -u numerai ./deploy/digitalocean/deploy.sh || ./deploy/digitalocean/deploy.sh; \
    else \
        echo 'Deployment script not found. Running manual deployment...' && \
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production build && \
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d; \
    fi"
echo -e "${GREEN}✓ Deployment completed${NC}"
echo ""

# Verify deployment
echo -e "${GREEN}[6/8] Verifying deployment...${NC}"
sleep 5
${SSH_CMD} "cd ${REMOTE_DIR} && \
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps"
echo ""

# Check service health
echo -e "${GREEN}[7/8] Checking service health...${NC}"
HEALTH_CHECK=$(${SSH_CMD} "curl -s -o /dev/null -w '%{http_code}' http://localhost/api/v1/health/ 2>/dev/null || echo '000'")
if [ "${HEALTH_CHECK}" = "200" ]; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${YELLOW}⚠ Backend health check returned: ${HEALTH_CHECK}${NC}"
    echo "This might be normal if nginx is not configured yet"
fi
echo ""

# Show logs
echo -e "${GREEN}[8/8] Recent logs (last 20 lines)...${NC}"
${SSH_CMD} "cd ${REMOTE_DIR} && \
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=20 backend"
echo ""

echo -e "${GREEN}=========================================="
echo "Deployment completed!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. SSH into the server: ${SSH_CMD}"
echo "2. Check service status: cd ${REMOTE_DIR} && docker-compose ps"
echo "3. View logs: cd ${REMOTE_DIR} && docker-compose logs -f"
echo "4. Configure nginx (if not done): sudo ./deploy/digitalocean/setup-ssl.sh"
echo "5. Set up SSL certificates: sudo ./deploy/digitalocean/setup-ssl.sh"
echo ""
echo -e "${YELLOW}Note: Make sure nginx is configured and SSL certificates are set up${NC}"
echo ""

