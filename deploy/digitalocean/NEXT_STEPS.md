1# Next Steps for DigitalOcean Deployment

## Current Status

✅ **Completed:**
- DigitalOcean droplet created (ID: 536446269, IP: 146.190.74.172)
- Server setup completed (Docker, nginx, firewall)
- Repository cloned from GitHub
- Environment variables configured
- nginx configured (HTTP only, ready for SSL)
- Docker images building

🔄 **In Progress:**
- Docker images are currently building
- Need to complete deployment after build finishes

## Immediate Next Steps

### 1. Complete Deployment (After Build Finishes)

SSH into the server and complete deployment:

```bash
ssh root@146.190.74.172
cd /opt/numerai

# Load environment variables properly (avoiding shell syntax issues)
export $(grep -v '^#' .env.production | grep -v '^$' | sed 's/^/export /' | xargs -0)

# Or use docker-compose with env file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d
```

### 2. Fix Environment Variable Loading

The `.env.production` file has special characters in SECRET_KEY that cause shell issues. Use one of these methods:

**Option A: Use docker-compose env-file flag**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d
```

**Option B: Export variables safely**
```bash
# On server
cd /opt/numerai
while IFS='=' read -r key value; do
    [ -z "$key" ] && continue
    export "$key=$value"
done < .env.production
```

### 3. Complete Deployment Steps

```bash
# 1. Start database and redis
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres redis

# 2. Wait for database (30 seconds)
sleep 30

# 3. Run migrations
docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend python manage.py migrate --no-input

# 4. Collect static files
docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --noinput

# 5. Copy static files to nginx
cp -r backend/staticfiles/* /var/www/numerai/static/
chown -R www-data:www-data /var/www/numerai/static

# 6. Start all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 7. Install and start Celery
bash deploy/digitalocean/systemd/install-services.sh
systemctl start celery-worker celery-beat
systemctl enable celery-worker celery-beat
```

### 4. Configure DNS

Point your domain to the droplet:

1. Go to your domain registrar (where you manage numerobuddy.com)
2. Add/Update A record:
   - **Type:** A
   - **Name:** @ (or blank)
   - **Value:** `146.190.74.172`
   - **TTL:** 3600
3. Wait 5-10 minutes for DNS propagation
4. Verify: `dig numerobuddy.com +short` should return `146.190.74.172`

### 5. Set Up SSL Certificate

After DNS is configured:

```bash
ssh root@146.190.74.172
cd /opt/numerai
bash deploy/digitalocean/setup-ssl.sh
```

Follow prompts:
- Domain: `numerobuddy.com`
- Email: `burhanahmed29@gmail.com`

### 6. Create Admin User

```bash
ssh root@146.190.74.172
cd /opt/numerai
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### 7. Verify Deployment

```bash
# Health check
curl http://146.190.74.172/api/v1/health/
# Or after DNS: curl http://numerobuddy.com/api/v1/health/

# Check services
docker ps
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
systemctl status celery-worker
systemctl status celery-beat
```

## Quick Deployment Script

Run this on the server to complete deployment:

```bash
ssh root@146.190.74.172 "cd /opt/numerai && bash -s" << 'EOF'
# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres redis
sleep 30

# Migrations and static files
docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend python manage.py migrate --no-input
docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --noinput

# Copy static files
[ -d "backend/staticfiles" ] && cp -r backend/staticfiles/* /var/www/numerai/static/ && chown -R www-data:www-data /var/www/numerai/static

# Start all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Celery
bash deploy/digitalocean/systemd/install-services.sh
systemctl start celery-worker celery-beat
systemctl enable celery-worker celery-beat

echo "Deployment complete!"
docker ps
EOF
```

## Troubleshooting

### Environment Variables Not Loading

The SECRET_KEY has special characters. Use docker-compose's `--env-file` flag instead of `source`:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d
```

### Services Won't Start

Check logs:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs
```

### Database Connection Issues

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres pg_isready -U numerai
```

## Your Application URLs

- **HTTP (now):** http://146.190.74.172
- **HTTP (after DNS):** http://numerobuddy.com
- **HTTPS (after SSL):** https://numerobuddy.com
- **API:** http://numerobuddy.com/api/v1
- **Health Check:** http://numerobuddy.com/api/v1/health/

## Summary

The deployment is mostly complete. The main remaining tasks are:

1. ✅ Wait for Docker build to finish (in progress)
2. ⏳ Complete deployment steps above
3. ⏳ Configure DNS
4. ⏳ Set up SSL
5. ⏳ Create admin user
6. ⏳ Test application

All the infrastructure is ready - just need to complete the application deployment steps!
