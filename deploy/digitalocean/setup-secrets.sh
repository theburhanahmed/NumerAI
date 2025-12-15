#!/bin/bash
# Interactive script to set up production secrets
# This script helps configure .env.production with all required secrets

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENV_FILE="${1:-.env.production}"
ENV_EXAMPLE="deploy/digitalocean/env.production.example"

echo -e "${BLUE}=========================================="
echo "NumerAI Production Secrets Setup"
echo "==========================================${NC}"
echo ""

# Check if .env.production already exists
if [ -f "${ENV_FILE}" ]; then
    echo -e "${YELLOW}Warning: ${ENV_FILE} already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Aborted. Exiting...${NC}"
        exit 0
    fi
    cp "${ENV_FILE}" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}Backup created${NC}"
fi

# Copy example file
if [ ! -f "${ENV_EXAMPLE}" ]; then
    echo -e "${RED}Error: ${ENV_EXAMPLE} not found${NC}"
    exit 1
fi

cp "${ENV_EXAMPLE}" "${ENV_FILE}"
echo -e "${GREEN}Created ${ENV_FILE} from template${NC}"
echo ""

# Function to prompt for value
prompt_value() {
    local var_name=$1
    local description=$2
    local default_value=$3
    local is_secret=${4:-false}
    local current_value=$(grep "^${var_name}=" "${ENV_FILE}" | cut -d'=' -f2- || echo "")
    
    # Remove placeholder/default from current value if it's a placeholder
    if [[ "$current_value" == *"your-"* ]] || [[ "$current_value" == *"Your-"* ]] || [[ "$current_value" == "your-"* ]]; then
        current_value=""
    fi
    
    if [ -n "${default_value}" ]; then
        current_value="${current_value:-${default_value}}"
    fi
    
    local display_value="${current_value}"
    if [ "$is_secret" = true ] && [ -n "${current_value}" ]; then
        display_value="***hidden***"
    fi
    
    echo -e "${BLUE}${description}${NC}"
    if [ -n "${current_value}" ]; then
        read -p "Enter ${var_name} [${display_value}]: " input_value
    else
        read -p "Enter ${var_name}: " input_value
    fi
    
    # Use input if provided, otherwise use current/default
    if [ -n "${input_value}" ]; then
        new_value="${input_value}"
    else
        new_value="${current_value}"
    fi
    
    # Update the file
    if [ -n "${new_value}" ]; then
        # Escape special characters for sed
        escaped_value=$(printf '%s\n' "$new_value" | sed 's/[[\.*^$()+?{|]/\\&/g')
        # Use = as delimiter instead of / to avoid issues with paths
        sed -i.bak "s|^${var_name}=.*|${var_name}=${escaped_value}|" "${ENV_FILE}"
        rm -f "${ENV_FILE}.bak"
    fi
    echo ""
}

# Function to generate random secret key
generate_secret_key() {
    python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 2>/dev/null || \
    openssl rand -base64 64 | tr -d '\n' || \
    echo "$(date +%s | sha256sum | base64 | head -c 64)"
}

echo -e "${GREEN}=== Django Configuration ===${NC}"
prompt_value "DEBUG" "Debug mode (False for production)" "False"
SECRET_KEY=$(generate_secret_key)
echo -e "${GREEN}Generated SECRET_KEY${NC}"
prompt_value "SECRET_KEY" "Django SECRET_KEY" "${SECRET_KEY}" true
prompt_value "ALLOWED_HOSTS" "Allowed hosts (comma-separated, e.g., numerobuddy.com,www.numerobuddy.com)" ""
prompt_value "DJANGO_SETTINGS_MODULE" "Django settings module" "numerai.settings.production"

echo -e "${GREEN}=== Database Configuration ===${NC}"
prompt_value "DB_NAME" "Database name" "numerai"
prompt_value "DB_USER" "Database user" "numerai"
prompt_value "DB_PASSWORD" "Database password" "" true
prompt_value "DB_HOST" "Database host (use 'postgres' for Docker Compose)" "postgres"
prompt_value "DB_PORT" "Database port" "5432"

echo -e "${GREEN}=== Redis Configuration ===${NC}"
prompt_value "REDIS_URL" "Redis URL" "redis://redis:6379/0"
prompt_value "CELERY_BROKER_URL" "Celery broker URL" "redis://redis:6379/1"
prompt_value "CELERY_RESULT_BACKEND" "Celery result backend" "redis://redis:6379/2"

echo -e "${GREEN}=== CORS & Security ===${NC}"
read -p "Enter your domain (e.g., numerobuddy.com): " domain
if [ -n "${domain}" ]; then
    cors_origins="https://${domain},https://www.${domain}"
    csrf_origins="https://${domain},https://www.${domain}"
    sed -i.bak "s|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=${cors_origins}|" "${ENV_FILE}"
    sed -i.bak "s|^CSRF_TRUSTED_ORIGINS=.*|CSRF_TRUSTED_ORIGINS=${csrf_origins}|" "${ENV_FILE}"
    sed -i.bak "s|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://${domain}/api/v1|" "${ENV_FILE}"
    rm -f "${ENV_FILE}.bak"
    echo -e "${GREEN}Updated CORS and API URL with domain: ${domain}${NC}"
fi
echo ""

echo -e "${GREEN}=== Email Configuration ===${NC}"
echo "Email Provider:"
echo "1) Gmail"
echo "2) SendGrid"
echo "3) Mailgun"
echo "4) Custom SMTP"
read -p "Select email provider [1-4]: " email_choice

case $email_choice in
    2)
        EMAIL_HOST="smtp.sendgrid.net"
        EMAIL_USER="apikey"
        ;;
    3)
        EMAIL_HOST="smtp.mailgun.org"
        ;;
    4)
        prompt_value "EMAIL_HOST" "SMTP host" ""
        prompt_value "EMAIL_PORT" "SMTP port" "587"
        prompt_value "EMAIL_USER" "SMTP username" ""
        ;;
    *)
        EMAIL_HOST="smtp.gmail.com"
        EMAIL_USER=""
        ;;
esac

sed -i.bak "s|^EMAIL_HOST=.*|EMAIL_HOST=${EMAIL_HOST}|" "${ENV_FILE}"
if [ -n "${EMAIL_USER}" ]; then
    sed -i.bak "s|^EMAIL_USER=.*|EMAIL_USER=${EMAIL_USER}|" "${ENV_FILE}"
fi
rm -f "${ENV_FILE}.bak"

prompt_value "EMAIL_USER" "Email username/address" "${EMAIL_USER}"
prompt_value "EMAIL_PASSWORD" "Email password/API key" "" true
prompt_value "EMAIL_PORT" "Email port" "587"
prompt_value "EMAIL_USE_TLS" "Use TLS" "True"
read -p "Enter default from email [noreply@${domain:-yourdomain.com}]: " from_email
if [ -z "${from_email}" ]; then
    from_email="noreply@${domain:-yourdomain.com}"
fi
sed -i.bak "s|^DEFAULT_FROM_EMAIL=.*|DEFAULT_FROM_EMAIL=${from_email}|" "${ENV_FILE}"
rm -f "${ENV_FILE}.bak"
echo ""

echo -e "${YELLOW}=== Optional: Payment Configuration (Stripe) ===${NC}"
read -p "Do you want to configure Stripe? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    prompt_value "STRIPE_PUBLIC_KEY" "Stripe public key" "" true
    prompt_value "STRIPE_SECRET_KEY" "Stripe secret key" "" true
    prompt_value "STRIPE_WEBHOOK_SECRET" "Stripe webhook secret" "" true
fi
echo ""

echo -e "${YELLOW}=== Optional: AI Configuration (OpenAI) ===${NC}"
read -p "Do you want to configure OpenAI? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    prompt_value "OPENAI_API_KEY" "OpenAI API key" "" true
fi
echo ""

echo -e "${YELLOW}=== Optional: Firebase Configuration ===${NC}"
read -p "Do you want to configure Firebase? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Firebase credentials can be provided as:"
    echo "1) Base64 encoded JSON (recommended for Docker)"
    echo "2) File path (if mounted in container)"
    read -p "Select option [1-2]: " firebase_choice
    if [ "$firebase_choice" = "1" ]; then
        read -p "Enter path to Firebase credentials JSON file: " firebase_file
        if [ -f "${firebase_file}" ]; then
            firebase_b64=$(base64 -i "${firebase_file}" 2>/dev/null || base64 "${firebase_file}")
            sed -i.bak "s|^# FIREBASE_CREDENTIALS=.*|FIREBASE_CREDENTIALS=${firebase_b64}|" "${ENV_FILE}"
            rm -f "${ENV_FILE}.bak"
            echo -e "${GREEN}Firebase credentials encoded and added${NC}"
        else
            echo -e "${RED}File not found. You can add FIREBASE_CREDENTIALS manually later.${NC}"
        fi
    else
        prompt_value "FIREBASE_CREDENTIALS_PATH" "Firebase credentials file path" ""
    fi
fi
echo ""

echo -e "${YELLOW}=== Optional: OAuth Configuration ===${NC}"
read -p "Do you want to configure OAuth? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "1) Google OAuth"
    echo "2) Apple OAuth"
    echo "3) Both"
    read -p "Select OAuth provider [1-3]: " oauth_choice
    
    if [ "$oauth_choice" = "1" ] || [ "$oauth_choice" = "3" ]; then
        prompt_value "GOOGLE_CLIENT_ID" "Google Client ID" "" true
        prompt_value "GOOGLE_CLIENT_SECRET" "Google Client Secret" "" true
    fi
    
    if [ "$oauth_choice" = "2" ] || [ "$oauth_choice" = "3" ]; then
        prompt_value "APPLE_CLIENT_ID" "Apple Client ID" "" true
        prompt_value "APPLE_CLIENT_SECRET" "Apple Client Secret" "" true
        prompt_value "APPLE_KEY_ID" "Apple Key ID" "" true
        prompt_value "APPLE_TEAM_ID" "Apple Team ID" "" true
    fi
fi
echo ""

# Set file permissions
chmod 600 "${ENV_FILE}"
echo -e "${GREEN}File permissions set to 600 (owner read/write only)${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo "Secrets setup completed!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}File created: ${ENV_FILE}${NC}"
echo -e "${YELLOW}IMPORTANT:${NC}"
echo "1. Review the file and ensure all values are correct"
echo "2. Keep this file secure - it contains sensitive information"
echo "3. Never commit this file to version control"
echo "4. For deployment, copy this file to the server at /opt/numerai/.env.production"
echo ""
echo "Next steps:"
echo "  - Review: cat ${ENV_FILE}"
echo "  - Deploy to server: ./deploy/digitalocean/ssh-deploy.sh"
echo ""

