#!/bin/bash
# Complete setup script for backend.numerobuddy.com
# Run this on your production server

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Setting up backend.numerobuddy.com"
echo "=========================================="

# Step 1: Backup current nginx config
echo -e "\n[1/7] Backing up current nginx config..."
if [ -f "/etc/nginx/sites-available/numerai.conf" ]; then
    sudo cp /etc/nginx/sites-available/numerai.conf /etc/nginx/sites-available/numerai.conf.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓ Config backed up${NC}"
else
    echo -e "${YELLOW}⚠ No existing config found${NC}"
fi

# Step 2: Verify updated config exists
echo -e "\n[2/7] Checking for updated config file..."
if [ ! -f "/opt/numerai/deploy/digitalocean/nginx/numerai.conf" ]; then
    echo -e "${RED}✗ Updated config not found at /opt/numerai/deploy/digitalocean/nginx/numerai.conf${NC}"
    echo "Please ensure you've pulled the latest code: cd /opt/numerai && git pull"
    exit 1
fi
echo -e "${GREEN}✓ Updated config file found${NC}"

# Step 3: Copy updated config
echo -e "\n[3/7] Copying updated nginx config..."
sudo cp /opt/numerai/deploy/digitalocean/nginx/numerai.conf /etc/nginx/sites-available/numerai.conf
echo -e "${GREEN}✓ Config copied${NC}"

# Step 4: Ensure config is enabled
echo -e "\n[4/7] Ensuring config is enabled..."
if [ ! -L "/etc/nginx/sites-enabled/numerai.conf" ]; then
    sudo ln -s /etc/nginx/sites-available/numerai.conf /etc/nginx/sites-enabled/numerai.conf
    echo -e "${GREEN}✓ Config symlinked${NC}"
else
    echo -e "${GREEN}✓ Config already enabled${NC}"
fi

# Step 5: Test nginx config
echo -e "\n[5/7] Testing nginx configuration..."
if sudo nginx -t 2>&1 | grep -q "syntax is ok"; then
    echo -e "${GREEN}✓ Nginx config syntax is valid${NC}"
else
    echo -e "${RED}✗ Nginx config has syntax errors:${NC}"
    sudo nginx -t
    exit 1
fi

# Step 6: Update ALLOWED_HOSTS in .env.production
echo -e "\n[6/7] Checking ALLOWED_HOSTS in .env.production..."
ENV_FILE="/opt/numerai/.env.production"
if [ -f "${ENV_FILE}" ]; then
    # Check if ALLOWED_HOSTS has backslashes or invalid characters
    CURRENT_HOSTS=$(grep "^ALLOWED_HOSTS=" "${ENV_FILE}" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    
    # Clean the hosts - remove backslashes and invalid characters
    CLEAN_HOSTS=$(echo "${CURRENT_HOSTS}" | sed 's/\\//g' | sed 's/\// /g' | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -v '^$' | tr '\n' ',' | sed 's/,$//')
    
    # Ensure numerobuddy.com is in the list
    if echo "${CLEAN_HOSTS}" | grep -qv "numerobuddy.com"; then
        CLEAN_HOSTS="numerobuddy.com,www.numerobuddy.com,${CLEAN_HOSTS}"
    fi
    
    # Update the file
    if grep -q "^ALLOWED_HOSTS=" "${ENV_FILE}"; then
        sudo sed -i.bak "s|^ALLOWED_HOSTS=.*|ALLOWED_HOSTS=${CLEAN_HOSTS}|" "${ENV_FILE}"
        echo -e "${GREEN}✓ Updated ALLOWED_HOSTS: ${CLEAN_HOSTS}${NC}"
        echo -e "${YELLOW}  Note: backend.numerobuddy.com will be automatically added by Django${NC}"
    else
        echo "ALLOWED_HOSTS=${CLEAN_HOSTS}" | sudo tee -a "${ENV_FILE}"
        echo -e "${GREEN}✓ Added ALLOWED_HOSTS${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env.production not found at ${ENV_FILE}${NC}"
fi

# Step 7: Ensure certbot directory exists
echo -e "\n[7/8] Ensuring certbot directory exists..."
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot
echo -e "${GREEN}✓ Certbot directory ready${NC}"

# Step 8: Reload nginx and restart backend
echo -e "\n[8/8] Reloading services..."
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${RED}✗ Failed to reload nginx${NC}"
    exit 1
fi

# Restart backend to pick up new ALLOWED_HOSTS
cd /opt/numerai
if docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production restart backend > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend restarted${NC}"
else
    echo -e "${YELLOW}⚠ Could not restart backend (may need manual restart)${NC}"
fi

echo -e "\n=========================================="
echo -e "${GREEN}Setup complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Configure DNS: Add A record for backend.numerobuddy.com pointing to your server IP"
echo "2. Test locally: curl -H 'Host: backend.numerobuddy.com' http://localhost/api/v1/health/"
echo "3. Test with domain (after DNS): curl http://backend.numerobuddy.com/api/v1/health/"
echo "4. Update SSL certificate: sudo certbot --nginx -d numerobuddy.com -d www.numerobuddy.com -d backend.numerobuddy.com"
echo ""
echo "To verify, run: ./verify-backend-subdomain.sh"

