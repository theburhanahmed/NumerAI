# NumerAI Deployment Troubleshooting Guide

This guide helps you diagnose and fix common issues during Render.com deployment.

## Table of Contents
1. [Build Failures](#build-failures)
2. [Runtime Errors](#runtime-errors)
3. [Database Issues](#database-issues)
4. [Redis Connection Issues](#redis-connection-issues)
5. [CORS Errors](#cors-errors)
6. [Authentication Issues](#authentication-issues)
7. [Performance Issues](#performance-issues)
8. [Cost Issues](#cost-issues)

---

## Build Failures

### Issue: Backend Build Fails - "build.sh: Permission denied"

**Symptoms**:
```
/bin/sh: ./build.sh: Permission denied
```

**Cause**: Build script is not executable

**Solution**:
```bash
# Make build script executable locally
chmod +x backend/build.sh

# Commit and push
git add backend/build.sh
git commit -m "Make build.sh executable"
git push
```

---

### Issue: Backend Build Fails - "No module named 'django'"

**Symptoms**:
```
ModuleNotFoundError: No module named 'django'
```

**Cause**: Dependencies not installed or wrong Python version

**Solution**:
1. Check `requirements.txt` exists in `backend/` directory
2. Verify Python version in environment variables:
   ```
   PYTHON_VERSION = 3.11.0
   ```
3. Check build command:
   ```
   ./build.sh
   ```
4. Verify build.sh contains:
   ```bash
   pip install -r requirements.txt
   ```

---

### Issue: Frontend Build Fails - "Cannot find module 'next'"

**Symptoms**:
```
Error: Cannot find module 'next'
```

**Cause**: Dependencies not installed or wrong Node version

**Solution**:
1. Check `package.json` exists in `frontend/` directory
2. Verify Node version in environment variables:
   ```
   NODE_VERSION = 18.17.0
   ```
3. Check build command:
   ```
   npm install && npm run build
   ```

---

### Issue: Static Files Not Collected

**Symptoms**:
```
You're using the staticfiles app without having set the STATIC_ROOT setting
```

**Cause**: STATIC_ROOT not configured

**Solution**:
1. Check `backend/numerai/settings/production.py`:
   ```python
   STATIC_ROOT = BASE_DIR / 'staticfiles'
   ```
2. Verify build.sh includes:
   ```bash
   python manage.py collectstatic --no-input
   ```

---

## Runtime Errors

### Issue: Backend Shows "Application Error"

**Symptoms**:
- Service shows "Live" but returns 503 error
- Logs show "Application failed to start"

**Diagnosis**:
1. Check logs for error message
2. Common causes:
   - Database connection failed
   - Missing environment variables
   - Port binding error

**Solution**:
1. Verify DATABASE_URL is set correctly
2. Check all required environment variables
3. Verify start command:
   ```
   gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120 numerai.wsgi:application
   ```

---

### Issue: Frontend Shows "Internal Server Error"

**Symptoms**:
- Frontend loads but shows error page
- Logs show "Error: connect ECONNREFUSED"

**Cause**: Cannot connect to backend API

**Solution**:
1. Verify backend is running and healthy
2. Check `NEXT_PUBLIC_API_URL` environment variable
3. Ensure CORS is configured correctly on backend
4. Test backend health check:
   ```
   curl https://numerai-backend.onrender.com/api/v1/health/
   ```

---

### Issue: Celery Worker Not Starting

**Symptoms**:
- Worker service shows "Live" but no activity
- Logs show "Cannot connect to Redis"

**Cause**: Redis connection failed

**Solution**:
1. Verify Redis service is running
2. Check `CELERY_BROKER_URL` matches Redis Internal URL
3. Verify worker can access Redis (same region)
4. Check worker logs for specific error

---

## Database Issues

### Issue: "FATAL: password authentication failed"

**Symptoms**:
```
django.db.utils.OperationalError: FATAL: password authentication failed for user "numerai"
```

**Cause**: Wrong database credentials

**Solution**:
1. Go to PostgreSQL database in Render Dashboard
2. Copy **Internal Database URL**
3. Update backend `DATABASE_URL` environment variable
4. Ensure you're using Internal URL, not External
5. Redeploy backend

---

### Issue: "could not connect to server"

**Symptoms**:
```
django.db.utils.OperationalError: could not connect to server: Connection refused
```

**Cause**: Database not accessible or wrong host

**Solution**:
1. Verify PostgreSQL service is "Available"
2. Check database and backend are in same region
3. Use Internal Database URL (starts with `postgresql://internal-...`)
4. Verify no typos in DATABASE_URL

---

### Issue: Migrations Not Applied

**Symptoms**:
- Backend starts but API returns errors
- Logs show "no such table: users"

**Cause**: Migrations not run during build

**Solution**:
1. Check build.sh includes:
   ```bash
   python manage.py migrate --no-input
   ```
2. Check build logs for migration output
3. If migrations failed, check database connection
4. Manually run migrations:
   - Go to backend service → "Shell"
   - Run: `python manage.py migrate`

---

### Issue: Database Connection Pool Exhausted

**Symptoms**:
```
django.db.utils.OperationalError: FATAL: remaining connection slots are reserved
```

**Cause**: Too many database connections

**Solution**:
1. Reduce number of Gunicorn workers:
   ```
   --workers 2  # Instead of 4
   ```
2. Configure connection pooling in settings:
   ```python
   'CONN_MAX_AGE': 600
   ```
3. Upgrade database plan for more connections

---

## Redis Connection Issues

### Issue: "Error 111 connecting to redis"

**Symptoms**:
```
redis.exceptions.ConnectionError: Error 111 connecting to redis:6379. Connection refused.
```

**Cause**: Wrong Redis URL or Redis not accessible

**Solution**:
1. Verify Redis service is "Available"
2. Copy **Internal Redis URL** from Redis service
3. Update environment variables:
   - `REDIS_URL`
   - `CELERY_BROKER_URL`
   - `CELERY_RESULT_BACKEND`
4. Ensure all three use the same Redis URL
5. Redeploy affected services

---

### Issue: Redis Connection Timeout

**Symptoms**:
```
redis.exceptions.TimeoutError: Timeout reading from socket
```

**Cause**: Network latency or Redis overloaded

**Solution**:
1. Check Redis metrics for high CPU/memory
2. Increase timeout in settings:
   ```python
   'SOCKET_TIMEOUT': 10  # Instead of 5
   ```
3. Consider upgrading Redis plan
4. Ensure services are in same region

---

## CORS Errors

### Issue: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Symptoms**:
- Frontend loads but API calls fail
- Browser console shows CORS error
- Network tab shows failed requests

**Diagnosis**:
```
Access to XMLHttpRequest at 'https://numerai-backend.onrender.com/api/v1/auth/login/' 
from origin 'https://numerai-frontend.onrender.com' has been blocked by CORS policy
```

**Solution**:
1. Verify backend `CORS_ALLOWED_ORIGINS` includes frontend URL:
   ```
   CORS_ALLOWED_ORIGINS = https://numerai-frontend.onrender.com
   ```
2. No trailing slash in URL
3. Use exact frontend URL (check for www subdomain)
4. Redeploy backend after updating
5. Clear browser cache and test

---

### Issue: CORS Preflight Request Failed

**Symptoms**:
- OPTIONS request fails
- POST/PUT/DELETE requests blocked

**Cause**: CORS not configured for all HTTP methods

**Solution**:
1. Check `backend/numerai/settings/base.py`:
   ```python
   CORS_ALLOW_METHODS = [
       'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'
   ]
   ```
2. Verify `corsheaders` middleware is first:
   ```python
   MIDDLEWARE = [
       'corsheaders.middleware.CorsMiddleware',
       # ... other middleware
   ]
   ```

---

## Authentication Issues

### Issue: "Invalid token" Error

**Symptoms**:
- Login succeeds but subsequent requests fail
- API returns 401 Unauthorized

**Cause**: Token not sent or expired

**Solution**:
1. Check frontend sends token in header:
   ```typescript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```
2. Verify token is stored in localStorage
3. Check token expiration (15 minutes for access token)
4. Implement token refresh logic
5. Check backend JWT settings

---

### Issue: OTP Not Received

**Symptoms**:
- User registers but no OTP in logs
- OTP verification fails

**Cause**: Email backend not configured or OTP not generated

**Solution**:
1. Check backend logs for OTP code (console backend)
2. Verify email backend setting:
   ```python
   EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
   ```
3. Check OTP generation in utils.py
4. For production, configure SendGrid:
   ```python
   EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
   EMAIL_HOST = 'smtp.sendgrid.net'
   EMAIL_HOST_USER = 'apikey'
   EMAIL_HOST_PASSWORD = '<sendgrid-api-key>'
   ```

---

### Issue: Account Locked After Failed Logins

**Symptoms**:
- Cannot login even with correct password
- Error: "Account is temporarily locked"

**Cause**: Too many failed login attempts (5+)

**Solution**:
1. Wait 15 minutes for automatic unlock
2. Or manually unlock in Django admin:
   - Go to: `https://numerai-backend.onrender.com/admin/`
   - Find user
   - Set `failed_login_attempts = 0`
   - Set `locked_until = None`
   - Save

---

## Performance Issues

### Issue: Slow Response Times

**Symptoms**:
- API requests take > 5 seconds
- Frontend loads slowly

**Diagnosis**:
1. Check service metrics (CPU, memory)
2. Check database query performance
3. Check Redis connection

**Solution**:
1. Upgrade service plan (more CPU/RAM)
2. Optimize database queries:
   - Add indexes
   - Use select_related/prefetch_related
3. Enable caching:
   - Cache API responses
   - Cache database queries
4. Use CDN for static files
5. Reduce Gunicorn workers if high memory

---

### Issue: Service Spins Down (Free Tier)

**Symptoms**:
- First request after inactivity is very slow (30+ seconds)
- Service shows "Spinning up"

**Cause**: Free tier spins down after 15 minutes of inactivity

**Solution**:
1. Upgrade to Starter plan ($7/month) for always-on
2. Or use external monitoring to ping service every 10 minutes:
   ```bash
   # Cron job or external service
   curl https://numerai-backend.onrender.com/api/v1/health/
   ```

---

### Issue: High Memory Usage

**Symptoms**:
- Service crashes with "Out of memory"
- Metrics show 90%+ memory usage

**Cause**: Memory leak or too many workers

**Solution**:
1. Reduce Gunicorn workers:
   ```
   --workers 2  # Instead of 4
   ```
2. Add max requests per worker:
   ```
   --max-requests 1000 --max-requests-jitter 50
   ```
3. Upgrade service plan for more RAM
4. Check for memory leaks in code

---

## Cost Issues

### Issue: Unexpected High Costs

**Symptoms**:
- Bill is higher than expected
- Multiple services running

**Diagnosis**:
1. Go to Render Dashboard → "Billing"
2. Check "Usage" tab
3. Identify expensive services

**Solution**:
1. Verify all services are on correct plans
2. Suspend unused services:
   - Go to service → "Settings" → "Suspend"
3. Downgrade overprovisioned services
4. Use free tier for development
5. Delete test/duplicate services

---

### Issue: Free Tier Limitations

**Symptoms**:
- Services spin down frequently
- Slow cold starts
- Limited resources

**Solution**:
1. Understand free tier limits:
   - 512MB RAM
   - Shared CPU
   - Spins down after 15 min inactivity
   - 750 hours/month
2. Upgrade critical services to Starter
3. Keep non-critical services on free tier
4. Use external monitoring to keep services warm

---

## Common Error Messages

### "This field is required"

**Cause**: Missing required field in API request

**Solution**: Check API documentation for required fields

---

### "Invalid credentials"

**Cause**: Wrong email/password or user not verified

**Solution**:
1. Verify user exists in database
2. Check user is verified
3. Try password reset flow

---

### "Token has expired"

**Cause**: Access token expired (15 minutes)

**Solution**: Use refresh token to get new access token

---

### "Rate limit exceeded"

**Cause**: Too many requests in short time

**Solution**:
1. Wait before retrying
2. Implement exponential backoff
3. Check rate limits in settings

---

## Debugging Tools

### View Logs
```bash
# Render Dashboard → Service → Logs
# Or use Render CLI
render logs <service-name>
```

### Connect to Database
```bash
# Get connection string from Render Dashboard
psql <DATABASE_URL>

# List tables
\dt

# Query users
SELECT * FROM users;
```

### Connect to Redis
```bash
# Use redis-cli with connection string
redis-cli -u <REDIS_URL>

# Check keys
KEYS *

# Get value
GET key_name
```

### Test API Endpoints
```bash
# Health check
curl https://numerai-backend.onrender.com/api/v1/health/

# Register user
curl -X POST https://numerai-backend.onrender.com/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","full_name":"Test User"}'

# Login
curl -X POST https://numerai-backend.onrender.com/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

---

## Getting Help

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Email: support@render.com
- Status: https://status.render.com

### NumerAI Team
- Check logs first
- Review this troubleshooting guide
- Search GitHub issues
- Create new issue with:
  - Error message
  - Steps to reproduce
  - Logs
  - Screenshots

---

## Prevention Tips

1. **Test Locally First**:
   - Use docker-compose to test before deploying
   - Verify all environment variables
   - Test all API endpoints

2. **Monitor Regularly**:
   - Check logs daily
   - Review metrics weekly
   - Set up alerts for errors

3. **Keep Documentation Updated**:
   - Document all environment variables
   - Note any configuration changes
   - Update troubleshooting guide

4. **Use Version Control**:
   - Commit working code
   - Tag releases
   - Easy rollback if needed

5. **Backup Regularly**:
   - Export database backups
   - Save environment variables
   - Document service configuration

---

**Last Updated**: November 10, 2025
**Status**: Ready for Use