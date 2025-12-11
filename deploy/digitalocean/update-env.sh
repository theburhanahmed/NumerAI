#!/bin/bash
# Environment Variable Management Script
# Helps set up and update production environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_DIR="/opt/numerai"
ENV_FILE="${APP_DIR}/.env.production"
EXAMPLE_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/deploy/digitalocean/.env.production.example"

echo "=========================================="
echo "NumerAI Environment Variable Setup"
echo "=========================================="

# Check if example file exists
if [ ! -f "${EXAMPLE_FILE}" ]; then
    echo -e "${RED}Example file not found: ${EXAMPLE_FILE}${NC}"
    exit 1
fi

# Create .env.production from example if it doesn't exist
if [ ! -f "${ENV_FILE}" ]; then
    echo -e "${YELLOW}Creating ${ENV_FILE} from example...${NC}"
    cp "${EXAMPLE_FILE}" "${ENV_FILE}"
    chmod 600 "${ENV_FILE}"
    echo -e "${GREEN}Created ${ENV_FILE}${NC}"
    echo ""
    echo -e "${YELLOW}Please edit ${ENV_FILE} and set all required values${NC}"
    echo "You can use: nano ${ENV_FILE}"
    exit 0
fi

# Function to update a variable
update_var() {
    local key=$1
    local value=$2
    local file=$3
    
    if grep -q "^${key}=" "${file}"; then
        # Variable exists, update it
        sed -i "s|^${key}=.*|${key}=${value}|" "${file}"
        echo -e "${GREEN}Updated ${key}${NC}"
    else
        # Variable doesn't exist, add it
        echo "${key}=${value}" >> "${file}"
        echo -e "${GREEN}Added ${key}${NC}"
    fi
}

# Interactive mode
echo "Current environment variables in ${ENV_FILE}:"
echo ""
cat "${ENV_FILE}" | grep -v "^#" | grep -v "^$" | sed 's/=.*/=***HIDDEN***/'
echo ""

read -p "Do you want to update environment variables? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting..."
    exit 0
fi

# Key variables to set
echo ""
echo "Enter values for required variables (press Enter to skip):"
echo ""

read -p "Domain name (e.g., numerai.example.com): " DOMAIN
if [ ! -z "$DOMAIN" ]; then
    update_var "ALLOWED_HOSTS" "$DOMAIN" "${ENV_FILE}"
    update_var "CORS_ALLOWED_ORIGINS" "https://${DOMAIN}" "${ENV_FILE}"
    update_var "CSRF_TRUSTED_ORIGINS" "https://${DOMAIN}" "${ENV_FILE}"
    update_var "NEXT_PUBLIC_API_URL" "https://${DOMAIN}/api/v1" "${ENV_FILE}"
fi

read -p "Django SECRET_KEY (generate new? y/N): " GEN_SECRET
if [[ $GEN_SECRET =~ ^[Yy]$ ]]; then
    SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 2>/dev/null || openssl rand -hex 32)
    update_var "SECRET_KEY" "$SECRET_KEY" "${ENV_FILE}"
    echo -e "${GREEN}Generated new SECRET_KEY${NC}"
fi

read -p "Database name [numerai]: " DB_NAME
update_var "DB_NAME" "${DB_NAME:-numerai}" "${ENV_FILE}"

read -p "Database user [numerai]: " DB_USER
update_var "DB_USER" "${DB_USER:-numerai}" "${ENV_FILE}"

read -sp "Database password: " DB_PASSWORD
echo
if [ ! -z "$DB_PASSWORD" ]; then
    update_var "DB_PASSWORD" "$DB_PASSWORD" "${ENV_FILE}"
fi

read -p "Email host (SMTP): " EMAIL_HOST
if [ ! -z "$EMAIL_HOST" ]; then
    update_var "EMAIL_HOST" "$EMAIL_HOST" "${ENV_FILE}"
    
    read -p "Email port [587]: " EMAIL_PORT
    update_var "EMAIL_PORT" "${EMAIL_PORT:-587}" "${ENV_FILE}"
    
    read -p "Email user: " EMAIL_USER
    if [ ! -z "$EMAIL_USER" ]; then
        update_var "EMAIL_USER" "$EMAIL_USER" "${ENV_FILE}"
    fi
    
    read -sp "Email password: " EMAIL_PASSWORD
    echo
    if [ ! -z "$EMAIL_PASSWORD" ]; then
        update_var "EMAIL_PASSWORD" "$EMAIL_PASSWORD" "${ENV_FILE}"
    fi
fi

echo ""
echo -e "${GREEN}Environment variables updated!${NC}"
echo ""
echo "File location: ${ENV_FILE}"
echo "To edit manually: nano ${ENV_FILE}"
echo ""
