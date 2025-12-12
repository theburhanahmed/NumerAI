#!/bin/bash
# DigitalOcean Droplet Initial Server Setup Script
# This script sets up a fresh Ubuntu 22.04 server for NumerAI deployment

set -e  # Exit on error

echo "=========================================="
echo "NumerAI Server Setup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Update system packages
echo -e "${GREEN}[1/8] Updating system packages...${NC}"
# Fix any dpkg issues first
dpkg --configure -a || true
# Wait for any existing apt processes to finish
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
    echo "Waiting for apt to finish..."
    sleep 5
done
# Kill any stuck apt processes (if any)
pkill -9 apt-get 2>/dev/null || true
pkill -9 apt 2>/dev/null || true
sleep 2
apt-get update
apt-get upgrade -y

# Install essential packages
echo -e "${GREEN}[2/8] Installing essential packages...${NC}"
apt-get install -y \
    curl \
    wget \
    git \
    ufw \
    fail2ban \
    unattended-upgrades \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common

# Install Docker
echo -e "${GREEN}[3/8] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    # Remove old versions
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Add Docker's official GPG key
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    
    # Set up repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
else
    echo "Docker is already installed"
fi

# Install Docker Compose (standalone)
echo -e "${GREEN}[4/8] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="v2.24.0"
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
else
    echo "Docker Compose is already installed"
fi

# Install nginx
echo -e "${GREEN}[5/8] Installing nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
else
    echo "nginx is already installed"
fi

# Configure firewall
echo -e "${GREEN}[6/8] Configuring firewall (UFW)...${NC}"
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw reload

# Create application user and directories
echo -e "${GREEN}[7/8] Creating application user and directories...${NC}"
if ! id "numerai" &>/dev/null; then
    useradd -m -s /bin/bash numerai
    usermod -aG docker numerai
    echo "Created user 'numerai'"
else
    echo "User 'numerai' already exists"
    usermod -aG docker numerai
fi

# Create application directories
APP_DIR="/opt/numerai"
mkdir -p ${APP_DIR}
mkdir -p ${APP_DIR}/logs
mkdir -p ${APP_DIR}/backups
mkdir -p /var/www/numerai/static
mkdir -p /var/www/numerai/media
chown -R numerai:numerai ${APP_DIR}
chown -R numerai:numerai /var/www/numerai

# Set up log rotation
echo -e "${GREEN}[8/8] Setting up log rotation...${NC}"
cat > /etc/logrotate.d/numerai << EOF
${APP_DIR}/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 numerai numerai
    sharedscripts
    postrotate
        docker-compose -f ${APP_DIR}/docker-compose.prod.yml restart backend frontend || true
    endscript
}
EOF

# Configure automatic security updates
echo -e "${GREEN}Configuring automatic security updates...${NC}"
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

echo "0 3 * * * root /usr/bin/unattended-upgrade" | tee /etc/cron.d/auto-update

# Verify installations
echo -e "${GREEN}Verifying installations...${NC}"
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
echo "nginx version: $(nginx -v 2>&1)"
echo "UFW status: $(ufw status | head -n 1)"

echo ""
echo -e "${GREEN}=========================================="
echo "Server setup completed successfully!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Clone your repository to ${APP_DIR}"
echo "2. Copy and configure .env.production file"
echo "3. Run the deployment script: ./deploy/digitalocean/deploy.sh"
echo "4. Set up SSL certificates: ./deploy/digitalocean/setup-ssl.sh"
echo ""
