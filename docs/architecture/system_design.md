# NumerAI System Architecture Design
**Version:** 1.0  
**Date:** November 10, 2025  
**Status:** Ready for Implementation  
**Architect:** Bob

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [System Architecture Overview](#system-architecture-overview)
4. [Microservices Architecture](#microservices-architecture)
5. [API Design Principles](#api-design-principles)
6. [Database Architecture](#database-architecture)
7. [Caching Strategy](#caching-strategy)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)
10. [Monitoring & Logging](#monitoring--logging)
11. [Scalability & Performance](#scalability--performance)
12. [Disaster Recovery](#disaster-recovery)

---

## 1. Executive Summary

### 1.1 Architecture Goals
- **Scalability:** Support 10K-100K users with horizontal scaling
- **Performance:** API response time < 2 seconds, 99.9% uptime
- **Security:** Enterprise-grade security with JWT authentication, encryption at rest/transit
- **Maintainability:** Clean architecture, separation of concerns, comprehensive documentation
- **Cost-Efficiency:** Optimize cloud costs while maintaining performance

### 1.2 Key Design Decisions
- **Monolithic Backend (Phase 1):** Django monolith for faster MVP development, designed for future microservices migration
- **API-First Design:** RESTful APIs with OpenAPI 3.0 specification
- **Containerization:** Docker for consistent environments across dev/staging/production
- **Cloud-Agnostic:** Design works on AWS, GCP, DigitalOcean, or Render.com
- **Async Task Processing:** Celery + Redis for background jobs (daily readings, notifications)

---

## 2. Technology Stack

### 2.1 Backend Stack

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **Runtime** | Python | 3.11+ | Modern Python features, excellent Django support |
| **Framework** | Django | 5.0+ | Robust ORM, admin panel, security features, mature ecosystem |
| **API Framework** | Django REST Framework | 3.14+ | Industry standard for Django APIs, excellent serialization |
| **Authentication** | djangorestframework-simplejwt | 5.3+ | JWT tokens, refresh token rotation, blacklisting |
| **Task Queue** | Celery | 5.3+ | Distributed task processing, scheduling, retries |
| **Message Broker** | Redis | 7.2+ | Fast, reliable, supports pub/sub and caching |
| **Database** | PostgreSQL | 14+ | ACID compliance, JSON support, excellent performance |
| **ORM** | Django ORM | Built-in | Type-safe queries, migrations, admin integration |
| **API Documentation** | drf-spectacular | 0.26+ | OpenAPI 3.0 generation from Django REST Framework |
| **CORS** | django-cors-headers | 4.3+ | Cross-origin resource sharing for frontend |
| **Environment** | python-decouple | 3.8+ | Environment variable management |

### 2.2 Frontend Stack

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **Framework** | Next.js | 14+ | React framework with SSR, API routes, excellent performance |
| **Language** | TypeScript | 5.0+ | Type safety, better developer experience, fewer bugs |
| **UI Library** | React | 18+ | Component-based, large ecosystem, excellent performance |
| **Styling** | TailwindCSS | 3.4+ | Utility-first CSS, rapid development, small bundle size |
| **Component Library** | Shadcn-ui | Latest | Accessible, customizable, built on Radix UI |
| **State Management** | Zustand | 4.4+ | Lightweight, simple API, TypeScript support |
| **Forms** | React Hook Form | 7.48+ | Performant, minimal re-renders, excellent validation |
| **Validation** | Zod | 3.22+ | TypeScript-first schema validation |
| **HTTP Client** | Axios | 1.6+ | Interceptors, request/response transformation, timeout handling |
| **Date Handling** | date-fns | 3.0+ | Modern, tree-shakeable, immutable |

### 2.3 Infrastructure & DevOps

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Containerization** | Docker | Consistent environments, easy deployment |
| **Orchestration** | Docker Compose | Local development, simple production setup |
| **CI/CD** | GitHub Actions | Free for public repos, excellent GitHub integration |
| **Cloud Provider** | AWS / DigitalOcean / Render.com | Flexible, cost-effective options |
| **Load Balancer** | Nginx | High performance, reverse proxy, SSL termination |
| **File Storage** | AWS S3 / DigitalOcean Spaces | Scalable object storage for PDFs, images |
| **CDN** | CloudFlare | Global CDN, DDoS protection, free SSL |
| **Monitoring** | Sentry | Error tracking, performance monitoring |
| **Logging** | CloudWatch / Papertrail | Centralized logging, search, alerts |

### 2.4 Third-Party Services

| Service | Provider | Purpose |
|---------|----------|---------|
| **AI Model** | OpenAI GPT-4 | Numerology chatbot |
| **Push Notifications** | Firebase Cloud Messaging | Mobile/web push notifications |
| **Email** | SendGrid / AWS SES | Transactional emails (OTP, welcome) |
| **Payments** | Stripe | Subscription billing (Phase 2) |
| **Analytics** | Google Analytics | User behavior tracking |
| **SMS** | Twilio | OTP delivery via SMS |

---

## 3. System Architecture Overview

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │   Web Browser    │  │  Mobile (iOS)    │  │ Mobile (And.) │ │
│  │   (Next.js)      │  │  (Flutter)       │  │  (Flutter)    │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘ │
└───────────┼────────────────────┼────────────────────┼──────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      CloudFlare CDN     │
                    │   (SSL, DDoS, Cache)    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Nginx Load Balancer  │
                    │  (Reverse Proxy, SSL)   │
                    └────────────┬────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
    ┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
    │  Django App    │  │  Django App    │  │  Django App    │
    │  Instance 1    │  │  Instance 2    │  │  Instance 3    │
    └───────┬────────┘  └───────┬────────┘  └───────┬────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
    ┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
    │   PostgreSQL   │  │     Redis      │  │  Celery Worker │
    │   (Primary)    │  │  (Cache/Queue) │  │   (Tasks)      │
    └───────┬────────┘  └────────────────┘  └───────┬────────┘
            │                                        │
    ┌───────▼────────┐                      ┌───────▼────────┐
    │   PostgreSQL   │                      │  Celery Beat   │
    │   (Replica)    │                      │  (Scheduler)   │
    └────────────────┘                      └────────────────┘
                                                     │
            ┌────────────────────────────────────────┼────────┐
            │                    │                   │        │
    ┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐ │
    │   OpenAI API   │  │  Firebase FCM  │  │   AWS S3    │ │
    │   (Chatbot)    │  │ (Notifications)│  │  (Storage)  │ │
    └────────────────┘  └────────────────┘  └─────────────┘ │
                                                              │
                                                    ┌─────────▼──────┐
                                                    │   SendGrid     │
                                                    │   (Email)      │
                                                    └────────────────┘
```

### 3.2 Request Flow

#### 3.2.1 User Authentication Flow
```
User → Next.js → Nginx → Django → PostgreSQL
                                 ↓
                          Generate JWT Tokens
                                 ↓
                          Return to User
                                 ↓
                          Store in Browser
```

#### 3.2.2 Daily Reading Generation Flow
```
Celery Beat (7 AM) → Celery Worker → Django ORM → PostgreSQL
                                          ↓
                                   Generate Reading
                                          ↓
                                   Save to Database
                                          ↓
                                   Firebase FCM → User Device
```

#### 3.2.3 AI Chat Flow
```
User → Next.js → Django API → OpenAI GPT-4
                     ↓              ↓
                 Save Message   Get Response
                     ↓              ↓
                 PostgreSQL ← Save Response
                     ↓
                Return to User
```

---

## 4. Microservices Architecture

### 4.1 Service Boundaries (Future Migration Path)

While Phase 1 uses a Django monolith, the architecture is designed for future microservices migration:

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (Kong/Nginx)                 │
│  - Authentication                                            │
│  - Rate Limiting                                             │
│  - Request Routing                                           │
└───────────────┬─────────────────────────────────────────────┘
                │
        ┌───────┼───────┬───────────┬───────────┐
        │       │       │           │           │
┌───────▼───┐ ┌▼──────┐ ┌▼────────┐ ┌▼────────┐ ┌▼──────────┐
│   Auth    │ │ Core  │ │   AI    │ │ Notif.  │ │  Payment  │
│  Service  │ │  API  │ │ Service │ │ Service │ │  Service  │
│           │ │       │ │         │ │         │ │           │
│ - Login   │ │ -Calc │ │ -Chat   │ │ -Push   │ │ -Stripe   │
│ - Register│ │ -Chart│ │ -OpenAI │ │ -Email  │ │ -Billing  │
│ - JWT     │ │ -Read │ │ -Context│ │ -SMS    │ │ -Invoice  │
└───────────┘ └───────┘ └─────────┘ └─────────┘ └───────────┘
```

### 4.2 Phase 1 Monolithic Structure

For MVP, all services are Django apps within a single codebase:

```
numerai/
├── authentication/      # Auth service logic
│   ├── models.py       # User, RefreshToken
│   ├── views.py        # Login, Register, Verify
│   ├── serializers.py  # JWT serializers
│   └── services.py     # Business logic
├── core/               # Core API logic
│   ├── models.py       # NumerologyProfile, DailyReading
│   ├── views.py        # Profile, BirthChart, Readings
│   ├── serializers.py  # API serializers
│   ├── services.py     # Numerology calculations
│   └── tasks.py        # Celery tasks
├── ai/                 # AI service logic
│   ├── models.py       # Conversation, Message
│   ├── views.py        # Chat endpoint
│   ├── services.py     # OpenAI integration
│   └── prompts.py      # System prompts
├── notifications/      # Notification service logic
│   ├── models.py       # NotificationSettings, DeviceToken
│   ├── views.py        # Device registration
│   ├── services.py     # FCM integration
│   └── tasks.py        # Notification sending
└── payments/           # Payment service (Phase 2)
    ├── models.py       # Subscription, Payment
    ├── views.py        # Checkout, Webhook
    └── services.py     # Stripe integration
```

### 4.3 Service Communication Patterns

#### 4.3.1 Internal Communication (Phase 1)
- **Direct Function Calls:** Services call each other via Python imports
- **Event Bus (Future):** Redis pub/sub for decoupled communication

#### 4.3.2 External Communication
- **HTTP/REST:** All external APIs (OpenAI, Firebase, Stripe)
- **Webhooks:** Stripe payment events, FCM delivery reports

---

## 5. API Design Principles

### 5.1 RESTful API Standards

#### 5.1.1 URL Structure
```
/api/v1/{resource}/{id}/{action}

Examples:
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
GET    /api/v1/numerology/birth-chart
POST   /api/v1/ai/chat
GET    /api/v1/numerology/daily-reading
```

#### 5.1.2 HTTP Methods
- **GET:** Retrieve resources (idempotent, cacheable)
- **POST:** Create resources, non-idempotent actions
- **PUT:** Full resource update (idempotent)
- **PATCH:** Partial resource update (idempotent)
- **DELETE:** Remove resources (idempotent)

#### 5.1.3 Response Format
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "request_id": "req-uuid"
  }
}
```

#### 5.1.4 Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "request_id": "req-uuid"
  }
}
```

### 5.2 Authentication & Authorization

#### 5.2.1 JWT Token Structure
```json
{
  "access_token": {
    "user_id": "uuid",
    "email": "user@example.com",
    "is_premium": false,
    "exp": 1735214400,
    "iat": 1735210800
  },
  "refresh_token": {
    "user_id": "uuid",
    "token_id": "uuid",
    "exp": 1737802800,
    "iat": 1735210800
  }
}
```

#### 5.2.2 Authorization Header
```
Authorization: Bearer <access_token>
```

#### 5.2.3 Token Refresh Flow
```
1. Access token expires (1 hour)
2. Client sends refresh token to /api/v1/auth/refresh-token
3. Server validates refresh token
4. Server generates new access token
5. Server returns new access token (optionally rotates refresh token)
```

### 5.3 Rate Limiting

#### 5.3.1 Rate Limit Strategy
| Endpoint Category | Free Tier | Premium Tier |
|-------------------|-----------|--------------|
| Authentication | 10 req/min | 20 req/min |
| User Profile | 30 req/min | 60 req/min |
| Numerology | 20 req/min | 100 req/min |
| AI Chat | 20 msg/hour | Unlimited |
| Daily Reading | 10 req/min | 30 req/min |

#### 5.3.2 Rate Limit Headers
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1735214400
```

### 5.4 Pagination

#### 5.4.1 Cursor-Based Pagination (Preferred)
```
GET /api/v1/numerology/daily-reading?limit=20&cursor=eyJpZCI6IjEyMyJ9

Response:
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6IjE0MyJ9",
    "has_more": true
  }
}
```

#### 5.4.2 Offset-Based Pagination (Simple)
```
GET /api/v1/ai/conversations?page=2&per_page=20

Response:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### 5.5 API Versioning

#### 5.5.1 URL Versioning (Chosen Approach)
```
/api/v1/users/profile
/api/v2/users/profile  # Future version
```

**Rationale:** Simple, explicit, easy to cache, clear deprecation path

#### 5.5.2 Version Deprecation Policy
- **v1:** Supported for 12 months after v2 release
- **Deprecation Notice:** 6 months before sunset
- **Sunset Process:** 
  1. Add deprecation header: `Deprecation: true`
  2. Email users 6 months before
  3. Email users 3 months before
  4. Email users 1 month before
  5. Sunset v1

---

## 6. Database Architecture

### 6.1 PostgreSQL Schema Design

#### 6.1.1 Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │
│ email (UNIQUE)  │
│ phone (UNIQUE)  │
│ password_hash   │
│ full_name       │
│ date_of_birth   │
│ is_verified     │
│ created_at      │
└────────┬────────┘
         │ 1
         │
         │ 1:1
         ▼
┌─────────────────────────┐
│  numerology_profiles    │
│─────────────────────────│
│ id (PK)                 │
│ user_id (FK, UNIQUE)    │
│ life_path_number        │
│ destiny_number          │
│ soul_urge_number        │
│ personal_year_number    │
│ calculated_at           │
└─────────────────────────┘

┌─────────────────┐
│     users       │
└────────┬────────┘
         │ 1
         │
         │ 1:N
         ▼
┌─────────────────────────┐
│   daily_readings        │
│─────────────────────────│
│ id (PK)                 │
│ user_id (FK)            │
│ reading_date (UNIQUE)   │
│ personal_day_number     │
│ lucky_number            │
│ lucky_color             │
│ affirmation             │
│ generated_at            │
└─────────────────────────┘

┌─────────────────┐
│     users       │
└────────┬────────┘
         │ 1
         │
         │ 1:N
         ▼
┌─────────────────────────┐
│   ai_conversations      │
│─────────────────────────│
│ id (PK)                 │
│ user_id (FK)            │
│ started_at              │
│ message_count           │
└────────┬────────────────┘
         │ 1
         │
         │ 1:N
         ▼
┌─────────────────────────┐
│     ai_messages         │
│─────────────────────────│
│ id (PK)                 │
│ conversation_id (FK)    │
│ role (user/assistant)   │
│ content                 │
│ tokens_used             │
│ created_at              │
└─────────────────────────┘
```

#### 6.1.2 Indexing Strategy

**High-Query Fields (Add Indexes):**
```sql
-- users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- numerology_profiles table
CREATE INDEX idx_numerology_user_id ON numerology_profiles(user_id);

-- daily_readings table
CREATE INDEX idx_daily_readings_user_date ON daily_readings(user_id, reading_date DESC);
CREATE INDEX idx_daily_readings_date ON daily_readings(reading_date DESC);

-- ai_conversations table
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id, started_at DESC);

-- ai_messages table
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id, created_at ASC);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at DESC);

-- refresh_tokens table
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id, expires_at DESC);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- device_tokens table
CREATE INDEX idx_device_tokens_user ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_fcm ON device_tokens(fcm_token);
```

#### 6.1.3 Database Partitioning Strategy

**daily_readings table (Time-Series Data):**
```sql
-- Partition by month for efficient querying and archival
CREATE TABLE daily_readings (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    reading_date DATE NOT NULL,
    ...
) PARTITION BY RANGE (reading_date);

-- Create partitions
CREATE TABLE daily_readings_2025_01 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE daily_readings_2025_02 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Automate partition creation with Celery task
```

**ai_messages table (High Volume):**
```sql
-- Partition by conversation_id hash for even distribution
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES ai_conversations(id),
    ...
) PARTITION BY HASH (conversation_id);

-- Create 8 partitions
CREATE TABLE ai_messages_0 PARTITION OF ai_messages
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);
...
CREATE TABLE ai_messages_7 PARTITION OF ai_messages
    FOR VALUES WITH (MODULUS 8, REMAINDER 7);
```

### 6.2 Connection Pooling

#### 6.2.1 Django Database Configuration
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'CONN_MAX_AGE': 600,  # Connection pooling (10 minutes)
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000'  # 30 second query timeout
        }
    }
}

# Connection pool settings
CONN_HEALTH_CHECKS = True  # Django 4.1+
```

#### 6.2.2 PgBouncer Configuration (Production)
```ini
[databases]
numerai = host=postgres-primary port=5432 dbname=numerai

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
server_idle_timeout = 600
```

### 6.3 Database Replication

#### 6.3.1 Primary-Replica Setup
```
┌──────────────────┐
│  PostgreSQL      │
│  Primary         │
│  (Read/Write)    │
└────────┬─────────┘
         │
         │ Streaming Replication
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
┌────────▼─────────┐ ┌─────▼──────────┐ ┌────▼───────────┐
│  PostgreSQL      │ │  PostgreSQL    │ │  PostgreSQL    │
│  Replica 1       │ │  Replica 2     │ │  Replica 3     │
│  (Read Only)     │ │  (Read Only)   │ │  (Read Only)   │
└──────────────────┘ └────────────────┘ └────────────────┘
```

#### 6.3.2 Django Read Replica Configuration
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'numerai',
        'HOST': 'postgres-primary',
        ...
    },
    'replica': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'numerai',
        'HOST': 'postgres-replica',
        ...
    }
}

# Database router for read/write splitting
DATABASE_ROUTERS = ['numerai.routers.PrimaryReplicaRouter']
```

**Router Implementation:**
```python
class PrimaryReplicaRouter:
    def db_for_read(self, model, **hints):
        return 'replica'
    
    def db_for_write(self, model, **hints):
        return 'default'
```

### 6.4 Backup & Recovery

#### 6.4.1 Backup Strategy
- **Continuous Archiving:** WAL archiving to S3
- **Daily Full Backups:** pg_dump at 2 AM UTC
- **Retention:** 30 days of daily backups, 12 months of monthly backups
- **Backup Verification:** Weekly restore test to staging environment

#### 6.4.2 Backup Script
```bash
#!/bin/bash
# Daily backup script

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="numerai_backup_${TIMESTAMP}.sql.gz"

# Full database dump
pg_dump -h $DB_HOST -U $DB_USER -d numerai | gzip > /backups/${BACKUP_FILE}

# Upload to S3
aws s3 cp /backups/${BACKUP_FILE} s3://numerai-backups/daily/

# Clean up local backups older than 7 days
find /backups -name "*.sql.gz" -mtime +7 -delete

# Verify backup integrity
gunzip -t /backups/${BACKUP_FILE}
```

#### 6.4.3 Recovery Time Objective (RTO) & Recovery Point Objective (RPO)
- **RTO:** 1 hour (time to restore service)
- **RPO:** 15 minutes (maximum data loss)

---

## 7. Caching Strategy

### 7.1 Redis Architecture

#### 7.1.1 Redis Use Cases
1. **Session Storage:** User sessions, JWT blacklist
2. **Cache:** API responses, numerology calculations
3. **Task Queue:** Celery broker and result backend
4. **Rate Limiting:** Request counters per user/IP
5. **Pub/Sub:** Real-time notifications (future)

#### 7.1.2 Redis Configuration
```python
# Django settings
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/0',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True
            },
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
        },
        'KEY_PREFIX': 'numerai',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# Celery configuration
CELERY_BROKER_URL = 'redis://redis:6379/1'
CELERY_RESULT_BACKEND = 'redis://redis:6379/2'
```

### 7.2 Caching Patterns

#### 7.2.1 Cache-Aside Pattern (Lazy Loading)
```python
def get_birth_chart(user_id):
    cache_key = f'birth_chart:{user_id}'
    
    # Try cache first
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    # Cache miss - fetch from database
    birth_chart = NumerologyProfile.objects.get(user_id=user_id)
    
    # Store in cache (1 day TTL)
    cache.set(cache_key, birth_chart, timeout=86400)
    
    return birth_chart
```

#### 7.2.2 Write-Through Pattern
```python
def update_profile(user_id, data):
    # Update database
    profile = NumerologyProfile.objects.get(user_id=user_id)
    profile.update(**data)
    profile.save()
    
    # Update cache immediately
    cache_key = f'birth_chart:{user_id}'
    cache.set(cache_key, profile, timeout=86400)
    
    return profile
```

#### 7.2.3 Cache Invalidation Strategy
```python
# Invalidate on update
def invalidate_user_cache(user_id):
    patterns = [
        f'birth_chart:{user_id}',
        f'daily_reading:{user_id}:*',
        f'numerology_profile:{user_id}'
    ]
    
    for pattern in patterns:
        cache.delete_pattern(pattern)
```

### 7.3 Cache TTL Strategy

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Birth Chart | 24 hours | Rarely changes, recalculated on profile update |
| Daily Reading | 24 hours | Generated once per day |
| User Profile | 1 hour | Frequently accessed, occasionally updated |
| AI Conversation | 1 hour | Active conversations cached |
| Numerology Calculations | 7 days | Expensive to compute, rarely changes |
| API Rate Limits | 1 hour | Rolling window |

---

## 8. Security Architecture

### 8.1 Authentication & Authorization

#### 8.1.1 JWT Token Security
```python
# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}
```

#### 8.1.2 Password Security
```python
# Django password hashers (bcrypt preferred)
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
]

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
```

#### 8.1.3 OTP Security
```python
# OTP generation
import secrets

def generate_otp():
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

# OTP storage
OTP_EXPIRY_MINUTES = 10
MAX_OTP_ATTEMPTS = 3
OTP_RESEND_COOLDOWN = 60  # seconds
```

### 8.2 API Security

#### 8.2.1 CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    'https://numerai.app',
    'https://www.numerai.app',
    'http://localhost:3000',  # Development only
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

#### 8.2.2 Rate Limiting
```python
# Django REST Framework throttling
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10/minute',
        'user': '100/minute',
        'ai_chat': '20/hour',  # Custom throttle
    }
}

# Custom throttle for AI chat
class AIChatThrottle(UserRateThrottle):
    scope = 'ai_chat'
    
    def allow_request(self, request, view):
        if request.user.is_premium:
            return True  # No limit for premium users
        return super().allow_request(request, view)
```

#### 8.2.3 Input Validation
```python
# Django REST Framework serializers
from rest_framework import serializers

class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    phone = serializers.RegexField(
        regex=r'^\+?1?\d{9,15}$',
        required=False,
        error_messages={'invalid': 'Invalid phone number format'}
    )
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        style={'input_type': 'password'}
    )
    full_name = serializers.CharField(min_length=2, max_length=100)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered')
        return value
```

### 8.3 Data Encryption

#### 8.3.1 Encryption at Rest
```python
# PostgreSQL encryption
# Enable transparent data encryption (TDE) at database level

# Django field-level encryption for sensitive data
from django_cryptography.fields import encrypt

class User(models.Model):
    email = encrypt(models.EmailField())
    phone = encrypt(models.CharField(max_length=20))
    # Other fields...
```

#### 8.3.2 Encryption in Transit
```nginx
# Nginx SSL/TLS configuration
server {
    listen 443 ssl http2;
    server_name numerai.app;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/numerai.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/numerai.app/privkey.pem;
    
    # SSL protocols and ciphers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Other security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 8.4 Security Headers

```python
# Django security settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'

X_FRAME_OPTIONS = 'SAMEORIGIN'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
```

### 8.5 SQL Injection Prevention

```python
# Django ORM automatically prevents SQL injection
# ALWAYS use ORM, never raw SQL

# Safe (ORM)
users = User.objects.filter(email=user_input)

# Unsafe (raw SQL) - NEVER DO THIS
cursor.execute(f"SELECT * FROM users WHERE email = '{user_input}'")

# If raw SQL is necessary, use parameterized queries
cursor.execute("SELECT * FROM users WHERE email = %s", [user_input])
```

### 8.6 XSS Prevention

```python
# Django templates auto-escape by default
# {{ user_input }}  # Automatically escaped

# Next.js React also auto-escapes
# <div>{userInput}</div>  # Automatically escaped

# If you need to render HTML, sanitize it first
from bleach import clean

def sanitize_html(html):
    allowed_tags = ['p', 'br', 'strong', 'em', 'a']
    allowed_attributes = {'a': ['href']}
    return clean(html, tags=allowed_tags, attributes=allowed_attributes)
```

---

## 9. Deployment Architecture

### 9.1 Docker Containerization

#### 9.1.1 Multi-Stage Dockerfile (Backend)
```dockerfile
# Stage 1: Build
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2", "numerai.wsgi:application"]
```

#### 9.1.2 Dockerfile (Frontend)
```dockerfile
# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1000 appuser && adduser -D -u 1000 -G appuser appuser
USER appuser

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
```

### 9.2 Docker Compose (Local Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: numerai
      POSTGRES_USER: numerai
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U numerai"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://numerai:${DB_PASSWORD}@postgres:5432/numerai
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - DEBUG=True
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A numerai worker -l info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://numerai:${DB_PASSWORD}@postgres:5432/numerai
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
    depends_on:
      - postgres
      - redis

  celery_beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A numerai beat -l info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://numerai:${DB_PASSWORD}@postgres:5432/numerai
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    command: npm run dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

### 9.3 Production Deployment Options

#### 9.3.1 Option 1: AWS Deployment

```
┌─────────────────────────────────────────────────────────┐
│                    Route 53 (DNS)                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│               CloudFront (CDN)                           │
│  - Static assets caching                                │
│  - SSL/TLS termination                                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│          Application Load Balancer (ALB)                │
│  - Health checks                                        │
│  - SSL termination                                      │
│  - Request routing                                      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────────┐ ┌▼────────────┐
│   ECS Task   │ │  ECS Task   │ │  ECS Task   │
│  (Django)    │ │  (Django)   │ │  (Django)   │
│  Fargate     │ │  Fargate    │ │  Fargate    │
└──────────────┘ └─────────────┘ └─────────────┘
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────────┐ ┌▼────────────┐
│   RDS        │ │ ElastiCache │ │     S3      │
│ PostgreSQL   │ │   (Redis)   │ │  (Storage)  │
│ Multi-AZ     │ │  Cluster    │ │             │
└──────────────┘ └─────────────┘ └─────────────┘
```

**AWS Services:**
- **Compute:** ECS Fargate (serverless containers)
- **Database:** RDS PostgreSQL (Multi-AZ)
- **Cache:** ElastiCache Redis (Cluster mode)
- **Storage:** S3 (PDFs, images)
- **CDN:** CloudFront
- **Load Balancer:** Application Load Balancer
- **DNS:** Route 53
- **Monitoring:** CloudWatch
- **Secrets:** AWS Secrets Manager

**Estimated Monthly Cost (10K users):**
- ECS Fargate (3 tasks): $50
- RDS PostgreSQL (db.t3.medium): $80
- ElastiCache Redis (cache.t3.micro): $15
- S3 + CloudFront: $20
- ALB: $20
- **Total:** ~$185/month

#### 9.3.2 Option 2: DigitalOcean Deployment

```
┌─────────────────────────────────────────────────────────┐
│              DigitalOcean Spaces (CDN)                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│           DigitalOcean Load Balancer                     │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────────┐ ┌▼────────────┐
│   Droplet 1  │ │  Droplet 2  │ │  Droplet 3  │
│   (Django)   │ │  (Django)   │ │  (Django)   │
│   Docker     │ │  Docker     │ │  Docker     │
└──────────────┘ └─────────────┘ └─────────────┘
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────────┐ ┌▼────────────┐
│  Managed DB  │ │ Managed     │ │   Spaces    │
│ PostgreSQL   │ │  Redis      │ │  (Storage)  │
└──────────────┘ └─────────────┘ └─────────────┘
```

**DigitalOcean Services:**
- **Compute:** Droplets (3x $12/month = $36)
- **Database:** Managed PostgreSQL ($15/month)
- **Cache:** Managed Redis ($15/month)
- **Storage:** Spaces ($5/month)
- **Load Balancer:** ($12/month)
- **Total:** ~$83/month

#### 9.3.3 Option 3: Render.com Deployment

```
┌─────────────────────────────────────────────────────────┐
│                  Render.com Platform                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Web Service  │  │ Web Service  │  │ Web Service  │ │
│  │  (Django)    │  │  (Django)    │  │  (Django)    │ │
│  │  Auto-scale  │  │  Auto-scale  │  │  Auto-scale  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ PostgreSQL   │  │    Redis     │  │  Background  │ │
│  │  Database    │  │    Cache     │  │   Worker     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Render.com Services:**
- **Web Service:** $25/month (auto-scaling)
- **PostgreSQL:** $7/month (starter)
- **Redis:** $10/month
- **Background Worker:** $7/month
- **Total:** ~$49/month

**Recommendation:** Start with Render.com for simplicity, migrate to AWS/DigitalOcean as you scale.

### 9.4 CI/CD Pipeline

#### 9.4.1 GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: numerai_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Run linting
        run: |
          cd backend
          flake8 .
          black --check .
          isort --check .
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/numerai_test
          REDIS_URL: redis://localhost:6379/0
        run: |
          cd backend
          python manage.py test --parallel
      
      - name: Generate coverage report
        run: |
          cd backend
          coverage run --source='.' manage.py test
          coverage report
          coverage xml
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage.xml

  test-frontend:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run linting
        run: |
          cd frontend
          npm run lint
      
      - name: Run type checking
        run: |
          cd frontend
          npm run type-check
      
      - name: Run tests
        run: |
          cd frontend
          npm run test
      
      - name: Build
        run: |
          cd frontend
          npm run build

  build-and-push:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: numerai/backend:${{ github.sha }},numerai/backend:latest
      
      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: numerai/frontend:${{ github.sha }},numerai/frontend:latest

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - name: Deploy to staging
        run: |
          # Deploy to Render.com staging environment
          curl -X POST ${{ secrets.RENDER_STAGING_DEPLOY_HOOK }}

  deploy-production:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        run: |
          # Deploy to Render.com production environment
          curl -X POST ${{ secrets.RENDER_PRODUCTION_DEPLOY_HOOK }}
```

### 9.5 Environment Configuration

#### 9.5.1 Environment Variables

```bash
# .env.example (Development)
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://numerai:password@localhost:5432/numerai
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1

# OpenAI
OPENAI_API_KEY=sk-...

# Firebase
FIREBASE_PROJECT_ID=numerai-app
FIREBASE_CREDENTIALS_PATH=/path/to/credentials.json

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key

# AWS (for S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=numerai-files
AWS_S3_REGION_NAME=us-east-1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### 9.5.2 Secrets Management

**Development:** `.env` files (gitignored)
**Staging/Production:** 
- **AWS:** AWS Secrets Manager
- **DigitalOcean:** Environment variables in Droplet
- **Render.com:** Environment variables in dashboard

---

## 10. Monitoring & Logging

### 10.1 Logging Architecture

#### 10.1.1 Structured Logging Configuration

```python
# Django logging settings
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        },
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/numerai/django.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 10,
            'formatter': 'json',
        },
        'sentry': {
            'level': 'ERROR',
            'class': 'sentry_sdk.integrations.logging.EventHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file', 'sentry'],
            'level': 'INFO',
        },
        'numerai': {
            'handlers': ['console', 'file', 'sentry'],
            'level': 'DEBUG',
        },
        'celery': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
        },
    },
}
```

#### 10.1.2 Log Aggregation

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Django App  │  │ Celery Worker│  │    Nginx     │
│   Logs       │  │    Logs      │  │    Logs      │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                ┌────────▼────────┐
                │  Log Shipper    │
                │  (Fluentd)      │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │  Log Storage    │
                │  (CloudWatch/   │
                │   Papertrail)   │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │  Log Analysis   │
                │  (Kibana/       │
                │   CloudWatch    │
                │   Insights)     │
                └─────────────────┘
```

### 10.2 Monitoring Stack

#### 10.2.1 Sentry Integration

```python
# Django settings
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration

sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN'),
    integrations=[
        DjangoIntegration(),
        CeleryIntegration(),
    ],
    traces_sample_rate=0.1,  # 10% of transactions
    send_default_pii=False,  # Don't send PII
    environment=os.getenv('ENVIRONMENT', 'development'),
    release=os.getenv('GIT_COMMIT_SHA'),
)
```

#### 10.2.2 Application Metrics

```python
# Custom metrics with Prometheus
from prometheus_client import Counter, Histogram, Gauge

# Request metrics
request_count = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])

# Business metrics
user_registrations = Counter('user_registrations_total', 'Total user registrations')
daily_readings_generated = Counter('daily_readings_generated_total', 'Total daily readings generated')
ai_chat_messages = Counter('ai_chat_messages_total', 'Total AI chat messages', ['user_type'])

# System metrics
active_users = Gauge('active_users', 'Number of active users')
database_connections = Gauge('database_connections', 'Number of database connections')
```

### 10.3 Health Checks

#### 10.3.1 Django Health Check Endpoint

```python
# views.py
from django.http import JsonResponse
from django.db import connection
from django_redis import get_redis_connection

def health_check(request):
    health = {
        'status': 'healthy',
        'checks': {}
    }
    
    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        health['checks']['database'] = 'healthy'
    except Exception as e:
        health['checks']['database'] = f'unhealthy: {str(e)}'
        health['status'] = 'unhealthy'
    
    # Redis check
    try:
        redis_conn = get_redis_connection('default')
        redis_conn.ping()
        health['checks']['redis'] = 'healthy'
    except Exception as e:
        health['checks']['redis'] = f'unhealthy: {str(e)}'
        health['status'] = 'unhealthy'
    
    # Celery check
    try:
        from celery import current_app
        stats = current_app.control.inspect().stats()
        if stats:
            health['checks']['celery'] = 'healthy'
        else:
            health['checks']['celery'] = 'no workers'
            health['status'] = 'degraded'
    except Exception as e:
        health['checks']['celery'] = f'unhealthy: {str(e)}'
        health['status'] = 'unhealthy'
    
    status_code = 200 if health['status'] == 'healthy' else 503
    return JsonResponse(health, status=status_code)
```

### 10.4 Alerting

#### 10.4.1 Alert Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | >5% errors in 5 minutes | Critical | Page on-call engineer |
| Database Connection Pool Exhausted | >90% connections used | Critical | Page on-call engineer |
| API Response Time | P95 >2 seconds for 10 minutes | High | Notify team channel |
| Celery Queue Backlog | >1000 tasks pending | High | Notify team channel |
| Disk Space Low | <10% free space | High | Notify team channel |
| SSL Certificate Expiring | <30 days until expiry | Medium | Email team |
| Daily Reading Generation Failed | No readings generated by 8 AM | High | Notify team channel |

---

## 11. Scalability & Performance

### 11.1 Horizontal Scaling Strategy

#### 11.1.1 Stateless Application Design
- **No Session State in Application:** All session data in Redis
- **No Local File Storage:** All files in S3/Spaces
- **No In-Memory Caching:** All caching in Redis
- **Result:** Any request can be handled by any server

#### 11.1.2 Auto-Scaling Configuration

```yaml
# AWS ECS Auto Scaling
AutoScalingTarget:
  Type: AWS::ApplicationAutoScaling::ScalableTarget
  Properties:
    MaxCapacity: 10
    MinCapacity: 2
    ResourceId: service/numerai-cluster/numerai-service
    ScalableDimension: ecs:service:DesiredCount
    ServiceNamespace: ecs

ScalingPolicy:
  Type: AWS::ApplicationAutoScaling::ScalingPolicy
  Properties:
    PolicyName: cpu-scaling
    PolicyType: TargetTrackingScaling
    ScalingTargetId: !Ref AutoScalingTarget
    TargetTrackingScalingPolicyConfiguration:
      PredefinedMetricSpecification:
        PredefinedMetricType: ECSServiceAverageCPUUtilization
      TargetValue: 70.0
```

### 11.2 Database Performance Optimization

#### 11.2.1 Query Optimization Checklist
- [ ] Use `select_related()` for foreign keys (1:1, N:1)
- [ ] Use `prefetch_related()` for reverse foreign keys (1:N, M:N)
- [ ] Add indexes on frequently queried fields
- [ ] Use `only()` and `defer()` to limit fields
- [ ] Use `exists()` instead of `count()` for existence checks
- [ ] Use `bulk_create()` for batch inserts
- [ ] Use `update()` instead of `save()` for updates
- [ ] Avoid N+1 queries

#### 11.2.2 Example Optimizations

```python
# Bad: N+1 query
users = User.objects.all()
for user in users:
    print(user.numerology_profile.life_path_number)  # Extra query per user

# Good: Use select_related
users = User.objects.select_related('numerology_profile').all()
for user in users:
    print(user.numerology_profile.life_path_number)  # No extra queries

# Bad: Loading all fields
users = User.objects.all()

# Good: Load only needed fields
users = User.objects.only('id', 'email', 'full_name')

# Bad: Checking if any records exist
if User.objects.filter(email=email).count() > 0:
    pass

# Good: Use exists()
if User.objects.filter(email=email).exists():
    pass
```

### 11.3 Caching Strategy

#### 11.3.1 Cache Warming

```python
# Celery task to warm cache on deployment
@shared_task
def warm_cache():
    # Cache popular numerology interpretations
    for number in range(1, 10):
        cache_key = f'interpretation:life_path:{number}'
        interpretation = get_life_path_interpretation(number)
        cache.set(cache_key, interpretation, timeout=86400*7)  # 7 days
    
    # Cache common calculations
    # ...
```

### 11.4 CDN Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    CloudFlare CDN                        │
│                                                          │
│  Cache Rules:                                           │
│  - Static assets (JS, CSS, images): 1 year             │
│  - API responses (GET only): 5 minutes                 │
│  - HTML pages: 1 hour                                  │
│                                                          │
│  Edge Locations: Global (200+ cities)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 12. Disaster Recovery

### 12.1 Backup Strategy

#### 12.1.1 Database Backups
- **Frequency:** Daily full backups at 2 AM UTC
- **Retention:** 30 days daily, 12 months monthly
- **Storage:** AWS S3 with versioning enabled
- **Encryption:** AES-256 encryption at rest
- **Testing:** Weekly restore test to staging

#### 12.1.2 Backup Verification Script

```bash
#!/bin/bash
# Weekly backup verification

BACKUP_DATE=$(date +%Y%m%d)
STAGING_DB="numerai_staging"

# Download latest backup from S3
aws s3 cp s3://numerai-backups/daily/latest.sql.gz /tmp/backup.sql.gz

# Restore to staging database
gunzip -c /tmp/backup.sql.gz | psql -h staging-db -U postgres -d $STAGING_DB

# Run smoke tests
python manage.py test --tag=smoke

# Send notification
if [ $? -eq 0 ]; then
    echo "Backup verification successful" | mail -s "Backup OK" team@numerai.app
else
    echo "Backup verification FAILED" | mail -s "ALERT: Backup Failed" team@numerai.app
fi
```

### 12.2 Disaster Recovery Plan

#### 12.2.1 Recovery Time Objective (RTO): 1 hour
#### 12.2.2 Recovery Point Objective (RPO): 15 minutes

#### 12.2.3 DR Procedures

**Scenario 1: Database Failure**
1. Promote read replica to primary (5 minutes)
2. Update application connection strings (5 minutes)
3. Restart application servers (5 minutes)
4. Verify functionality (10 minutes)
5. **Total RTO:** 25 minutes

**Scenario 2: Complete Region Failure**
1. Restore latest backup to new region (20 minutes)
2. Deploy application to new region (15 minutes)
3. Update DNS to point to new region (5 minutes)
4. Verify functionality (10 minutes)
5. **Total RTO:** 50 minutes

**Scenario 3: Data Corruption**
1. Identify corruption timestamp (10 minutes)
2. Restore backup from before corruption (20 minutes)
3. Replay WAL logs to recover recent data (15 minutes)
4. Verify data integrity (10 minutes)
5. **Total RTO:** 55 minutes

### 12.3 Incident Response Plan

#### 12.3.1 Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| P0 | Complete outage, data loss | Immediate | Page on-call engineer |
| P1 | Major functionality broken | 15 minutes | Notify team lead |
| P2 | Minor functionality broken | 1 hour | Notify team |
| P3 | Cosmetic issue | Next business day | Create ticket |

#### 12.3.2 Incident Response Workflow

```
Incident Detected
       ↓
Assess Severity (P0-P3)
       ↓
P0/P1: Page On-Call Engineer
       ↓
Create Incident Channel (#incident-YYYY-MM-DD)
       ↓
Investigate & Diagnose
       ↓
Implement Fix
       ↓
Verify Resolution
       ↓
Post-Mortem (within 48 hours)
       ↓
Implement Preventive Measures
```

---

## 13. Conclusion

### 13.1 Architecture Summary

This architecture design provides:
- ✅ **Scalability:** Horizontal scaling from 1K to 100K+ users
- ✅ **Performance:** <2s API response time, 99.9% uptime
- ✅ **Security:** Enterprise-grade security with encryption, JWT, rate limiting
- ✅ **Maintainability:** Clean separation of concerns, comprehensive documentation
- ✅ **Cost-Efficiency:** Start at $49/month (Render.com), scale as needed
- ✅ **Observability:** Comprehensive logging, monitoring, alerting
- ✅ **Reliability:** Automated backups, disaster recovery, health checks

### 13.2 Next Steps

1. **Alex:** Implement Django backend based on this architecture
2. **Charlie:** Implement Next.js frontend
3. **David:** Set up Docker Compose and CI/CD pipeline
4. **Emma:** Create detailed API documentation from OpenAPI spec
5. **Mike:** Review and approve architecture

### 13.3 Architecture Review Schedule

- **Weekly:** Team architecture review meeting
- **Monthly:** Security audit and performance review
- **Quarterly:** Scalability assessment and capacity planning
- **Annually:** Complete architecture review and modernization

---

**Document Status:** Ready for Implementation  
**Last Updated:** November 10, 2025  
**Next Review:** After Phase 1 MVP completion  
**Approved By:** Pending Mike's approval

---

**END OF DOCUMENT**