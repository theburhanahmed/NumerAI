# DigitalOcean Deployment Files

This directory contains all files needed to deploy NumerAI to DigitalOcean Droplets.

## Quick Start

1. **Initial Server Setup:**
   ```bash
   sudo ./setup-server.sh
   ```

2. **Configure Environment:**
   ```bash
   sudo -u numerai ./update-env.sh
   # Or manually edit .env.production
   ```

3. **Deploy Application:**
   ```bash
   sudo -u numerai ./deploy.sh
   ```

4. **Set Up SSL:**
   ```bash
   sudo ./setup-ssl.sh
   ```

5. **Install Celery Services:**
   ```bash
   sudo ./systemd/install-services.sh
   ```

## File Structure

```
deploy/digitalocean/
├── README.md                    # This file
├── setup-server.sh              # Initial server setup (Docker, nginx, etc.)
├── deploy.sh                    # Application deployment script
├── update-env.sh                # Environment variable management
├── setup-ssl.sh                 # SSL certificate setup with Let's Encrypt
├── env.production.example       # Environment variables template
├── nginx/
│   ├── numerai.conf            # Main nginx configuration
│   └── nginx.conf              # Base nginx configuration
└── systemd/
    ├── celery-worker.service   # Celery worker systemd service
    ├── celery-beat.service     # Celery beat systemd service
    └── install-services.sh     # Install systemd services script
```

## Detailed Documentation

For complete deployment instructions, see:
- [DigitalOcean Deployment Guide](../../docs/DIGITALOCEAN_DEPLOYMENT.md)

## Scripts Overview

### setup-server.sh
Initial server configuration:
- Updates system packages
- Installs Docker and Docker Compose
- Installs nginx
- Configures firewall (UFW)
- Creates application user and directories
- Sets up log rotation

**Run as:** `sudo`

### deploy.sh
Deploys the application:
- Pulls latest code from Git
- Builds Docker images
- Runs database migrations
- Collects static files
- Starts all services

**Run as:** `numerai` user (or with sudo)

### update-env.sh
Interactive environment variable setup:
- Creates .env.production from template
- Guides through setting required variables

**Run as:** `numerai` user (or with sudo)

### setup-ssl.sh
SSL certificate setup:
- Installs certbot
- Obtains Let's Encrypt certificate
- Configures nginx with SSL
- Sets up auto-renewal

**Run as:** `sudo`

### systemd/install-services.sh
Installs Celery systemd services:
- Copies service files to /etc/systemd/system/
- Enables services
- Provides management commands

**Run as:** `sudo`

## Environment Variables

Copy `env.production.example` to `/opt/numerai/.env.production` and fill in all values.

Required variables:
- `SECRET_KEY` - Django secret key
- `ALLOWED_HOSTS` - Your domain name(s)
- `DB_PASSWORD` - Database password
- `EMAIL_*` - SMTP email configuration
- `NEXT_PUBLIC_API_URL` - Frontend API URL

See `env.production.example` for all available options.

## nginx Configuration

The nginx configuration (`nginx/numerai.conf`) needs to be:
1. Copied to `/etc/nginx/sites-available/numerai.conf`
2. Domain name updated (replace `_` with your domain)
3. Enabled via symlink to `/etc/nginx/sites-enabled/`

After SSL setup, certificate paths will be automatically configured.

## Troubleshooting

Common issues and solutions:

1. **Services won't start:**
   - Check logs: `docker-compose logs`
   - Verify environment variables: `cat .env.production`
   - Check database connection

2. **nginx errors:**
   - Test config: `sudo nginx -t`
   - Check logs: `sudo tail -f /var/log/nginx/error.log`

3. **SSL certificate issues:**
   - Verify domain DNS points to droplet
   - Check certbot: `sudo certbot certificates`

For more troubleshooting, see the main deployment guide.

## Maintenance

### Updating the Application

```bash
cd /opt/numerai
sudo -u numerai git pull
sudo -u numerai ./deploy.sh
```

### Viewing Logs

```bash
# Docker services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Celery services
sudo journalctl -u celery-worker -f
sudo journalctl -u celery-beat -f

# nginx
sudo tail -f /var/log/nginx/numerai-access.log
```

### Restarting Services

```bash
# Docker services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart

# Celery services
sudo systemctl restart celery-worker celery-beat

# nginx
sudo systemctl reload nginx
```

## Security Notes

- Never commit `.env.production` to git
- Use strong passwords for all services
- Keep system packages updated
- Regularly review logs for suspicious activity
- Use SSH keys, not passwords
- Configure firewall properly (UFW)

## Support

For issues or questions:
1. Check the main deployment guide
2. Review service logs
3. Verify configuration files
4. Check DigitalOcean documentation
