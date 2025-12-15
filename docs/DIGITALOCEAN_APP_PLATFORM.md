# DigitalOcean App Platform Deployment Guide

Complete guide for deploying NumerAI backend services to DigitalOcean App Platform.

> **Note**: This deployment uses a **split architecture**:
> - **Frontend**: Deployed to [Vercel](../VERCEL_DEPLOYMENT.md) (Next.js optimized hosting)
> - **Backend Services**: Deployed to DigitalOcean App Platform (Django, PostgreSQL, Redis, Celery)

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Creating the App](#creating-the-app)
5. [Environment Variables](#environment-variables)
6. [Custom Domain Configuration](#custom-domain-configuration)
7. [Post-Deployment Steps](#post-deployment-steps)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Split Deployment Architecture

The NumerAI application uses a split deployment strategy:

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Vercel Frontend │─────▶│ DigitalOcean     │
│   (Next.js)      │ API  │ Backend (Django) │
└─────────────────┘      └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌───────────┐  ┌──────────┐  ┌──────────────┐
            │PostgreSQL │  │  Redis    │  │Celery Workers│
            │  Database │  │  Cache    │  │   & Beat     │
            └───────────┘  └──────────┘  └──────────────┘
```

### Services Deployed on DigitalOcean

- **Backend Service**: Django REST API
- **PostgreSQL Database**: Managed database
- **Redis**: Cache and message broker
- **Celery Worker**: Background task processing
- **Celery Beat**: Scheduled task scheduler

### Services Deployed on Vercel

- **Frontend**: Next.js application (see [Vercel Deployment Guide](../VERCEL_DEPLOYMENT.md))

### Benefits of Split Deployment

- **Optimized Hosting**: Vercel provides excellent Next.js optimization and edge network
- **Cost Efficiency**: Separate scaling for frontend and backend
- **Performance**: CDN distribution for frontend, dedicated resources for backend
- **Flexibility**: Independent deployments and scaling

---

## Prerequisites

### Required Accounts & Services

- **DigitalOcean Account**: Sign up at https://www.digitalocean.com
- **GitHub Account**: Your code must be in a GitHub repository
- **Vercel Account**: For frontend deployment (see [Vercel Deployment Guide](../VERCEL_DEPLOYMENT.md))
- **Domain Name** (optional): For custom domain setup
- **Email Service**: SMTP credentials (Gmail, SendGrid, Mailgun, etc.)
- **OpenAI API Key**: For AI features
- **Stripe Account**: For payment processing (optional)
- **Firebase Project**: For push notifications (optional)

### Required Information

Before starting, gather:
- GitHub repository URL
- Domain name (if using custom domain)
- Email for notifications
- SMTP email credentials
- API keys (OpenAI, Stripe, Firebase, etc.)

---

## Initial Setup

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for App Platform deployment"
git push origin main
```

**Important**: The `app.yaml` file must be located at the **root of your repository** (not in the backend folder). DigitalOcean App Platform reads the app spec from the repository root when using GitHub integration. The `source_dir: backend` in the app.yaml specifies where the source code is located within the repository, not where the app.yaml should be.

### Step 2: Install DigitalOcean CLI (Optional)

For easier management, install `doctl`:

```bash
# macOS
brew install doctl

# Linux
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-1.104.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin
```

Authenticate:

```bash
doctl auth init
```

---

## Creating the App

**Quick Start**: If you see "No components detected" error, this is normal! Your `package.json` and `requirements.txt` are in subdirectories. Use one of the methods below to proceed.

### Option A: Using the App Spec File (Recommended)

**Important**: When DigitalOcean tries to auto-detect components, it looks for `package.json` or `requirements.txt` in the root directory. Since these are in subdirectories, you'll need to bypass auto-detection.

1. **Navigate to App Platform**:
   - Go to https://cloud.digitalocean.com/apps
   - Click **"Create App"**

2. **Connect GitHub Repository**:
   - Select **"GitHub"** as source
   - Authorize DigitalOcean to access your repositories
   - Select `theburhanahmed/NumerAI`
   - Select `main` branch
   - Click **"Next"**

3. **Bypass Auto-Detection**:
   - When you see "No components detected", **DO NOT** click "Edit Plan"
   - Instead, look for **"Edit App Spec"** button or **"Upload YAML"** option
   - If you don't see these options, click **"Skip"** or **"Continue"** to proceed to the spec editor

4. **Upload or Edit App Spec**:
   - Click **"Edit App Spec"** or **"Upload YAML"**
   - Copy the contents of `app.yaml` from your repository
   - Paste it into the spec editor
   - **OR** if there's an upload option, upload the `app.yaml` file directly
   - Review the configuration

5. **Review and Create**:
   - Review all services and configurations
   - Click **"Create Resources"** or **"Deploy"**

**Alternative**: If the above doesn't work, you can also:
- Create the app manually using Option B below
- Then export the spec to see the correct format
- Update your `app.yaml` accordingly

### Option B: Using the Dashboard (If Spec File Doesn't Work)

If you encounter issues with the app spec file, use the dashboard method:

1. **Create App**:
   - Go to https://cloud.digitalocean.com/apps
   - Click **"Create App"**
   - Connect your GitHub repository
   - When you see "No components detected", click **"Edit Plan"** or look for **"Add Component"**

2. **Add Backend Service**:
   - Click **"Add Component"** → **"Web Service"**
   - **Name**: `backend`
   - **Source Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn --bind 0.0.0.0:$PORT --workers 4 --threads 2 --timeout 120 numerai.wsgi:application`
   - **HTTP Port**: `8000`
   - **Health Check Path**: `/api/v1/health/`
   - **Environment**: Python
   - Add routes: `/api`, `/admin`, `/static`, `/media`

   > **Note**: Frontend is deployed separately on Vercel. Do not add a frontend service to DigitalOcean.

3. **Add PostgreSQL Container**:
   - Click **"Add Component"** → **"Worker"**
   - **Name**: `postgres`
   - **Docker Image**: `postgres:14-alpine`
   - **Run Command**: (leave default or empty)
   - Add environment variables: `POSTGRES_DB=numerai`, `POSTGRES_USER=numerai`, `POSTGRES_PASSWORD` (set as secret)

5. **Add Redis Container**:
   - Click **"Add Component"** → **"Worker"**
   - **Name**: `redis`
   - **Docker Image**: `redis:7-alpine`
   - **Run Command**: `redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru`

6. **Add Celery Worker**:
   - Click **"Add Component"** → **"Worker"**
   - **Name**: `celery-worker`
   - **Source Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `celery -A numerai worker -l info`
   - **Environment**: Python

7. **Add Celery Beat**:
   - Click **"Add Component"** → **"Worker"**
   - **Name**: `celery-beat`
   - **Source Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `celery -A numerai beat -l info`
   - **Environment**: Python

8. **Configure Environment Variables**:
   - For each service, go to **"Settings"** → **"Environment Variables"**
   - Add all required variables (see Environment Variables section)

9. **Review and Deploy**:
   - Review all configurations
   - Click **"Create Resources"** or **"Deploy"**

### Option C: Using doctl CLI

If you have `doctl` installed:

```bash
# Authenticate
doctl auth init

# Create app from spec file
doctl apps create --spec app.yaml

# Or create app and then update spec
doctl apps create --spec app.yaml --wait
```

This method bypasses the web UI auto-detection entirely.

---

## Environment Variables

### Setting Environment Variables

Environment variables marked as `SECRET` in `app.yaml` must be set in the App Platform dashboard:

1. Go to your app in App Platform dashboard
2. Click on each service (backend, frontend, celery-worker, celery-beat)
3. Navigate to **"Settings"** → **"Environment Variables"**
4. Add or edit variables

### Required Environment Variables

#### Backend Service

**Django Configuration:**
```
SECRET_KEY=<generate-strong-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,backend.yourdomain.com
```

**Database:**
```
DB_PASSWORD=<strong-password>
```

**Redis & Celery:**
```
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2
```

**CORS & Security:**
```
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://your-vercel-app.vercel.app,https://yourdomain.com,https://www.yourdomain.com
```

> **Important**: Add your Vercel frontend domain(s) to CORS and CSRF trusted origins. This allows the frontend to make API requests to the backend. Include both production and preview deployment URLs if needed.

**Email Configuration:**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

**Payment (Stripe):**
```
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**AI (OpenAI):**
```
OPENAI_API_KEY=sk-...
```

**Firebase (Push Notifications):**
```
FIREBASE_CREDENTIALS=base64-encoded-json
```

**OAuth (Google):**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**OAuth (Apple):**
```
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
APPLE_KEY_ID=your-apple-key-id
APPLE_TEAM_ID=your-apple-team-id
```

> **Note**: Frontend environment variables are configured in Vercel, not DigitalOcean. See [Vercel Deployment Guide](../VERCEL_DEPLOYMENT.md) for frontend configuration.

#### PostgreSQL Container

```
POSTGRES_PASSWORD=<strong-password>
```

### Generating SECRET_KEY

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Custom Domain Configuration

### Step 1: Add Domain in App Platform

1. Go to your app in App Platform dashboard
2. Click **"Settings"** → **"Domains"**
3. Click **"Add Domain"**
4. Enter your domain name (e.g., `yourdomain.com`)
5. Add `www.yourdomain.com` as well

### Step 2: Configure DNS

DigitalOcean will provide DNS records to add:

1. **For Root Domain** (`yourdomain.com`):
   - Type: `A` or `CNAME`
   - Value: Provided by DigitalOcean

2. **For WWW** (`www.yourdomain.com`):
   - Type: `CNAME`
   - Value: Provided by DigitalOcean

3. **For Backend Subdomain** (`backend.yourdomain.com`):
   - Type: `CNAME`
   - Value: Backend service URL

### Step 3: Update Environment Variables

After domain is configured, update:

- `ALLOWED_HOSTS`: Add your backend domain
- `CORS_ALLOWED_ORIGINS`: Add your Vercel frontend URL(s)
- `CSRF_TRUSTED_ORIGINS`: Add your Vercel frontend URL(s)

> **Note**: `NEXT_PUBLIC_API_URL` is configured in Vercel, not DigitalOcean. Update it in your Vercel project settings to point to your DigitalOcean backend URL.

---

## Post-Deployment Steps

### Step 1: Verify Services

Check that all services are running:

1. Go to App Platform dashboard
2. Click on your app
3. Verify all services show **"Running"** status:
   - `postgres` (PostgreSQL database)
   - `redis` (Redis container)
   - `backend` (Django backend)
   - `celery-worker` (Celery worker)
   - `celery-beat` (Celery beat scheduler)

> **Note**: Frontend is deployed separately on Vercel. Verify frontend deployment in your Vercel dashboard.

### Step 2: Check Health Endpoints

**Backend Health Check:**
```bash
curl https://yourdomain.com/api/v1/health/
```

Expected response:
```json
{"status": "healthy"}
```

**Frontend:**
Open in browser: Your Vercel frontend URL (e.g., `https://your-app.vercel.app` or custom domain)

### Step 3: Run Database Migrations

Migrations run automatically on backend startup, but you can verify:

1. Go to App Platform dashboard
2. Click on `backend` service
3. Click **"Console"** tab
4. Run:
```bash
python manage.py migrate
```

### Step 4: Create Superuser

1. Go to `backend` service → **"Console"** tab
2. Run:
```bash
python manage.py createsuperuser
```
3. Follow prompts to create admin user

### Step 5: Access Django Admin

Visit: `https://yourdomain.com/admin/`

---

## Monitoring & Maintenance

### Viewing Logs

**In App Platform Dashboard:**
1. Go to your app
2. Click on a service
3. Click **"Runtime Logs"** tab
4. View real-time logs

**Using doctl CLI:**
```bash
# View backend logs
doctl apps logs <app-id> --component backend --type run

# View frontend logs
doctl apps logs <app-id> --component frontend --type run

# View celery worker logs
doctl apps logs <app-id> --component celery-worker --type run
```

### Updating the Application

**Automatic Deployments:**
- If `deploy_on_push: true` is set in `app.yaml`, pushes to `main` branch trigger automatic deployments

**Manual Deployments:**
1. Go to App Platform dashboard
2. Click on your app
3. Click **"Actions"** → **"Force Rebuild"**

**Using doctl:**
```bash
doctl apps create-deployment <app-id>
```

### Scaling Services

1. Go to App Platform dashboard
2. Click on a service
3. Click **"Settings"** → **"Scaling"**
4. Adjust instance count or size
5. Click **"Save"**

### Database Backups

For PostgreSQL container:
- App Platform provides automatic backups
- Access backups in **"Settings"** → **"Backups"**

---

## Troubleshooting

### "No components detected" Error

This error occurs when DigitalOcean tries to auto-detect components from your repository root. Since `package.json` and `requirements.txt` are in subdirectories, auto-detection fails.

**Solution 1: Use App Spec Directly**
1. When you see "No components detected", look for **"Edit App Spec"** or **"Upload YAML"** button
2. Click it and paste your `app.yaml` content
3. This bypasses auto-detection

**Solution 2: Use Dashboard Method**
1. Instead of using the spec file, use Option B (Dashboard Method) below
2. Manually configure each service through the UI
3. DigitalOcean will create the spec automatically

**Solution 3: Create App via doctl CLI**
```bash
# Create app from spec file
doctl apps create --spec app.yaml
```

### Application Won't Start

1. **Check Logs**:
   - Go to service → **"Runtime Logs"**
   - Look for error messages

2. **Verify Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names

3. **Check Build Logs**:
   - Go to service → **"Build Logs"**
   - Verify build completed successfully

### Database Connection Issues

1. **Verify Database Service**:
   - Ensure `postgres` service is running
   - Check service name matches `DB_HOST` environment variable

2. **Check Database Credentials**:
   - Verify `DB_PASSWORD` is set correctly
   - Ensure `DB_NAME`, `DB_USER` match PostgreSQL container settings

3. **Test Connection**:
   - Use backend service console:
   ```bash
   python manage.py dbshell
   ```

### Redis Connection Issues

1. **Verify Redis Service**:
   - Ensure `redis` service is running
   - Check service name matches Redis URL

2. **Test Connection**:
   - Use backend service console:
   ```python
   python manage.py shell
   >>> from django.core.cache import cache
   >>> cache.set('test', 'value')
   >>> cache.get('test')
   ```

### Frontend Not Loading

> **Note**: Frontend is deployed on Vercel, not DigitalOcean. See [Vercel Deployment Guide](../VERCEL_DEPLOYMENT.md) for frontend troubleshooting.

1. **Check Vercel Deployment**:
   - Verify frontend build completed successfully in Vercel
   - Check Vercel build logs for errors

2. **Verify API URL**:
   - Ensure `NEXT_PUBLIC_API_URL` is set correctly in Vercel
   - Should point to your DigitalOcean backend URL

3. **Check CORS Configuration**:
   - Verify backend `CORS_ALLOWED_ORIGINS` includes Vercel domain
   - Check browser console for CORS errors

### Celery Not Working

1. **Check Worker Service**:
   - Ensure `celery-worker` service is running
   - Check logs for errors

2. **Verify Redis Connection**:
   - Ensure `CELERY_BROKER_URL` is correct
   - Test Redis connection

3. **Check Beat Service**:
   - Ensure `celery-beat` service is running
   - Verify it can connect to database

### Static Files Not Loading

1. **Verify Collectstatic**:
   - Check backend build logs for `collectstatic` output
   - Ensure it completed successfully

2. **Check WhiteNoise Configuration**:
   - Static files are served by WhiteNoise middleware
   - Verify `STATIC_ROOT` is set correctly

### High Resource Usage

1. **Check Resource Usage**:
   - Go to service → **"Metrics"** tab
   - Monitor CPU and memory usage

2. **Scale Up**:
   - Increase instance size in service settings
   - Or increase instance count for horizontal scaling

---

## Service Discovery

App Platform automatically provides internal hostnames for services:

- **PostgreSQL**: `postgres` (service name)
- **Redis**: `redis` (service name)
- **Backend**: `backend` (service name)

Services can reference each other using these hostnames within the App Platform network.

> **Note**: Frontend is deployed on Vercel and communicates with the backend via HTTPS using the public backend URL. Internal service discovery is not used for frontend-backend communication.

---

## Cost Estimation

**Basic Setup (Minimum):**
- Backend: Basic-XXS ($5/month)
- PostgreSQL Database: Basic-XXS ($5/month)
- Redis Container: Basic-XXS ($5/month)
- Celery Worker: Basic-XXS ($5/month)
- Celery Beat: Basic-XXS ($5/month)
- **DigitalOcean Total: ~$25/month**
- **Vercel**: Free tier (or Pro $20/month for production)
- **Combined Total: ~$25-45/month**

**Recommended Production Setup:**
- Backend: Basic ($12/month)
- PostgreSQL Database: Basic ($12/month)
- Redis Container: Basic-XXS ($5/month)
- Celery Worker: Basic ($12/month)
- Celery Beat: Basic-XXS ($5/month)
- **DigitalOcean Total: ~$46/month**
- **Vercel**: Pro ($20/month) or Enterprise
- **Combined Total: ~$66/month+**

> **Note**: Frontend hosting costs are separate on Vercel. Vercel offers a generous free tier for personal projects.

---

## Security Best Practices

1. **Use Secrets for Sensitive Data**:
   - Mark sensitive environment variables as `SECRET` type
   - Never commit secrets to repository

2. **Enable HTTPS**:
   - App Platform provides automatic HTTPS
   - Ensure `SECURE_SSL_REDIRECT=True` in Django settings

3. **Regular Updates**:
   - Keep dependencies updated
   - Monitor security advisories

4. **Database Security**:
   - Use strong passwords
   - Limit database access to necessary services only

5. **Monitor Logs**:
   - Regularly review logs for suspicious activity
   - Set up alerts for errors

---

## Quick Reference Commands

```bash
# View app status
doctl apps get <app-id>

# View logs
doctl apps logs <app-id> --component backend --type run

# Create deployment
doctl apps create-deployment <app-id>

# List all apps
doctl apps list

# Get app spec
doctl apps spec get <app-id>
```

---

## Support & Resources

- **DigitalOcean App Platform Docs**: https://docs.digitalocean.com/products/app-platform/
- **App Spec Reference**: https://docs.digitalocean.com/products/app-platform/reference/app-spec/
- **DigitalOcean Community**: https://www.digitalocean.com/community

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0

