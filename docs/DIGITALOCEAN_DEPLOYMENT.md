# DigitalOcean Droplet Deployment Guide

Complete guide for deploying NumerAI to DigitalOcean Droplets.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Droplet Setup](#droplet-setup)
3. [Initial Server Configuration](#initial-server-configuration)
4. [Application Deployment](#application-deployment)
5. [SSL Certificate Setup](#ssl-certificate-setup)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Backup & Recovery](#backup--recovery)

---

## Prerequisites

### Required Accounts & Services

- **DigitalOcean Account**: Sign up at https://www.digitalocean.com
- **Domain Name**: Point your domain to DigitalOcean nameservers
- **GitHub Repository**: Code should be in a Git repository
- **Email Service**: SMTP credentials (Gmail, SendGrid, Mailgun, etc.)
- **OpenAI API Key**: For AI features
- **Stripe Account**: For payment processing (optional)
- **Firebase Project**: For push notifications (optional)

### Required Information

Before starting, gather:
- Domain name
- Email for Let's Encrypt SSL certificates
- SMTP email credentials
- API keys (OpenAI, Stripe, Firebase, etc.)

---

## Droplet Setup

### Step 1: Create a DigitalOcean Droplet

1. Log in to DigitalOcean Dashboard
2. Click **"Create"** → **"Droplets"**
3. Configure your droplet:

   **Image:**
   - Choose: **Ubuntu 22.04 (LTS) x64**

   **Plan:**
   - **Minimum**: 4GB RAM / 2 vCPUs ($24/month)
   - **Recommended**: 8GB RAM / 4 vCPUs ($48/month)
   - For production with high traffic: 16GB+ RAM

   **Datacenter Region:**
   - Choose closest to your users
   - Recommended: New York, San Francisco, or Amsterdam

   **Authentication:**
   - **SSH keys** (recommended) or Password
   - Add your SSH public key

   **Hostname:**
   - `numerai-production` or your preferred name

4. Click **"Create Droplet"**
5. Wait 1-2 minutes for droplet creation

### Step 2: Configure DNS

1. In DigitalOcean Dashboard, go to **"Networking"** → **"Domains"**
2. Add your domain
3. Add DNS records:
   ```
   Type    Name    Value              TTL
   A       @       <droplet-ip>       3600
   A       www     <droplet-ip>       3600
   ```
4. Update nameservers at your domain registrar to point to DigitalOcean

### Step 3: Connect to Your Droplet

```bash
ssh root@<your-droplet-ip>
# Or if using SSH key:
ssh root@<your-droplet-ip>
```

---

## Initial Server Configuration

### Step 1: Run Server Setup Script

1. Clone your repository (temporarily, we'll move it later):

```bash
cd /tmp
git clone https://github.com/yourusername/NumerAI.git
cd NumerAI
```

2. Make scripts executable:

```bash
chmod +x deploy/digitalocean/setup-server.sh
chmod +x deploy/digitalocean/deploy.sh
chmod +x deploy/digitalocean/update-env.sh
chmod +x deploy/digitalocean/setup-ssl.sh
chmod +x deploy/digitalocean/systemd/install-services.sh
```

3. Run the server setup script:

```bash
sudo ./deploy/digitalocean/setup-server.sh
```

This script will:
- Update system packages
- Install Docker and Docker Compose
- Install nginx
- Configure firewall (UFW)
- Create application user and directories
- Set up log rotation

**Expected time:** 5-10 minutes

### Step 2: Move Application to Production Directory

```bash
sudo mv /tmp/NumerAI /opt/numerai
sudo chown -R numerai:numerai /opt/numerai
```

### Step 3: Configure Environment Variables

1. Copy the environment template:

```bash
cd /opt/numerai
sudo -u numerai cp deploy/digitalocean/env.production.example .env.production
sudo chmod 600 .env.production
```

2. Edit the environment file:

```bash
sudo -u numerai nano .env.production
```

3. Fill in all required values (see [Environment Variables](#environment-variables) section)

4. Or use the interactive script:

```bash
sudo -u numerai ./deploy/digitalocean/update-env.sh
```

---

## Application Deployment

### Step 1: Configure nginx

1. Copy nginx configuration:

```bash
sudo cp /opt/numerai/deploy/digitalocean/nginx/numerai.conf /etc/nginx/sites-available/numerai.conf
```

2. Update domain name in nginx config:

```bash
sudo nano /etc/nginx/sites-available/numerai.conf
```

Replace `server_name _;` with your domain:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

3. Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/numerai.conf /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
```

4. Test nginx configuration:

```bash
sudo nginx -t
```

5. Start nginx (will be configured for SSL later):

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 2: Deploy Application

1. Switch to the numerai user:

```bash
sudo su - numerai
cd /opt/numerai
```

2. Run the deployment script:

```bash
./deploy/digitalocean/deploy.sh
```

This script will:
- Pull latest code from Git
- Build Docker images
- Start database and Redis
- Run database migrations
- Collect static files
- Start all services

**Expected time:** 10-15 minutes for first deployment

### Step 3: Install Celery Systemd Services

1. Install the systemd services:

```bash
sudo ./deploy/digitalocean/systemd/install-services.sh
```

2. Start Celery services:

```bash
sudo systemctl start celery-worker
sudo systemctl start celery-beat
```

3. Verify they're running:

```bash
sudo systemctl status celery-worker
sudo systemctl status celery-beat
```

---

## SSL Certificate Setup

### Step 1: Run SSL Setup Script

```bash
cd /opt/numerai
sudo ./deploy/digitalocean/setup-ssl.sh
```

The script will:
- Install certbot
- Obtain Let's Encrypt certificate
- Configure nginx with SSL
- Set up automatic renewal

**Note:** Your domain must be pointing to the droplet IP before running this.

### Step 2: Verify SSL

1. Test your site:

```bash
curl -I https://yourdomain.com
```

2. Check certificate:

```bash
sudo certbot certificates
```

3. Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## Post-Deployment Configuration

### Step 1: Verify Services

Check all services are running:

```bash
# Docker containers
docker ps

# Systemd services
sudo systemctl status celery-worker
sudo systemctl status celery-beat
sudo systemctl status nginx

# Check logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=50
```

### Step 2: Test Application

1. **Backend Health Check:**

```bash
curl https://yourdomain.com/api/v1/health/
```

Expected response:
```json
{"status": "healthy"}
```

2. **Frontend:**

Open in browser: `https://yourdomain.com`

3. **API Documentation:**

Visit: `https://yourdomain.com/api/schema/swagger-ui/`

### Step 3: Create Superuser

```bash
cd /opt/numerai
sudo -u numerai docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### Step 4: Configure Backups

See [Backup & Recovery](#backup--recovery) section.

---

## Environment Variables

### Required Variables

```bash
# Django
DEBUG=False
SECRET_KEY=<generate-strong-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=numerai
DB_USER=numerai
DB_PASSWORD=<strong-password>
DB_HOST=postgres
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

### Optional Variables

```bash
# Payments (Stripe)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI (OpenAI)
OPENAI_API_KEY=sk-...

# Firebase (Push Notifications)
FIREBASE_CREDENTIALS=base64-encoded-json
```

### Generating SECRET_KEY

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Monitoring & Maintenance

### Viewing Logs

**Docker Services:**
```bash
# All services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f frontend
```

**Systemd Services:**
```bash
# Celery worker
sudo journalctl -u celery-worker -f

# Celery beat
sudo journalctl -u celery-beat -f

# nginx
sudo tail -f /var/log/nginx/numerai-access.log
sudo tail -f /var/log/nginx/numerai-error.log
```

### Updating the Application

1. Pull latest code:

```bash
cd /opt/numerai
sudo -u numerai git pull origin main
```

2. Rebuild and deploy:

```bash
sudo -u numerai ./deploy/digitalocean/deploy.sh
```

3. Restart Celery services:

```bash
sudo systemctl restart celery-worker celery-beat
```

### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
cd /opt/numerai
sudo -u numerai docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
sudo -u numerai docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Health Checks

Create a monitoring script:

```bash
#!/bin/bash
# /opt/numerai/health-check.sh

HEALTH_URL="https://yourdomain.com/api/v1/health/"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✓ Application is healthy"
    exit 0
else
    echo "✗ Application health check failed (HTTP $RESPONSE)"
    exit 1
fi
```

Add to crontab for regular checks:

```bash
# Check every 5 minutes
*/5 * * * * /opt/numerai/health-check.sh
```

---

## Troubleshooting

### Application Won't Start

1. **Check Docker containers:**

```bash
docker ps -a
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

2. **Check logs:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs frontend
```

3. **Check environment variables:**

```bash
cd /opt/numerai
sudo -u numerai cat .env.production
```

4. **Verify database connection:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py dbshell
```

### Database Migration Issues

```bash
cd /opt/numerai
sudo -u numerai docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py migrate --fake-initial
```

### nginx Errors

1. **Test configuration:**

```bash
sudo nginx -t
```

2. **Check error logs:**

```bash
sudo tail -f /var/log/nginx/numerai-error.log
```

3. **Reload nginx:**

```bash
sudo systemctl reload nginx
```

### SSL Certificate Issues

1. **Check certificate status:**

```bash
sudo certbot certificates
```

2. **Renew certificate manually:**

```bash
sudo certbot renew
```

3. **Check nginx SSL configuration:**

```bash
sudo nginx -t
```

### Celery Not Working

1. **Check service status:**

```bash
sudo systemctl status celery-worker
sudo systemctl status celery-beat
```

2. **View logs:**

```bash
sudo journalctl -u celery-worker -n 50
sudo journalctl -u celery-beat -n 50
```

3. **Restart services:**

```bash
sudo systemctl restart celery-worker celery-beat
```

### Static Files Not Loading

1. **Collect static files:**

```bash
cd /opt/numerai
sudo -u numerai docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

2. **Copy to nginx directory:**

```bash
sudo cp -r /opt/numerai/backend/staticfiles/* /var/www/numerai/static/
sudo chown -R www-data:www-data /var/www/numerai/static
```

3. **Check nginx static file configuration:**

```bash
sudo nano /etc/nginx/sites-available/numerai.conf
```

### High Memory Usage

1. **Check resource usage:**

```bash
docker stats
free -h
df -h
```

2. **Restart services:**

```bash
cd /opt/numerai
sudo -u numerai docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

3. **Consider upgrading droplet size**

---

## Backup & Recovery

### Database Backups

1. **Create backup script:**

```bash
#!/bin/bash
# /opt/numerai/backup-db.sh

BACKUP_DIR="/opt/numerai/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

docker-compose -f /opt/numerai/docker-compose.yml -f /opt/numerai/docker-compose.prod.yml exec -T postgres pg_dump -U numerai numerai > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE.gz"
```

2. **Make executable:**

```bash
chmod +x /opt/numerai/backup-db.sh
```

3. **Add to crontab (daily at 2 AM):**

```bash
sudo crontab -e
# Add:
0 2 * * * /opt/numerai/backup-db.sh
```

### Restore Database

```bash
# Decompress backup
gunzip backup_file.sql.gz

# Restore
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U numerai numerai < backup_file.sql
```

### File Backups

1. **Backup media files:**

```bash
tar -czf /opt/numerai/backups/media_backup_$(date +%Y%m%d).tar.gz /opt/numerai/backend/media
```

2. **Backup environment file:**

```bash
cp /opt/numerai/.env.production /opt/numerai/backups/.env.production.backup
```

### Automated Backups to DigitalOcean Spaces

1. Install s3cmd or use rclone
2. Configure credentials
3. Upload backups automatically

---

## Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use SSH keys only** (disable password authentication)

3. **Configure fail2ban:**
   ```bash
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

4. **Regular security audits:**
   ```bash
   sudo apt install unattended-upgrades
   ```

5. **Monitor logs regularly**

6. **Use strong passwords** for all services

7. **Limit database access** (only from localhost)

8. **Regular backups** (automated)

---

## Scaling Considerations

### Vertical Scaling (Upgrade Droplet)

1. Create snapshot of current droplet
2. Create new larger droplet from snapshot
3. Update DNS if IP changes
4. Verify all services

### Horizontal Scaling (Multiple Droplets)

For high traffic, consider:
- Load balancer (DigitalOcean Load Balancer)
- Separate database server (Managed Database)
- Redis cluster
- CDN for static assets

---

## Support & Resources

- **DigitalOcean Documentation**: https://docs.digitalocean.com
- **Docker Documentation**: https://docs.docker.com
- **nginx Documentation**: https://nginx.org/en/docs/
- **Django Deployment**: https://docs.djangoproject.com/en/stable/howto/deployment/

---

## Quick Reference Commands

```bash
# View all containers
docker ps

# View logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart

# Run migrations
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Check nginx status
sudo systemctl status nginx

# Check Celery status
sudo systemctl status celery-worker celery-beat

# View system resources
htop
df -h
free -h
```

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0
