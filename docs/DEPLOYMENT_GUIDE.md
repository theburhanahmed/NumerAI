# NumerAI Deployment Guide

## Overview

This guide covers deployment of the NumerAI platform to production environments.

## Architecture

- **Backend**: Django REST API (Python)
- **Frontend**: Next.js (React/TypeScript)
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **Task Queue**: Celery
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker & Docker Compose
- PostgreSQL 14+ (or managed database)
- Redis 6+ (or managed Redis)
- Domain name with SSL certificate
- Environment variables configured

## Environment Variables

### Backend (.env)

```bash
# Django
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=api.numerobuddy.com,www.numerobuddy.com
ENVIRONMENT=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/numerai
# OR individual settings:
DB_NAME=numerai
DB_USER=numerai_user
DB_PASSWORD=secure_password
DB_HOST=db.example.com
DB_PORT=5432

# Redis
REDIS_URL=redis://redis.example.com:6379/0

# CORS
CORS_ALLOWED_ORIGINS=https://www.numerobuddy.com,https://numerobuddy.com
CSRF_TRUSTED_ORIGINS=https://www.numerobuddy.com,https://numerobuddy.com

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@numerobuddy.com
EMAIL_HOST_PASSWORD=app_password

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_IDS={"basic": "price_xxx", "premium": "price_xxx", "elite": "price_xxx"}

# Firebase (Push Notifications)
FIREBASE_CREDENTIALS_PATH=/path/to/firebase-credentials.json

# Jitsi (Video Consultations)
JITSI_DOMAIN=meet.jit.si
JITSI_APP_ID=your_app_id
JITSI_SECRET=your_secret
JITSI_USE_JWT=False

# Sentry (Error Tracking)
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_TRACES_SAMPLE_RATE=0.1
ENVIRONMENT=production

# OAuth
GOOGLE_OAUTH_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxx
SOCIAL_AUTH_APPLE_CLIENT_ID=xxx

# Frontend URL
FRONTEND_URL=https://www.numerobuddy.com
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.numerobuddy.com/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NEXT_PUBLIC_APPLE_CLIENT_ID=xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
```

## Deployment Steps

### 1. Database Setup

```bash
# Create database
createdb numerai

# Run migrations
cd backend
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 2. Build Docker Images

```bash
# Build backend
cd backend
docker build -t numerai-backend:latest .

# Build frontend
cd frontend
docker build -t numerai-frontend:latest .
```

### 3. Docker Compose Deployment

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: numerai
      POSTGRES_USER: numerai
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

  backend:
    build: ./backend
    command: gunicorn numerai.wsgi:application --bind 0.0.0.0:8000 --workers 4
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      # ... other env vars
    depends_on:
      - db
      - redis
    restart: always

  celery:
    build: ./backend
    command: celery -A numerai worker -l info
    environment:
      # Same as backend
    depends_on:
      - db
      - redis
    restart: always

  celery-beat:
    build: ./backend
    command: celery -A numerai beat -l info
    environment:
      # Same as backend
    depends_on:
      - db
      - redis
    restart: always

  frontend:
    build: ./frontend
    command: npm start
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      # ... other env vars
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
```

Deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/numerai
upstream backend {
    server localhost:8000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name api.numerobuddy.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.numerobuddy.com;

    ssl_certificate /etc/letsencrypt/live/api.numerobuddy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.numerobuddy.com/privkey.pem;

    # API endpoints
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /path/to/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /path/to/backend/media/;
        expires 7d;
    }
}

server {
    listen 80;
    server_name www.numerobuddy.com numerobuddy.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.numerobuddy.com numerobuddy.com;

    ssl_certificate /etc/letsencrypt/live/www.numerobuddy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.numerobuddy.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d api.numerobuddy.com -d www.numerobuddy.com
```

### 6. Database Migrations

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

### 7. Health Checks

```bash
# Backend health
curl https://api.numerobuddy.com/api/v1/health/

# Frontend
curl https://www.numerobuddy.com
```

## Monitoring

### Application Monitoring

- **Sentry**: Error tracking and performance monitoring
- **Logs**: Centralized logging (ELK, CloudWatch, etc.)
- **APM**: Application Performance Monitoring (New Relic, Datadog)

### Infrastructure Monitoring

- **Uptime**: UptimeRobot, Pingdom
- **Metrics**: Prometheus + Grafana
- **Alerts**: PagerDuty, Opsgenie

## Backup Strategy

### Database Backups

```bash
# Automated daily backup
0 2 * * * pg_dump -U numerai numerai > /backups/numerai_$(date +\%Y\%m\%d).sql
```

### File Backups

- Media files: S3, Google Cloud Storage, or similar
- Static files: Included in deployment

## Scaling

### Horizontal Scaling

1. **Backend**: Add more worker processes/containers
2. **Frontend**: Use CDN (Cloudflare, CloudFront)
3. **Database**: Read replicas for read-heavy operations
4. **Redis**: Redis Cluster for high availability

### Vertical Scaling

- Increase container resources (CPU, RAM)
- Upgrade database instance size

## Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] Security headers enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] API keys secured
- [ ] Database credentials secured
- [ ] Secrets management (AWS Secrets Manager, HashiCorp Vault)
- [ ] Regular security updates
- [ ] DDoS protection (Cloudflare)
- [ ] WAF (Web Application Firewall)

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check DATABASE_URL and network
2. **Redis connection errors**: Check REDIS_URL and Redis service
3. **CORS errors**: Verify CORS_ALLOWED_ORIGINS
4. **Static files not loading**: Run collectstatic
5. **Celery tasks not running**: Check Celery worker logs

### Logs

```bash
# Backend logs
docker-compose logs -f backend

# Celery logs
docker-compose logs -f celery

# Frontend logs
docker-compose logs -f frontend
```

## Rollback Procedure

1. Stop current deployment
2. Restore database backup
3. Deploy previous version
4. Verify functionality

## Maintenance

### Regular Tasks

- Weekly: Review error logs
- Monthly: Security updates
- Quarterly: Dependency audits
- Annually: Security audit

## Support

For deployment issues, contact: devops@numerobuddy.com

