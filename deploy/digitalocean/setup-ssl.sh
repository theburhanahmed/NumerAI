#!/bin/bash
# SSL Certificate Setup Script using Let's Encrypt Certbot
# This script obtains and configures SSL certificates for your domain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "SSL Certificate Setup with Let's Encrypt"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Get domain name
read -p "Enter your domain name (e.g., numerai.example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain name is required${NC}"
    exit 1
fi

# Get email for Let's Encrypt
read -p "Enter your email address for Let's Encrypt notifications: " EMAIL
if [ -z "$EMAIL" ]; then
    echo -e "${RED}Email address is required${NC}"
    exit 1
fi

# Install certbot if not installed
echo -e "${GREEN}[1/5] Installing certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
else
    echo "certbot is already installed"
fi

# Ensure nginx is running and configured
echo -e "${GREEN}[2/5] Checking nginx configuration...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/numerai.conf"

if [ ! -f "${NGINX_CONFIG}" ]; then
    echo -e "${YELLOW}nginx configuration not found at ${NGINX_CONFIG}${NC}"
    echo "Please copy deploy/digitalocean/nginx/numerai.conf to ${NGINX_CONFIG}"
    echo "And update the server_name directive with your domain"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update nginx config with domain name (temporary for certbot)
if [ -f "${NGINX_CONFIG}" ]; then
    # Backup original config
    cp "${NGINX_CONFIG}" "${NGINX_CONFIG}.backup"
    
    # Update server_name
    sed -i "s/server_name _;/server_name ${DOMAIN};/g" "${NGINX_CONFIG}"
    
    # Temporarily comment out SSL lines for initial certificate request
    sed -i 's/^    ssl_certificate/#    ssl_certificate/g' "${NGINX_CONFIG}"
    sed -i 's/^    ssl_certificate_key/#    ssl_certificate_key/g' "${NGINX_CONFIG}"
    sed -i 's/^    ssl_trusted_certificate/#    ssl_trusted_certificate/g' "${NGINX_CONFIG}"
    
    # Change listen to port 80 only for initial setup
    sed -i 's/listen 443 ssl http2;/#listen 443 ssl http2;/g' "${NGINX_CONFIG}"
    sed -i 's/listen \[::\]:443 ssl http2;/#listen \[::\]:443 ssl http2;/g' "${NGINX_CONFIG}"
    
    # Test nginx configuration
    nginx -t
    systemctl reload nginx
fi

# Obtain certificate
echo -e "${GREEN}[3/5] Obtaining SSL certificate from Let's Encrypt...${NC}"
certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email "${EMAIL}" \
    -d "${DOMAIN}" \
    --redirect

# Update nginx config with certificate paths
echo -e "${GREEN}[4/5] Updating nginx configuration with certificate paths...${NC}"
if [ -f "${NGINX_CONFIG}" ]; then
    # Restore SSL lines and update paths
    sed -i "s|#    ssl_certificate|    ssl_certificate|g" "${NGINX_CONFIG}"
    sed -i "s|#    ssl_certificate_key|    ssl_certificate_key|g" "${NGINX_CONFIG}"
    sed -i "s|#    ssl_trusted_certificate|    ssl_trusted_certificate|g" "${NGINX_CONFIG}"
    
    # Update certificate paths
    sed -i "s|YOUR_DOMAIN|${DOMAIN}|g" "${NGINX_CONFIG}"
    
    # Restore HTTPS listen directives
    sed -i 's/#listen 443 ssl http2;/listen 443 ssl http2;/g' "${NGINX_CONFIG}"
    sed -i 's/#listen \[::\]:443 ssl http2;/listen \[::\]:443 ssl http2;/g' "${NGINX_CONFIG}"
    
    # Test nginx configuration
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}nginx configuration is valid${NC}"
        systemctl reload nginx
    else
        echo -e "${RED}nginx configuration has errors. Please fix them manually.${NC}"
        echo "Restoring backup..."
        cp "${NGINX_CONFIG}.backup" "${NGINX_CONFIG}"
        exit 1
    fi
fi

# Set up auto-renewal
echo -e "${GREEN}[5/5] Setting up automatic certificate renewal...${NC}"

# Test renewal
certbot renew --dry-run

# Add renewal hook to reload nginx
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << 'EOF'
#!/bin/bash
nginx -t && systemctl reload nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# Verify certificate
echo ""
echo -e "${GREEN}=========================================="
echo "SSL Certificate Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Certificate details:"
certbot certificates
echo ""
echo "Your site should now be accessible at: https://${DOMAIN}"
echo ""
echo "Certificate will auto-renew. To test renewal manually:"
echo "  sudo certbot renew --dry-run"
echo ""
echo "To check renewal status:"
echo "  sudo certbot certificates"
echo ""
