# Step-by-Step DigitalOcean Deployment Guide

Complete guide to deploy NumerAI to DigitalOcean Droplets.

## Prerequisites Checklist

- [ ] DigitalOcean account (sign up at https://www.digitalocean.com)
- [ ] Domain name: `numerobuddy.com` (or use droplet IP)
- [ ] DigitalOcean API token
- [ ] SSH key pair (will be created automatically if needed)
- [ ] Email credentials (for SMTP)
- [ ] API keys ready (OpenAI, Stripe, Firebase - optional)

---

## Step 1: Get DigitalOcean API Token

1. Go to: https://cloud.digitalocean.com/account/api/tokens
2. Click **"Generate New Token"**
3. Name it: `NumerAI Deployment`
4. Select **"Write"** scope
5. Click **"Generate Token"**
6. **Copy the token immediately** (you won't see it again!)

---

## Step 2: Install DigitalOcean CLI (doctl)

**On macOS:**
```bash
brew install doctl
```

**On Linux:**
```bash
cd /Users/burhanahmed/Desktop/NumerAI
bash deploy/digitalocean/install-doctl.sh
```

**Verify installation:**
```bash
doctl version
```

---

## Step 3: Configure Deployment

1. Navigate to deployment directory:
```bash
cd /Users/burhanahmed/Desktop/NumerAI/deploy/digitalocean
```

2. Create or edit the config file:
```bash
nano deploy-config.env
```

3. Fill in your values:
```bash
# DigitalOcean API Token (REQUIRED)
DO_API_TOKEN=dop_v1_your_token_here

# Droplet Configuration
DROPLET_NAME=numerai-production
DROPLET_SIZE=s-2vcpu-4gb        # 4GB RAM, 2 vCPUs ($24/month)
DROPLET_REGION=nyc1             # Choose closest to your users
DROPLET_IMAGE=ubuntu-22-04-x64

# Domain Configuration (REQUIRED)
DOMAIN_NAME=numerobuddy.com
DOMAIN_EMAIL=burhanahmed29@gmail.com

# Repository
GIT_REPO=https://github.com/theburhanahmed/NumerAI.git
GIT_BRANCH=main

# Optional: Email Configuration (set later if needed)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=burhanahmed29@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: API Keys (set later if needed)
OPENAI_API_KEY=sk-your-key
STRIPE_PUBLIC_KEY=pk_live_your-key
STRIPE_SECRET_KEY=sk_live_your-key
```

**Save the file** (Ctrl+X, then Y, then Enter)

---

## Step 4: Run Automated Deployment

```bash
cd /Users/burhanahmed/Desktop/NumerAI/deploy/digitalocean
chmod +x auto-deploy.sh
./auto-deploy.sh
```

**What this does:**
1. ✅ Authenticates with DigitalOcean
2. ✅ Creates or uses existing droplet
3. ✅ Sets up SSH keys
4. ✅ Installs Docker, nginx, and dependencies
5. ✅ Clones your repository
6. ✅ Configures environment variables
7. ✅ Builds and deploys all services
8. ✅ Sets up SSL certificates (if DNS is ready)

**Expected time:** 20-30 minutes

---

## Step 5: Configure DNS (If Using Domain)

After deployment completes, you'll get a droplet IP address.

1. **Go to your domain registrar** (where you bought numerobuddy.com)

2. **Add/Update DNS A Record:**
   - **Type:** A
   - **Name:** @ (or blank, or `www`)
   - **Value:** `<your-droplet-ip>` (e.g., `146.190.74.172`)
   - **TTL:** 3600

3. **Wait 5-10 minutes** for DNS propagation

4. **Verify DNS:**
```bash
dig numerobuddy.com +short
# Should return your droplet IP
```

5. **Set up SSL certificate:**
```bash
ssh root@<your-droplet-ip>
cd /opt/numerai
bash deploy/digitalocean/setup-ssl.sh
```
Follow the prompts:
- Domain: `numerobuddy.com`
- Email: `burhanahmed29@gmail.com`

---

## Step 6: Create Admin User

```bash
ssh numerai@<your-droplet-ip>
cd /opt/numerai
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

Enter:
- Username: (your choice)
- Email: (your email)
- Password: (strong password)

---

## Step 7: Verify Deployment

### Check Services

```bash
# SSH into droplet
ssh root@<your-droplet-ip>

# Check Docker containers
docker ps

# Check systemd services
systemctl status celery-worker
systemctl status celery-beat
systemctl status nginx
```

### Test Endpoints

```bash
# Health check
curl https://numerobuddy.com/api/v1/health/

# Frontend
curl -I https://numerobuddy.com

# API docs
open https://numerobuddy.com/api/schema/swagger-ui/
```

### View Logs

```bash
# Backend logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend

# Frontend logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f frontend

# Celery logs
journalctl -u celery-worker -f
journalctl -u celery-beat -f

# nginx logs
tail -f /var/log/nginx/numerai-access.log
tail -f /var/log/nginx/numerai-error.log
```

---

## Step 8: Configure Email (If Not Done)

1. **Get Gmail App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate app password for "Mail"
   - Copy the 16-character password

2. **Update environment file on server:**
```bash
ssh numerai@<your-droplet-ip>
nano /opt/numerai/.env.production
```

Update:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USER=burhanahmed29@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

3. **Restart backend:**
```bash
cd /opt/numerai
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

---

## Manual Deployment (Alternative)

If automated deployment doesn't work, follow these manual steps:

### 1. Create Droplet Manually

1. Go to: https://cloud.digitalocean.com/droplets/new
2. Choose:
   - **Image:** Ubuntu 22.04 (LTS)
   - **Plan:** Basic - Regular - 4GB RAM / 2 vCPUs ($24/month)
   - **Region:** Choose closest to users
   - **Authentication:** SSH keys (add your key)
   - **Hostname:** `numerai-production`
3. Click **"Create Droplet"**

### 2. SSH into Droplet

```bash
ssh root@<your-droplet-ip>
```

### 3. Run Server Setup

```bash
# Clone repository
cd /tmp
git clone https://github.com/theburhanahmed/NumerAI.git
cd NumerAI

# Run setup script
chmod +x deploy/digitalocean/setup-server.sh
bash deploy/digitalocean/setup-server.sh
```

### 4. Move Application

```bash
mv /tmp/NumerAI /opt/numerai
chown -R numerai:numerai /opt/numerai
```

### 5. Configure Environment

```bash
cd /opt/numerai
cp deploy/digitalocean/env.production.example .env.production
nano .env.production
```

Fill in all required values (see environment template).

### 6. Configure nginx

```bash
sudo cp deploy/digitalocean/nginx/numerai.conf /etc/nginx/sites-available/numerai.conf
sudo sed -i 's/server_name _;/server_name numerobuddy.com www.numerobuddy.com;/g' /etc/nginx/sites-available/numerai.conf
sudo ln -s /etc/nginx/sites-available/numerai.conf /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Deploy Application

```bash
sudo su - numerai
cd /opt/numerai
bash deploy/digitalocean/deploy.sh
```

### 8. Install Celery Services

```bash
exit  # Exit from numerai user
sudo bash /opt/numerai/deploy/digitalocean/systemd/install-services.sh
sudo systemctl start celery-worker celery-beat
sudo systemctl enable celery-worker celery-beat
```

### 9. Set Up SSL

```bash
sudo bash /opt/numerai/deploy/digitalocean/setup-ssl.sh
```

---

## Updating the Application

When you push new code:

```bash
ssh numerai@<your-droplet-ip>
cd /opt/numerai
git pull origin main
bash deploy/digitalocean/deploy.sh
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs

# Check environment
cat .env.production

# Restart services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

### Database Connection Issues

```bash
# Check database is running
docker ps | grep postgres

# Test connection
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py dbshell
```

### nginx Errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/numerai-error.log

# Reload nginx
sudo systemctl reload nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check DNS
dig numerobuddy.com
```

---

## Quick Reference Commands

```bash
# SSH into droplet
ssh root@<droplet-ip>
ssh numerai@<droplet-ip>

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

# Check Celery
sudo systemctl status celery-worker
sudo journalctl -u celery-worker -f

# Check nginx
sudo systemctl status nginx
sudo nginx -t
```

---

## Cost Estimate

- **Droplet (4GB RAM):** $24/month
- **Domain:** ~$10-15/year
- **Total:** ~$25-30/month

---

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH keys only (password auth disabled)
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Database not exposed publicly
- [ ] Regular backups configured
- [ ] System updates automated

---

## Next Steps

1. ✅ Set up monitoring and alerts
2. ✅ Configure automated backups
3. ✅ Set up CDN (DigitalOcean Spaces or Cloudflare)
4. ✅ Configure domain email (optional)
5. ✅ Set up staging environment (optional)

---

## Support

For detailed information:
- [Full Deployment Guide](docs/DIGITALOCEAN_DEPLOYMENT.md)
- [Quick Start Guide](deploy/digitalocean/QUICK_START.md)
- [Troubleshooting](docs/DIGITALOCEAN_DEPLOYMENT.md#troubleshooting)

---

**Your Application URLs:**
- Frontend: `https://numerobuddy.com`
- Backend API: `https://numerobuddy.com/api/v1`
- Health Check: `https://numerobuddy.com/api/v1/health/`
- API Docs: `https://numerobuddy.com/api/schema/swagger-ui/`
