# NumerAI Deployment Checklist

Use this checklist to ensure successful deployment to Render.com staging environment.

## Pre-Deployment Checklist

### Code Preparation
- [ ] All Sprint 1 code committed to `main` branch
- [ ] No `.env` files committed to Git
- [ ] All dependencies listed in `requirements.txt` and `package.json`
- [ ] `build.sh` script is executable (`chmod +x`)
- [ ] Database migrations are up to date
- [ ] Static files configuration is correct

### Documentation Review
- [ ] Read DEPLOYMENT.md completely
- [ ] Understand cost estimates (~$38/month)
- [ ] Have GitHub account ready
- [ ] Have Render.com account created

### Repository Setup
- [ ] Repository is on GitHub
- [ ] Repository is accessible (public or Render has access)
- [ ] Latest code is pushed to `main` branch
- [ ] No sensitive data in repository

---

## Deployment Checklist

### 1. Account Setup
- [ ] Render.com account created
- [ ] Email verified
- [ ] GitHub connected to Render
- [ ] Repository access granted

### 2. Database Setup (PostgreSQL)
- [ ] PostgreSQL database created
- [ ] Name: `numerai-postgres`
- [ ] Plan: Starter ($7/month)
- [ ] Region: Oregon (us-west)
- [ ] Database is "Available" (green status)
- [ ] Internal Database URL copied and saved

### 3. Redis Setup
- [ ] Redis instance created
- [ ] Name: `numerai-redis`
- [ ] Plan: Starter ($10/month)
- [ ] Region: Oregon (us-west)
- [ ] Redis is "Available" (green status)
- [ ] Internal Redis URL copied and saved

### 4. Backend Deployment (Django)
- [ ] Web service created
- [ ] Name: `numerai-backend`
- [ ] Root directory: `backend`
- [ ] Build command: `./build.sh`
- [ ] Start command: `gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120 numerai.wsgi:application`
- [ ] Plan: Starter ($7/month)
- [ ] All environment variables added (see below)
- [ ] Health check path: `/api/v1/health/`
- [ ] Service deployed successfully
- [ ] Service shows "Live" status

#### Backend Environment Variables
- [ ] `PYTHON_VERSION = 3.11.0`
- [ ] `DJANGO_SETTINGS_MODULE = numerai.settings.production`
- [ ] `SECRET_KEY` = <generated>
- [ ] `DEBUG = False`
- [ ] `ALLOWED_HOSTS = numerai-backend.onrender.com`
- [ ] `DATABASE_URL` = <from PostgreSQL>
- [ ] `REDIS_URL` = <from Redis>
- [ ] `CELERY_BROKER_URL` = <from Redis>
- [ ] `CELERY_RESULT_BACKEND` = <from Redis>
- [ ] `CORS_ALLOWED_ORIGINS = https://numerai-frontend.onrender.com`
- [ ] `EMAIL_BACKEND = django.core.mail.backends.console.EmailBackend`
- [ ] `DEFAULT_FROM_EMAIL = noreply@numerai.app`

### 5. Celery Worker Deployment
- [ ] Background worker created
- [ ] Name: `numerai-celery-worker`
- [ ] Root directory: `backend`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `celery -A numerai worker -l info`
- [ ] Plan: Starter ($7/month)
- [ ] All environment variables added (same as backend except CORS)
- [ ] Worker deployed successfully
- [ ] Logs show "celery@... ready"

### 6. Frontend Deployment (Next.js)
- [ ] Web service created
- [ ] Name: `numerai-frontend`
- [ ] Root directory: `frontend`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Plan: Starter ($7/month)
- [ ] Environment variables added (see below)
- [ ] Service deployed successfully
- [ ] Service shows "Live" status

#### Frontend Environment Variables
- [ ] `NODE_VERSION = 18.17.0`
- [ ] `NEXT_PUBLIC_API_URL = https://numerai-backend.onrender.com/api/v1`

### 7. CORS Update
- [ ] Frontend URL confirmed
- [ ] Backend `CORS_ALLOWED_ORIGINS` updated with actual frontend URL
- [ ] Backend redeployed after CORS update

---

## Post-Deployment Verification

### Backend Verification
- [ ] Health check endpoint accessible: `https://numerai-backend.onrender.com/api/v1/health/`
- [ ] Returns JSON: `{"status": "healthy", "timestamp": "..."}`
- [ ] API documentation accessible: `https://numerai-backend.onrender.com/api/schema/swagger-ui/`
- [ ] Shows all 8 authentication endpoints
- [ ] Admin panel accessible: `https://numerai-backend.onrender.com/admin/`

### Frontend Verification
- [ ] Frontend accessible: `https://numerai-frontend.onrender.com`
- [ ] Landing page loads correctly
- [ ] Login button visible
- [ ] Register button visible
- [ ] No console errors in browser
- [ ] Styling loads correctly

### Database Verification
- [ ] Can connect to database with provided credentials
- [ ] Tables created (users, user_profiles, otp_codes, refresh_tokens, device_tokens)
- [ ] Migrations applied successfully
- [ ] No migration errors in backend logs

### Redis Verification
- [ ] Redis shows connection activity in metrics
- [ ] Backend can connect to Redis
- [ ] Celery worker can connect to Redis

### Celery Verification
- [ ] Celery worker logs show "ready" status
- [ ] No connection errors in logs
- [ ] Worker can connect to database and Redis

---

## Functional Testing

### 1. User Registration Flow
- [ ] Navigate to frontend
- [ ] Click "Register"
- [ ] Fill in registration form:
  - Full Name: Test User
  - Email: test@example.com
  - Password: TestPass123
  - Confirm Password: TestPass123
- [ ] Submit form
- [ ] No errors displayed
- [ ] Redirected to OTP verification page
- [ ] Check backend logs for OTP code
- [ ] OTP code visible in logs

### 2. OTP Verification Flow
- [ ] Copy OTP from backend logs
- [ ] Enter OTP in verification page
- [ ] Submit OTP
- [ ] No errors displayed
- [ ] Redirected to dashboard
- [ ] User is logged in

### 3. Dashboard Access
- [ ] Dashboard loads correctly
- [ ] User name displayed
- [ ] Email displayed
- [ ] Account status shows "Verified"
- [ ] Subscription shows "Free"

### 4. Logout Flow
- [ ] Click "Logout" button
- [ ] Redirected to login page
- [ ] Cannot access dashboard without login

### 5. Login Flow
- [ ] Navigate to login page
- [ ] Enter credentials:
  - Email: test@example.com
  - Password: TestPass123
- [ ] Submit form
- [ ] No errors displayed
- [ ] Redirected to dashboard
- [ ] User is logged in

### 6. Failed Login Attempt
- [ ] Try login with wrong password
- [ ] Error message displayed
- [ ] Not redirected
- [ ] Try 5 times
- [ ] Account locked message displayed

### 7. Password Reset Flow (if implemented)
- [ ] Click "Forgot Password"
- [ ] Enter email
- [ ] Submit form
- [ ] Check backend logs for OTP
- [ ] Enter OTP and new password
- [ ] Password reset successful
- [ ] Can login with new password

---

## API Testing

### Using Swagger UI

- [ ] Navigate to: `https://numerai-backend.onrender.com/api/schema/swagger-ui/`
- [ ] Test each endpoint:

#### 1. POST /api/v1/auth/register/
- [ ] Endpoint visible
- [ ] Try it out
- [ ] Enter test data
- [ ] Execute
- [ ] Returns 201 Created
- [ ] Response includes user_id

#### 2. POST /api/v1/auth/verify-otp/
- [ ] Endpoint visible
- [ ] Try it out
- [ ] Enter email and OTP from logs
- [ ] Execute
- [ ] Returns 200 OK
- [ ] Response includes access_token and refresh_token

#### 3. POST /api/v1/auth/login/
- [ ] Endpoint visible
- [ ] Try it out
- [ ] Enter credentials
- [ ] Execute
- [ ] Returns 200 OK
- [ ] Response includes tokens

#### 4. GET /api/v1/users/profile/
- [ ] Endpoint visible
- [ ] Add Bearer token to authorization
- [ ] Try it out
- [ ] Execute
- [ ] Returns 200 OK
- [ ] Response includes user profile

#### 5. POST /api/v1/auth/logout/
- [ ] Endpoint visible
- [ ] Add Bearer token
- [ ] Enter refresh_token
- [ ] Execute
- [ ] Returns 200 OK

---

## Performance Testing

### Response Times
- [ ] Health check responds in < 1 second
- [ ] API endpoints respond in < 2 seconds
- [ ] Frontend loads in < 3 seconds
- [ ] No timeout errors

### Load Testing (Optional)
- [ ] Use tool like Apache Bench or k6
- [ ] Test with 10 concurrent users
- [ ] No errors or crashes
- [ ] Response times acceptable

---

## Security Verification

### HTTPS
- [ ] All URLs use HTTPS
- [ ] SSL certificate valid
- [ ] No mixed content warnings

### CORS
- [ ] Frontend can call backend APIs
- [ ] Other domains blocked (test with curl)
- [ ] No CORS errors in browser console

### Authentication
- [ ] Cannot access protected endpoints without token
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected
- [ ] Token refresh works

### Environment Variables
- [ ] No secrets in code
- [ ] No secrets in logs
- [ ] SECRET_KEY is strong and unique
- [ ] DATABASE_URL not exposed

---

## Monitoring Setup

### Logs
- [ ] Backend logs accessible
- [ ] Frontend logs accessible
- [ ] Celery logs accessible
- [ ] No critical errors in logs

### Metrics
- [ ] CPU usage reasonable (< 50%)
- [ ] Memory usage reasonable (< 80%)
- [ ] Request count tracking
- [ ] Response time tracking

### Alerts (Optional)
- [ ] Set up email alerts for errors
- [ ] Set up alerts for high CPU/memory
- [ ] Set up alerts for service downtime

---

## Documentation

### URLs Documented
- [ ] Backend URL saved
- [ ] Frontend URL saved
- [ ] Database connection details saved
- [ ] Redis connection details saved

### Credentials Secured
- [ ] Database credentials saved securely
- [ ] SECRET_KEY saved securely
- [ ] All environment variables documented
- [ ] Access to Render dashboard secured

### Team Communication
- [ ] Deployment status shared with team
- [ ] URLs shared with stakeholders
- [ ] Known issues documented
- [ ] Next steps communicated

---

## Cost Verification

### Billing
- [ ] Billing information added to Render
- [ ] Payment method verified
- [ ] Current month cost estimate reviewed
- [ ] All services on correct plans

### Service Plans
- [ ] PostgreSQL: Starter ($7/month)
- [ ] Redis: Starter ($10/month)
- [ ] Backend: Starter ($7/month)
- [ ] Celery: Starter ($7/month)
- [ ] Frontend: Starter ($7/month)
- [ ] **Total: ~$38/month**

---

## Rollback Plan

### If Deployment Fails

1. **Check Logs**:
   - [ ] Review build logs for errors
   - [ ] Review runtime logs for errors
   - [ ] Identify root cause

2. **Common Issues**:
   - [ ] Missing environment variables
   - [ ] Database connection failed
   - [ ] Redis connection failed
   - [ ] Build script errors
   - [ ] Port binding errors

3. **Rollback Steps**:
   - [ ] Go to service → "Events"
   - [ ] Click "Rollback" on last successful deploy
   - [ ] Or manually deploy previous commit

4. **Fix and Redeploy**:
   - [ ] Fix issue locally
   - [ ] Test locally with docker-compose
   - [ ] Commit and push fix
   - [ ] Render auto-deploys

---

## Success Criteria

Deployment is successful when:

- [ ] All 5 services are "Live" (green status)
- [ ] Health check returns healthy status
- [ ] Frontend loads without errors
- [ ] User can register and login
- [ ] OTP verification works
- [ ] Dashboard accessible after login
- [ ] API documentation accessible
- [ ] No critical errors in logs
- [ ] All tests pass
- [ ] Performance is acceptable
- [ ] Security checks pass
- [ ] Cost is within budget

---

## Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Monitor logs for errors
- [ ] Test all critical flows
- [ ] Verify Celery tasks running
- [ ] Check database connections
- [ ] Verify Redis connections

### Short-term (Week 1)
- [ ] Monitor performance metrics
- [ ] Review error logs daily
- [ ] Test with real users
- [ ] Gather feedback
- [ ] Document any issues

### Medium-term (Month 1)
- [ ] Review cost and optimize
- [ ] Plan for production deployment
- [ ] Prepare for Sprint 2 features
- [ ] Set up monitoring alerts
- [ ] Create backup strategy

---

## Sign-off

**Deployment Completed By**: ___________________

**Date**: ___________________

**Services Deployed**:
- [ ] PostgreSQL Database
- [ ] Redis Cache
- [ ] Django Backend
- [ ] Celery Worker
- [ ] Next.js Frontend

**All Tests Passed**: [ ] Yes [ ] No

**Ready for User Testing**: [ ] Yes [ ] No

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________

---

**Status**: Ready for Staging Deployment
**Last Updated**: November 10, 2025