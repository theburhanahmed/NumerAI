#!/bin/bash
# Complete the remaining deployment steps

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/deploy-config.env"

DROPLET_IP="146.190.74.172"
APP_DIR="/opt/numerai"

echo -e "${GREEN}Completing NumerAI Deployment...${NC}"

# Step 1: Verify nginx is configured (skip if already done)
echo -e "${GREEN}[1/4] Verifying nginx configuration...${NC}"
if ssh root@${DROPLET_IP} "nginx -t" 2>/dev/null; then
    echo "nginx is already configured correctly"
else
    echo "nginx needs configuration, fixing..."
    ssh root@${DROPLET_IP} "bash -s" << 'NGINX_FIX'
set -e
# nginx should already be configured, just verify
nginx -t && systemctl reload nginx && echo "nginx verified"
NGINX_FIX
fi

# Step 2: Deploy application
echo -e "${GREEN}[2/4] Deploying application...${NC}"
ssh root@${DROPLET_IP} "su - numerai -c 'bash -s'" << 'DEPLOY_APP'
set -e
cd /opt/numerai

# Load environment
set -a
source .env.production
set +a

# Build and start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres redis

# Wait for database
echo "Waiting for database..."
sleep 10
for i in {1..30}; do
    if docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres pg_isready -U numerai > /dev/null 2>&1; then
        echo "Database is ready!"
        break
    fi
    sleep 2
done

# Run migrations
docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend python manage.py migrate --no-input

# Collect static files
docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --noinput

# Copy static files to nginx directory
if [ -d "backend/staticfiles" ]; then
    sudo cp -r backend/staticfiles/* /var/www/numerai/static/ 2>/dev/null || true
    sudo chown -R www-data:www-data /var/www/numerai/static
fi

# Start all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo "Application deployed!"
DEPLOY_APP

# Step 3: Install Celery services
echo -e "${GREEN}[3/4] Installing Celery services...${NC}"
ssh root@${DROPLET_IP} "cd ${APP_DIR} && bash deploy/digitalocean/systemd/install-services.sh && systemctl start celery-worker celery-beat && systemctl enable celery-worker celery-beat"

# Step 4: Verify deployment
echo -e "${GREEN}[4/4] Verifying deployment...${NC}"
ssh root@${DROPLET_IP} "bash -s" << 'VERIFY'
docker ps
echo ""
echo "Checking services..."
docker-compose -f /opt/numerai/docker-compose.yml -f /opt/numerai/docker-compose.prod.yml ps
echo ""
systemctl status celery-worker --no-pager | head -5
systemctl status celery-beat --no-pager | head -5
VERIFY

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Application URLs:"
echo "  HTTP: http://${DROPLET_IP}"
echo "  HTTP: http://${DOMAIN_NAME} (if DNS is configured)"
echo "  API: http://${DOMAIN_NAME}/api/v1"
echo "  Health: http://${DOMAIN_NAME}/api/v1/health/"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure DNS: Point ${DOMAIN_NAME} A record to ${DROPLET_IP}"
echo "2. Wait 5-10 minutes for DNS propagation"
echo "3. Set up SSL: ssh root@${DROPLET_IP} 'cd /opt/numerai && bash deploy/digitalocean/setup-ssl.sh'"
echo "4. Create admin user: ssh numerai@${DROPLET_IP} 'cd /opt/numerai && docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py createsuperuser'"
echo ""
