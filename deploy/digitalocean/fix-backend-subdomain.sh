#!/bin/bash
# Complete fix script for backend.numerobuddy.com issues
# Run this on your production server

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Fixing backend.numerobuddy.com"
echo "=========================================="

# Step 1: Ensure certbot directory exists
echo -e "\n[1/8] Ensuring certbot directory exists..."
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot
echo -e "${GREEN}✓ Certbot directory ready${NC}"

# Step 2: Check for conflicting nginx configs
echo -e "\n[2/8] Checking for conflicting nginx configs..."
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

# Step 3: Copy updated nginx config
echo -e "\n[3/8] Copying updated nginx config..."
if [ ! -f "/opt/numerai/deploy/digitalocean/nginx/numerai.conf" ]; then
    echo -e "${RED}✗ Updated config not found${NC}"
    exit 1
fi
sudo cp /opt/numerai/deploy/digitalocean/nginx/numerai.conf /etc/nginx/sites-available/numerai.conf
echo -e "${GREEN}✓ Config copied${NC}"

# Step 4: Verify backend server block exists
echo -e "\n[4/8] Verifying backend server block..."
if grep -q "server_name backend.numerobuddy.com" /etc/nginx/sites-available/numerai.conf; then
    echo -e "${GREEN}✓ Backend subdomain server block found${NC}"
    # Show the server block location
    LINE_NUM=$(grep -n "server_name backend.numerobuddy.com" /etc/nginx/sites-available/numerai.conf | cut -d: -f1)
    echo "  Server block starts at line $LINE_NUM"
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

# Step 5: Test nginx config
echo -e "\n[5/8] Testing nginx configuration..."
if sudo nginx -t 2>&1 | grep -q "syntax is ok"; then
    echo -e "${GREEN}✓ Nginx config syntax is valid${NC}"
else
    echo -e "${RED}✗ Nginx config has syntax errors:${NC}"
    sudo nginx -t
    exit 1
fi

# Step 6: Reload nginx
echo -e "\n[6/8] Reloading nginx..."
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${RED}✗ Failed to reload nginx${NC}"
    exit 1
fi

# Step 7: Check DNS resolution
echo -e "\n[7/8] Checking DNS resolution..."
BACKEND_IP=$(dig +short backend.numerobuddy.com 2>/dev/null | tail -1 || echo "")
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "146.190.74.172")
if [ -z "$BACKEND_IP" ]; then
    echo -e "${RED}✗ DNS not configured for backend.numerobuddy.com${NC}"
    echo "  Please add A record: backend.numerobuddy.com -> $SERVER_IP"
elif [ "$BACKEND_IP" != "$SERVER_IP" ]; then
    echo -e "${YELLOW}⚠ DNS resolved to: $BACKEND_IP (server IP: $SERVER_IP)${NC}"
    echo "  DNS may not be pointing to this server"
else
    echo -e "${GREEN}✓ DNS correctly points to this server ($SERVER_IP)${NC}"
fi

# Step 8: Test endpoints and diagnose
echo -e "\n[8/8] Testing endpoints and diagnosing..."

# Test with Host header to localhost (should work regardless of DNS)
echo "Test 1: With Host header to localhost..."
RESPONSE1=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: backend.numerobuddy.com" http://127.0.0.1/api/v1/health/ 2>&1)
if [ "$RESPONSE1" = "200" ] || [ "$RESPONSE1" = "301" ] || [ "$RESPONSE1" = "302" ]; then
    echo -e "${GREEN}✓ Test 1 passed: HTTP $RESPONSE1${NC}"
else
    echo -e "${RED}✗ Test 1 failed: HTTP $RESPONSE1${NC}"
    echo "Full response:"
    curl -v -H "Host: backend.numerobuddy.com" http://127.0.0.1/api/v1/health/ 2>&1 | head -30
fi

# Test with actual domain (if DNS is configured)
if [ -n "$BACKEND_IP" ] && [ "$BACKEND_IP" = "$SERVER_IP" ]; then
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
    echo -e "${YELLOW}⚠ Skipping domain test (DNS not configured correctly)${NC}"
fi

# Check nginx logs
echo ""
echo "Checking nginx logs..."
echo "Recent error logs:"
sudo tail -20 /var/log/nginx/error.log 2>/dev/null | grep -i "backend\|numerobuddy\|404" || echo "No relevant errors found"
echo ""
echo "Backend API access logs:"
sudo tail -10 /var/log/nginx/backend-api-access.log 2>/dev/null || echo "No backend API access log yet"

# Check which server block nginx would use
echo ""
echo "Checking active nginx server blocks..."
sudo nginx -T 2>/dev/null | grep -A 2 "server_name" | head -20

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
