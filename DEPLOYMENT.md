# NumerAI Deployment Guide - Render.com Staging

This guide provides step-by-step instructions for deploying NumerAI Sprint 1 to Render.com staging environment.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Cost Estimate](#cost-estimate)
3. [Account Setup](#account-setup)
4. [Database Setup](#database-setup)
5. [Redis Setup](#redis-setup)
6. [Backend Deployment](#backend-deployment)
7. [Celery Worker Setup](#celery-worker-setup)
8. [Frontend Deployment](#frontend-deployment)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GitHub account with NumerAI repository
- Render.com account (free tier available)
- Git installed locally
- Basic understanding of environment variables

---

## Cost Estimate

**Monthly Cost for Staging (Starter Plans):**
- PostgreSQL Database: $7/month
- Redis Instance: $10/month
- Django Backend (Web Service): $7/month
- Celery Worker: $7/month
- Next.js Frontend (Web Service): $7/month

**Total: ~$38/month**

**Free Tier Option:**
- You can use Render's free tier for testing, but services will spin down after 15 minutes of inactivity
- Free tier has limitations: 512MB RAM, shared CPU, slower cold starts

---

## Account Setup

### Step 1: Create Render.com Account

1. Go to https://render.com
2. Click "Get Started" or "Sign Up"
3. Sign up with GitHub (recommended for easier deployment)
4. Verify your email address

### Step 2: Connect GitHub Repository

1. In Render Dashboard, click "New +"
2. Select "Blueprint"
3. Connect your GitHub account if not already connected
4. Grant Render access to your NumerAI repository

---

## Database Setup

### Step 3: Create PostgreSQL Database

1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Configure database:
   - **Name**: `numerai-postgres`
   - **Database**: `numerai`
   - **User**: `numerai`
   - **Region**: Oregon (us-west)
   - **PostgreSQL Version**: 14
   - **Plan**: Starter ($7/month)

3. Click "Create Database"
4. Wait 2-3 minutes for database to be ready
5. Copy the **Internal Database URL** (starts with `postgresql://`)
6. Save this URL - you'll need it for backend configuration

**Important**: Use the **Internal Database URL** for better performance and security.

---

## Redis Setup

### Step 4: Create Redis Instance

1. In Render Dashboard, click "New +" → "Redis"
2. Configure Redis:
   - **Name**: `numerai-redis`
   - **Region**: Oregon (us-west) - same as database
   - **Plan**: Starter ($10/month)
   - **Maxmemory Policy**: allkeys-lru

3. Click "Create Redis"
4. Wait 1-2 minutes for Redis to be ready
5. Copy the **Internal Redis URL** (starts with `redis://`)
6. Save this URL - you'll need it for backend and Celery

---

## Backend Deployment

### Step 5: Deploy Django Backend

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect to your GitHub repository
3. Configure web service:
   - **Name**: `numerai-backend`
   - **Region**: Oregon (us-west)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120 numerai.wsgi:application`
   - **Plan**: Starter ($7/month)

4. Add Environment Variables (click "Advanced" → "Add Environment Variable"):

   ```
   PYTHON_VERSION = 3.11.0
   DJANGO_SETTINGS_MODULE = numerai.settings.production
   SECRET_KEY = <click "Generate" for random value>
   DEBUG = False
   ALLOWED_HOSTS = numerai-backend.onrender.com
   DATABASE_URL = <paste Internal Database URL from Step 3>
   REDIS_URL = <paste Internal Redis URL from Step 4>
   CELERY_BROKER_URL = <paste Internal Redis URL from Step 4>
   CELERY_RESULT_BACKEND = <paste Internal Redis URL from Step 4>
   CORS_ALLOWED_ORIGINS = https://numerai-frontend.onrender.com
   EMAIL_BACKEND = django.core.mail.backends.console.EmailBackend
   DEFAULT_FROM_EMAIL = noreply@numerai.app
   ```

5. Add Health Check Path:
   - **Health Check Path**: `/api/v1/health/`

6. Click "Create Web Service"
7. Wait 5-10 minutes for initial deployment
8. Monitor build logs for any errors

**Expected Output:**
- Build logs should show: "Installing dependencies..." → "Collecting static files..." → "Running migrations..." → "Build completed successfully!"
- Service should show "Live" status with green indicator

---

## Celery Worker Setup

### Step 6: Deploy Celery Worker

1. In Render Dashboard, click "New +" → "Background Worker"
2. Connect to your GitHub repository
3. Configure worker:
   - **Name**: `numerai-celery-worker`
   - **Region**: Oregon (us-west)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `celery -A numerai worker -l info`
   - **Plan**: Starter ($7/month)

4. Add Environment Variables (same as backend except CORS):

   ```
   PYTHON_VERSION = 3.11.0
   DJANGO_SETTINGS_MODULE = numerai.settings.production
   SECRET_KEY = <same as backend>
   DATABASE_URL = <same as backend>
   REDIS_URL = <same as backend>
   CELERY_BROKER_URL = <same as backend>
   CELERY_RESULT_BACKEND = <same as backend>
   ```

5. Click "Create Background Worker"
6. Wait 3-5 minutes for deployment
7. Check logs to verify Celery is running: "celery@... ready"

---

## Frontend Deployment

### Step 7: Deploy Next.js Frontend

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect to your GitHub repository
3. Configure web service:
   - **Name**: `numerai-frontend`
   - **Region**: Oregon (us-west)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/month)

4. Add Environment Variables:

   ```
   NODE_VERSION = 18.17.0
   NEXT_PUBLIC_API_URL = https://numerai-backend.onrender.com/api/v1
   ```

5. Click "Create Web Service"
6. Wait 5-10 minutes for initial deployment
7. Monitor build logs for any errors

**Expected Output:**
- Build logs should show: "Installing dependencies..." → "Building Next.js..." → "Build completed"
- Service should show "Live" status

---

## Post-Deployment Verification

### Step 8: Verify Deployment

#### 8.1 Backend Health Check

1. Open browser and navigate to:
   ```
   https://numerai-backend.onrender.com/api/v1/health/
   ```

2. Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-11-10T..."
   }
   ```

#### 8.2 API Documentation

1. Navigate to:
   ```
   https://numerai-backend.onrender.com/api/schema/swagger-ui/
   ```

2. You should see the interactive API documentation with all 8 authentication endpoints

#### 8.3 Frontend Access

1. Navigate to:
   ```
   https://numerai-frontend.onrender.com
   ```

2. You should see the NumerAI landing page with Login and Register buttons

#### 8.4 Test Authentication Flow

1. Click "Register" on frontend
2. Fill in registration form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPass123
   - Confirm Password: TestPass123

3. Click "Create account"
4. Check backend logs for OTP email (console backend)
5. Copy 6-digit OTP from logs
6. Enter OTP on verification page
7. Should redirect to dashboard

#### 8.5 Database Verification

1. In Render Dashboard, go to PostgreSQL database
2. Click "Connect" → "External Connection"
3. Use provided credentials to connect with psql or pgAdmin
4. Run query:
   ```sql
   SELECT COUNT(*) FROM users;
   ```
5. Should show 1 user (the test user you created)

#### 8.6 Redis Verification

1. In Render Dashboard, go to Redis instance
2. Check "Metrics" tab
3. Should show connection activity from backend and Celery

#### 8.7 Celery Worker Verification

1. In Render Dashboard, go to Celery worker
2. Check logs
3. Should see: "celery@... ready" and periodic heartbeat messages

---

## Update Backend CORS Settings

### Step 9: Update CORS After Frontend Deployment

After frontend is deployed and you have the actual URL:

1. Go to Backend web service in Render Dashboard
2. Click "Environment"
3. Update `CORS_ALLOWED_ORIGINS` with actual frontend URL:
   ```
   CORS_ALLOWED_ORIGINS = https://numerai-frontend.onrender.com
   ```
4. Click "Save Changes"
5. Backend will automatically redeploy

---

## Custom Domain Setup (Optional)

### Step 10: Add Custom Domain

If you have a custom domain:

1. **For Backend**:
   - Go to Backend web service → "Settings" → "Custom Domain"
   - Add domain: `api.yourdomain.com`
   - Update DNS with provided CNAME record
   - Update `ALLOWED_HOSTS` environment variable

2. **For Frontend**:
   - Go to Frontend web service → "Settings" → "Custom Domain"
   - Add domain: `app.yourdomain.com`
   - Update DNS with provided CNAME record
   - Update backend `CORS_ALLOWED_ORIGINS`

---

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PYTHON_VERSION` | Python runtime version | `3.11.0` |
| `DJANGO_SETTINGS_MODULE` | Django settings module | `numerai.settings.production` |
| `SECRET_KEY` | Django secret key | Auto-generated |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Allowed hostnames | `numerai-backend.onrender.com` |
| `DATABASE_URL` | PostgreSQL connection | Auto from database |
| `REDIS_URL` | Redis connection | Auto from Redis |
| `CELERY_BROKER_URL` | Celery broker | Same as REDIS_URL |
| `CELERY_RESULT_BACKEND` | Celery results | Same as REDIS_URL |
| `CORS_ALLOWED_ORIGINS` | Frontend URLs | `https://numerai-frontend.onrender.com` |
| `EMAIL_BACKEND` | Email backend | `django.core.mail.backends.console.EmailBackend` |
| `DEFAULT_FROM_EMAIL` | From email address | `noreply@numerai.app` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_VERSION` | Node.js runtime version | `18.17.0` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://numerai-backend.onrender.com/api/v1` |

---

## Monitoring and Logs

### Accessing Logs

1. **Backend Logs**:
   - Go to Backend web service → "Logs"
   - Real-time logs showing requests, errors, OTP codes

2. **Celery Logs**:
   - Go to Celery worker → "Logs"
   - Shows task execution, scheduled jobs

3. **Frontend Logs**:
   - Go to Frontend web service → "Logs"
   - Shows Next.js server logs, build output

### Metrics

1. Go to any service → "Metrics"
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## Scaling

### Vertical Scaling (Upgrade Plan)

To handle more traffic:

1. Go to service → "Settings" → "Plan"
2. Upgrade to Standard ($25/month) or Pro ($85/month)
3. Benefits:
   - More RAM (2GB → 4GB → 8GB)
   - More CPU
   - Better performance

### Horizontal Scaling (Multiple Instances)

For backend web service:

1. Go to Backend → "Settings" → "Scaling"
2. Increase instance count (2-10 instances)
3. Load balancer automatically distributes traffic

---

## Backup and Recovery

### Database Backups

Render automatically creates daily backups for paid PostgreSQL plans:

1. Go to PostgreSQL database → "Backups"
2. View available backups
3. Restore from backup if needed

### Manual Backup

```bash
# Export database
pg_dump -h <host> -U <user> -d numerai > backup.sql

# Restore database
psql -h <host> -U <user> -d numerai < backup.sql
```

---

## Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files to Git
   - Use Render's "Generate" for SECRET_KEY
   - Rotate secrets periodically

2. **Database**:
   - Use Internal Database URL (not External)
   - Enable SSL connections
   - Regular backups

3. **CORS**:
   - Only allow your frontend domain
   - Don't use wildcard (`*`) in production

4. **HTTPS**:
   - Render provides free SSL certificates
   - Always use HTTPS URLs

5. **Rate Limiting**:
   - Already configured in Django settings
   - Monitor for abuse in logs

---

## Continuous Deployment

Render automatically deploys on Git push:

1. Make changes to code
2. Commit and push to `main` branch
3. Render detects changes
4. Automatically builds and deploys
5. Zero-downtime deployment

**Disable Auto-Deploy** (if needed):
1. Go to service → "Settings"
2. Toggle "Auto-Deploy" off
3. Deploy manually with "Manual Deploy" button

---

## Cost Optimization

### Tips to Reduce Costs

1. **Use Free Tier for Development**:
   - Services spin down after 15 minutes
   - Good for testing, not production

2. **Suspend Unused Services**:
   - Go to service → "Settings" → "Suspend"
   - Stops billing until resumed

3. **Optimize Worker**:
   - Use cron jobs instead of always-on worker
   - Render Cron Jobs are free

4. **Monitor Usage**:
   - Check "Metrics" regularly
   - Downgrade if underutilized

---

## Next Steps

After successful staging deployment:

1. **Test All Features**:
   - Follow DEPLOYMENT_CHECKLIST.md
   - Test authentication flow end-to-end
   - Verify API endpoints

2. **Set Up Production**:
   - Create separate production services
   - Use production domain
   - Configure production email (SendGrid)

3. **Monitor Performance**:
   - Set up alerts for errors
   - Monitor response times
   - Check logs regularly

4. **Prepare for Sprint 2**:
   - Add OpenAI API key
   - Configure Firebase for notifications
   - Set up Stripe for payments

---

## Support

**Render.com Support**:
- Documentation: https://render.com/docs
- Community Forum: https://community.render.com
- Email: support@render.com

**NumerAI Team**:
- GitHub Issues: <repository-url>/issues
- Internal Documentation: /workspace/docs/

---

**Deployment Status**: Ready for Staging
**Last Updated**: November 10, 2025
**Estimated Setup Time**: 30-45 minutes