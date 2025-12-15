#!/bin/bash
# Resolve git conflicts and apply backend subdomain fixes
# Run this on your production server

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Resolving git conflicts and applying fixes"
echo "=========================================="

cd /opt/numerai

# Step 1: Stash or discard local changes
echo -e "\n[1/9] Handling local git changes..."
if git status --porcelain | grep -q "deploy/digitalocean/setup-backend-subdomain.sh"; then
    echo -e "${YELLOW}⚠ Local changes detected in setup-backend-subdomain.sh${NC}"
    echo "Stashing local changes..."
    git stash push -m "Stashing local changes before pull" deploy/digitalocean/setup-backend-subdomain.sh || true
    echo -e "${GREEN}✓ Changes stashed${NC}"
fi

# Step 2: Pull latest code
echo -e "\n[2/9] Pulling latest code..."
if git pull origin main; then
    echo -e "${GREEN}✓ Code updated${NC}"
else
    echo -e "${RED}✗ Git pull failed${NC}"
    echo "Trying to resolve conflicts..."
    git merge --abort 2>/dev/null || true
    git reset --hard origin/main
    echo -e "${YELLOW}⚠ Reset to origin/main (local changes discarded)${NC}"
fi

# Step 3: Ensure certbot directory exists
echo -e "\n[3/9] Ensuring certbot directory exists..."
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot
echo -e "${GREEN}✓ Certbot directory ready${NC}"

# Step 4: Check for conflicting nginx configs
echo -e "\n[4/9] Checking for conflicting nginx configs..."
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo -e "${YELLOW}⚠ Default nginx config found - removing${NC}"
    sudo rm -f /etc/nginx/sites-enabled/default
fi
if [ -L "/etc/nginx/sites-enabled/numerai.conf" ]; then
    echo -e "${GREEN}✓ Config is already enabled${NC}"
else
    echo -e "${YELLOW}⚠ Config not enabled - creating symlink${NC}"
    sudo ln -sf /etc/nginx/sites-available/numerai.conf /etc/nginx/sites-enabled/numerai.conf
fi

# Step 5: Copy updated nginx config
echo -e "\n[5/9] Copying updated nginx config..."
if [ ! -f "/opt/numerai/deploy/digitalocean/nginx/numerai.conf" ]; then
    echo -e "${RED}✗ Updated config not found${NC}"
    exit 1
fi
sudo cp /opt/numerai/deploy/digitalocean/nginx/numerai.conf /etc/nginx/sites-available/numerai.conf
echo -e "${GREEN}✓ Config copied${NC}"

# Step 6: Verify backend server block exists
echo -e "\n[6/9] Verifying backend server block..."
if grep -q "server_name backend.numerobuddy.com" /etc/nginx/sites-available/numerai.conf; then
    echo -e "${GREEN}✓ Backend subdomain server block found${NC}"
    # Check if ACME challenge location exists
    if grep -A 10 "server_name backend.numerobuddy.com" /etc/nginx/sites-available/numerai.conf | grep -q "acme-challenge"; then
        echo -e "${GREEN}✓ ACME challenge location found${NC}"
    else
        echo -e "${RED}✗ ACME challenge location NOT found!${NC}"
    fi
else
    echo -e "${RED}✗ Backend subdomain server block NOT found!${NC}"
    exit 1
fi

# Step 7: Test nginx config
echo -e "\n[7/9] Testing nginx configuration..."
if sudo nginx -t 2>&1 | grep -q "syntax is ok"; then
    echo -e "${GREEN}✓ Nginx config syntax is valid${NC}"
else
    echo -e "${RED}✗ Nginx config has syntax errors:${NC}"
    sudo nginx -t
    exit 1
fi

# Step 8: Reload nginx
echo -e "\n[8/9] Reloading nginx..."
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${RED}✗ Failed to reload nginx${NC}"
    exit 1
fi

# Step 9: Test endpoints
echo -e "\n[9/9] Testing endpoints..."

# Test with Host header (works even without DNS)
echo "Test 1: With Host header to localhost..."
RESPONSE1=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: backend.numerobuddy.com" http://127.0.0.1/api/v1/health/ 2>&1)
if [ "$RESPONSE1" = "200" ] || [ "$RESPONSE1" = "301" ] || [ "$RESPONSE1" = "302" ]; then
    echo -e "${GREEN}✓ Test 1 passed: HTTP $RESPONSE1${NC}"
else
    echo -e "${RED}✗ Test 1 failed: HTTP $RESPONSE1${NC}"
    echo "Full response:"
    curl -v -H "Host: backend.numerobuddy.com" http://127.0.0.1/api/v1/health/ 2>&1 | head -30
    echo ""
    echo "Checking nginx error logs..."
    sudo tail -20 /var/log/nginx/error.log | grep -i "backend\|numerobuddy\|404" || sudo tail -10 /var/log/nginx/error.log
fi

# Check DNS
echo ""
echo "Checking DNS resolution..."
BACKEND_IP=$(dig +short backend.numerobuddy.com 2>/dev/null | tail -1 || echo "")
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "146.190.74.172")
if [ -n "$BACKEND_IP" ] && [ "$BACKEND_IP" = "$SERVER_IP" ]; then
    echo -e "${GREEN}✓ DNS correctly points to this server ($SERVER_IP)${NC}"
    echo ""
    echo "Test 2: With actual domain name..."
    RESPONSE2=$(curl -s -o /dev/null -w "%{http_code}" http://backend.numerobuddy.com/api/v1/health/ 2>&1)
    if [ "$RESPONSE2" = "200" ] || [ "$RESPONSE2" = "301" ] || [ "$RESPONSE2" = "302" ]; then
        echo -e "${GREEN}✓ Test 2 passed: HTTP $RESPONSE2${NC}"
    else
        echo -e "${RED}✗ Test 2 failed: HTTP $RESPONSE2${NC}"
        echo "Full response:"
        curl -v http://backend.numerobuddy.com/api/v1/health/ 2>&1 | head -30
    fi
else
    echo -e "${YELLOW}⚠ DNS not configured or not pointing to this server${NC}"
    echo "  Backend IP: ${BACKEND_IP:-not resolved}"
    echo "  Server IP: $SERVER_IP"
    echo "  Please add A record: backend.numerobuddy.com -> $SERVER_IP"
fi

echo -e "\n=========================================="
if [ "$RESPONSE1" = "200" ] || [ "$RESPONSE1" = "301" ] || [ "$RESPONSE1" = "302" ]; then
    echo -e "${GREEN}Fix complete! Backend subdomain is working.${NC}"
else
    echo -e "${YELLOW}Fix applied, but tests indicate issues.${NC}"
    echo "Please check the diagnostics above."
fi
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. If DNS is not configured, add A record: backend.numerobuddy.com -> $SERVER_IP"
echo "2. Wait for DNS propagation (5-15 minutes)"
echo "3. Run certbot: sudo certbot --nginx -d numerobuddy.com -d www.numerobuddy.com -d backend.numerobuddy.com"
echo "4. Verify: curl http://backend.numerobuddy.com/api/v1/health/"



