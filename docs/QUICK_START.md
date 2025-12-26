# Quick Start Guide

## Post-Implementation Setup

After implementing all enhancements, follow these steps to get everything running:

### 1. Install New Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Database Migrations

Create and apply migrations for new models:

```bash
cd backend

# Create migrations for new apps
python manage.py makemigrations analytics
python manage.py makemigrations

# Apply all migrations
python manage.py migrate
```

### 3. Environment Variables

Update your `.env` files with new required variables:

**Backend `.env`:**
```bash
# Sentry
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=development

# Redis (for WebSockets)
REDIS_URL=redis://localhost:6379/1

# GraphQL (no additional config needed)
```

**Frontend `.env.local`:**
```bash
NEXT_PUBLIC_SENTRY_DSN=your_frontend_sentry_dsn
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

### 4. Start Services

**With Docker Compose:**
```bash
docker-compose up -d
```

**Manual Start:**

1. **Redis** (required for WebSockets):
```bash
redis-server
```

2. **Backend:**
```bash
cd backend
python manage.py runserver
# For WebSocket support, use Daphne:
daphne -b 0.0.0.0 -p 8000 numerai.asgi:application
```

3. **Celery Worker:**
```bash
cd backend
celery -A numerai worker -l info
```

4. **Celery Beat:**
```bash
cd backend
celery -A numerai beat -l info
```

5. **Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Verify Installation

1. **Health Check**: `http://localhost:8000/api/v1/health/`
2. **API Docs**: `http://localhost:8000/api/schema/swagger-ui/`
3. **GraphQL Playground**: `http://localhost:8000/api/v1/graphql/playground/`
4. **Frontend**: `http://localhost:3000`

### 6. Test New Features

**Analytics:**
- Track an activity: `POST /api/v1/analytics/track-activity/`
- View personal analytics: `GET /api/v1/analytics/personal/`

**GraphQL:**
- Open GraphQL Playground
- Try query: `{ me { email fullName } }`

**WebSocket:**
- Connect to chat: `ws://localhost:8000/ws/chat/{consultation_id}/`
- Connect to notifications: `ws://localhost:8000/ws/notifications/`

**i18n:**
- Change language using language selector
- Verify translations load correctly

### 7. Create Initial Data

**A/B Tests:**
```python
python manage.py shell
from analytics.models import ABTest
# Create test experiments
```

**Conversion Funnels:**
```python
from analytics.models import ConversionFunnel
# Define funnels
```

### 8. Configure Monitoring

1. Set up Sentry account
2. Add `SENTRY_DSN` to environment
3. Verify error tracking works

### 9. Set Up Backups

1. Configure backup script: `scripts/backup-database.sh`
2. Add to cron: `0 2 * * * /path/to/backup-database.sh`
3. Test restore: `scripts/restore-database.sh`

### 10. CI/CD

1. Push to GitHub
2. Verify CI/CD pipeline runs
3. Check security scans
4. Review dependency updates

## Troubleshooting

### WebSocket Connection Fails
- Verify Redis is running
- Check `REDIS_URL` in settings
- Ensure using Daphne/ASGI server

### GraphQL Not Working
- Verify `graphene-django` installed
- Check `GRAPHENE` settings
- Review schema imports

### Analytics Not Tracking
- Check database migrations applied
- Verify signals are registered
- Review analytics app in `INSTALLED_APPS`

### i18n Not Working
- Verify `next-intl` installed
- Check middleware configuration
- Review locale files exist

## Support

For issues, check:
- Documentation in `/docs`
- API documentation
- GitHub Issues

