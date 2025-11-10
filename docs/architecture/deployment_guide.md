# NumerAI Deployment Guide
**Version:** 1.0  
**Date:** November 10, 2025  
**Status:** Production Ready

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Staging Deployment](#staging-deployment)
4. [Production Deployment](#production-deployment)
5. [Post-Deployment Checklist](#post-deployment-checklist)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### 1.1 Required Software
- **Docker:** 20.10+ and Docker Compose 2.0+
- **Git:** 2.30+
- **Node.js:** 18+ (for frontend development)
- **Python:** 3.11+ (for backend development)
- **PostgreSQL Client:** 14+ (for database management)

### 1.2 Required Accounts
- **GitHub:** For code repository and CI/CD
- **OpenAI:** API key for GPT-4
- **Firebase:** Project for push notifications
- **SendGrid:** API key for transactional emails
- **Stripe:** Account for payments (Phase 2)
- **Cloud Provider:** AWS, DigitalOcean, or Render.com account

### 1.3 Required Secrets
```bash
# Backend secrets
SECRET_KEY=<django-secret-key>
DATABASE_URL=<postgresql-connection-string>
REDIS_URL=<redis-connection-string>
OPENAI_API_KEY=<openai-api-key>
FIREBASE_CREDENTIALS=<base64-encoded-credentials>
SENDGRID_API_KEY=<sendgrid-api-key>

# Frontend secrets
NEXT_PUBLIC_API_URL=<backend-api-url>
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=<ga-tracking-id>
```

---

## 2. Local Development Setup

### 2.1 Clone Repository
```bash
git clone https://github.com/numerai/numerai-platform.git
cd numerai-platform
```

### 2.2 Environment Configuration
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit environment files with your local values
nano backend/.env
nano frontend/.env
```

### 2.3 Start Services with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### 2.4 Initialize Database
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Load sample data (optional)
docker-compose exec backend python manage.py loaddata fixtures/sample_data.json
```

### 2.5 Verify Setup
```bash
# Check backend health
curl http://localhost:8000/api/v1/health

# Check frontend
curl http://localhost:3000

# Run backend tests
docker-compose exec backend python manage.py test

# Run frontend tests
docker-compose exec frontend npm test
```

---

## 3. Staging Deployment

### 3.1 Render.com Staging Deployment

#### 3.1.1 Create render.yaml
```yaml
# render.yaml
services:
  # Backend Web Service
  - type: web
    name: numerai-backend-staging
    env: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: ENVIRONMENT
        value: staging
      - key: DEBUG
        value: false
      - key: SECRET_KEY
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: numerai-db-staging
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: numerai-redis-staging
          type: redis
          property: connectionString
    healthCheckPath: /api/v1/health

  # Celery Worker
  - type: worker
    name: numerai-celery-staging
    env: docker
    dockerfilePath: ./backend/Dockerfile
    dockerCommand: celery -A numerai worker -l info
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: numerai-db-staging
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: numerai-redis-staging
          type: redis
          property: connectionString

  # Celery Beat
  - type: worker
    name: numerai-beat-staging
    env: docker
    dockerfilePath: ./backend/Dockerfile
    dockerCommand: celery -A numerai beat -l info
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: numerai-db-staging
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: numerai-redis-staging
          type: redis
          property: connectionString

  # Frontend
  - type: web
    name: numerai-frontend-staging
    env: docker
    dockerfilePath: ./frontend/Dockerfile
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://numerai-backend-staging.onrender.com/api/v1

databases:
  - name: numerai-db-staging
    databaseName: numerai
    user: numerai

  - name: numerai-redis-staging
    ipAllowList: []
```

#### 3.1.2 Deploy to Render.com
```bash
# Push to GitHub
git push origin develop

# Render will automatically deploy from render.yaml
# Or manually trigger via Render dashboard
```

---

## 4. Production Deployment

### 4.1 Option A: AWS Deployment (Recommended for Scale)

#### 4.1.1 Infrastructure Setup

**Step 1: Create VPC and Subnets**
```bash
# Using AWS CLI
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=numerai-vpc}]'

# Create public subnets (for ALB)
aws ec2 create-subnet --vpc-id <vpc-id> --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id <vpc-id> --cidr-block 10.0.2.0/24 --availability-zone us-east-1b

# Create private subnets (for ECS tasks)
aws ec2 create-subnet --vpc-id <vpc-id> --cidr-block 10.0.10.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id <vpc-id> --cidr-block 10.0.11.0/24 --availability-zone us-east-1b
```

**Step 2: Create RDS PostgreSQL Database**
```bash
aws rds create-db-instance \
  --db-instance-identifier numerai-db-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.7 \
  --master-username numerai \
  --master-user-password <secure-password> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids <security-group-id> \
  --db-subnet-group-name numerai-db-subnet \
  --backup-retention-period 30 \
  --multi-az \
  --storage-encrypted
```

**Step 3: Create ElastiCache Redis Cluster**
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id numerai-redis-prod \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name numerai-redis-subnet \
  --security-group-ids <security-group-id>
```

**Step 4: Create ECS Cluster**
```bash
aws ecs create-cluster --cluster-name numerai-prod
```

**Step 5: Create Task Definitions**

```json
{
  "family": "numerai-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "numerai/backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ENVIRONMENT",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:numerai/SECRET_KEY"
        },
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:numerai/DATABASE_URL"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/numerai-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/api/v1/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

**Step 6: Create Application Load Balancer**
```bash
aws elbv2 create-load-balancer \
  --name numerai-alb-prod \
  --subnets <public-subnet-1> <public-subnet-2> \
  --security-groups <alb-security-group> \
  --scheme internet-facing \
  --type application
```

**Step 7: Create ECS Service**
```bash
aws ecs create-service \
  --cluster numerai-prod \
  --service-name numerai-backend-service \
  --task-definition numerai-backend:1 \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<private-subnet-1>,<private-subnet-2>],securityGroups=[<ecs-security-group>],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=<target-group-arn>,containerName=backend,containerPort=8000"
```

#### 4.1.2 Deploy Application

```bash
# Build and push Docker images
docker build -t numerai/backend:latest ./backend
docker tag numerai/backend:latest <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/numerai/backend:latest
docker push <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/numerai/backend:latest

# Update ECS service
aws ecs update-service \
  --cluster numerai-prod \
  --service numerai-backend-service \
  --force-new-deployment
```

### 4.2 Option B: DigitalOcean Deployment (Cost-Effective)

#### 4.2.1 Create Droplets

```bash
# Create 3 app droplets
doctl compute droplet create numerai-app-1 \
  --size s-2vcpu-4gb \
  --image docker-20-04 \
  --region nyc3 \
  --ssh-keys <ssh-key-id>

doctl compute droplet create numerai-app-2 \
  --size s-2vcpu-4gb \
  --image docker-20-04 \
  --region nyc3 \
  --ssh-keys <ssh-key-id>

doctl compute droplet create numerai-app-3 \
  --size s-2vcpu-4gb \
  --image docker-20-04 \
  --region nyc3 \
  --ssh-keys <ssh-key-id>
```

#### 4.2.2 Create Managed Database

```bash
# Create PostgreSQL database
doctl databases create numerai-db-prod \
  --engine pg \
  --version 14 \
  --size db-s-2vcpu-4gb \
  --region nyc3 \
  --num-nodes 1

# Create Redis cluster
doctl databases create numerai-redis-prod \
  --engine redis \
  --version 7 \
  --size db-s-1vcpu-1gb \
  --region nyc3
```

#### 4.2.3 Setup Load Balancer

```bash
doctl compute load-balancer create \
  --name numerai-lb-prod \
  --region nyc3 \
  --forwarding-rules entry_protocol:https,entry_port:443,target_protocol:http,target_port:8000,certificate_id:<cert-id> \
  --health-check protocol:http,port:8000,path:/api/v1/health,check_interval_seconds:10,response_timeout_seconds:5,healthy_threshold:3,unhealthy_threshold:3 \
  --droplet-ids <droplet-1-id>,<droplet-2-id>,<droplet-3-id>
```

#### 4.2.4 Deploy Application

```bash
# SSH into each droplet and run:
ssh root@<droplet-ip>

# Pull and run Docker containers
docker pull numerai/backend:latest
docker run -d \
  --name numerai-backend \
  --restart always \
  -p 8000:8000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e REDIS_URL=$REDIS_URL \
  numerai/backend:latest
```

### 4.3 Option C: Render.com Production (Simplest)

#### 4.3.1 Update render.yaml for Production

```yaml
services:
  - type: web
    name: numerai-backend-prod
    env: docker
    plan: standard
    dockerfilePath: ./backend/Dockerfile
    autoDeploy: false  # Manual deploys for production
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: numerai-db-prod
          property: connectionString
    healthCheckPath: /api/v1/health

databases:
  - name: numerai-db-prod
    databaseName: numerai
    plan: standard
```

#### 4.3.2 Deploy

```bash
# Push to main branch
git checkout main
git merge develop
git push origin main

# Manually trigger deployment in Render dashboard
```

---

## 5. Post-Deployment Checklist

### 5.1 Verify Deployment

```bash
# Check backend health
curl https://api.numerai.app/api/v1/health

# Check frontend
curl https://numerai.app

# Verify database connection
psql $DATABASE_URL -c "SELECT version();"

# Verify Redis connection
redis-cli -u $REDIS_URL ping
```

### 5.2 Run Database Migrations

```bash
# Production database migrations
python manage.py migrate --settings=numerai.settings.production

# Verify migrations
python manage.py showmigrations
```

### 5.3 Create Superuser

```bash
python manage.py createsuperuser --settings=numerai.settings.production
```

### 5.4 Configure DNS

```bash
# Point domain to load balancer
# A record: numerai.app -> <load-balancer-ip>
# CNAME: api.numerai.app -> <backend-url>
# CNAME: www.numerai.app -> numerai.app
```

### 5.5 Setup SSL Certificates

```bash
# Using Let's Encrypt with Certbot
certbot certonly --standalone -d numerai.app -d www.numerai.app -d api.numerai.app

# Or use CloudFlare for automatic SSL
```

### 5.6 Configure Monitoring

```bash
# Setup Sentry
export SENTRY_DSN=<sentry-dsn>

# Setup CloudWatch alarms (AWS)
aws cloudwatch put-metric-alarm \
  --alarm-name numerai-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### 5.7 Setup Backups

```bash
# Automated daily backups
# Add to crontab:
0 2 * * * /usr/local/bin/backup-database.sh

# backup-database.sh:
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > /backups/numerai_${TIMESTAMP}.sql.gz
aws s3 cp /backups/numerai_${TIMESTAMP}.sql.gz s3://numerai-backups/
```

---

## 6. Monitoring & Maintenance

### 6.1 Monitoring Dashboard

**Key Metrics to Monitor:**
- API response time (P50, P95, P99)
- Error rate (4xx, 5xx)
- Database connections
- Redis memory usage
- Celery queue length
- Active users (DAU, MAU)

**Tools:**
- **Sentry:** Error tracking and performance monitoring
- **CloudWatch/Datadog:** Infrastructure metrics
- **Google Analytics:** User behavior
- **Uptime Robot:** Uptime monitoring

### 6.2 Log Management

```bash
# View logs (Docker Compose)
docker-compose logs -f backend

# View logs (AWS ECS)
aws logs tail /ecs/numerai-backend --follow

# View logs (DigitalOcean)
ssh root@<droplet-ip>
docker logs -f numerai-backend
```

### 6.3 Scaling

**Horizontal Scaling:**
```bash
# AWS ECS
aws ecs update-service \
  --cluster numerai-prod \
  --service numerai-backend-service \
  --desired-count 5

# DigitalOcean
# Add more droplets and add to load balancer
```

**Vertical Scaling:**
```bash
# Increase task resources (AWS)
# Update task definition with more CPU/memory

# Resize droplet (DigitalOcean)
doctl compute droplet-action resize <droplet-id> --size s-4vcpu-8gb
```

### 6.4 Database Maintenance

```bash
# Vacuum database (weekly)
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size('numerai'));"

# Check slow queries
psql $DATABASE_URL -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

---

## 7. Troubleshooting

### 7.1 Common Issues

#### Issue: High API Response Time

**Diagnosis:**
```bash
# Check database queries
python manage.py shell
>>> from django.db import connection
>>> print(connection.queries)

# Check Redis latency
redis-cli --latency
```

**Solution:**
- Add database indexes
- Implement caching
- Optimize queries (use select_related, prefetch_related)

#### Issue: Celery Tasks Not Processing

**Diagnosis:**
```bash
# Check Celery workers
celery -A numerai inspect active

# Check Redis queue
redis-cli llen celery
```

**Solution:**
```bash
# Restart Celery workers
docker-compose restart celery_worker

# Clear stuck tasks
celery -A numerai purge
```

#### Issue: Database Connection Pool Exhausted

**Diagnosis:**
```bash
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

**Solution:**
- Increase max_connections in PostgreSQL
- Implement connection pooling with PgBouncer
- Close idle connections

#### Issue: Out of Memory

**Diagnosis:**
```bash
# Check memory usage
docker stats

# Check Redis memory
redis-cli info memory
```

**Solution:**
- Increase container memory limits
- Implement Redis eviction policy
- Optimize memory-intensive operations

### 7.2 Rollback Procedure

```bash
# Rollback to previous version (AWS ECS)
aws ecs update-service \
  --cluster numerai-prod \
  --service numerai-backend-service \
  --task-definition numerai-backend:previous-version

# Rollback database migration
python manage.py migrate <app_name> <previous_migration_number>

# Rollback Docker image
docker pull numerai/backend:previous-tag
docker-compose up -d
```

### 7.3 Emergency Contacts

- **On-Call Engineer:** +91-XXXX-XXXXXX
- **DevOps Lead:** devops@numerai.app
- **AWS Support:** https://console.aws.amazon.com/support
- **Render Support:** support@render.com

---

## 8. Security Checklist

- [ ] SSL/TLS certificates installed and auto-renewing
- [ ] Firewall rules configured (only necessary ports open)
- [ ] Database encryption at rest enabled
- [ ] Secrets stored in AWS Secrets Manager / environment variables
- [ ] CORS configured with whitelist
- [ ] Rate limiting enabled
- [ ] DDoS protection enabled (CloudFlare)
- [ ] Regular security audits scheduled
- [ ] Backup and disaster recovery plan tested
- [ ] Monitoring and alerting configured

---

## 9. Maintenance Schedule

### Daily
- Monitor error rates and response times
- Check Celery queue length
- Review critical alerts

### Weekly
- Review application logs
- Check database performance
- Vacuum and analyze database
- Review and rotate logs

### Monthly
- Security audit
- Dependency updates
- Performance review
- Capacity planning
- Backup restoration test

### Quarterly
- Disaster recovery drill
- Architecture review
- Cost optimization review
- Security penetration testing

---

**Document Status:** Production Ready  
**Last Updated:** November 10, 2025  
**Next Review:** After first production deployment  
**Maintained By:** DevOps Team

---

**END OF DOCUMENT**