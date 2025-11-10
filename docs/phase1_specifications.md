# NumerAI Phase 1 MVP Specifications
**Version:** 1.0  
**Date:** November 10, 2025  
**Duration:** 8 Weeks (Months 1-3)  
**Status:** Ready for Development

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Feature Prioritization Matrix](#feature-prioritization-matrix)
3. [Detailed User Stories & Acceptance Criteria](#detailed-user-stories--acceptance-criteria)
4. [API Endpoint Specifications](#api-endpoint-specifications)
5. [Database Schema Requirements](#database-schema-requirements)
6. [Third-Party Integration Requirements](#third-party-integration-requirements)
7. [Success Metrics for MVP](#success-metrics-for-mvp)
8. [Technical Architecture Overview](#technical-architecture-overview)
9. [Development Timeline](#development-timeline)

---

## 1. Executive Summary

### 1.1 MVP Scope
Phase 1 focuses on delivering core numerology functionality that provides immediate value to users:
- Secure user authentication and profile management
- Accurate numerology calculations (9 core numbers)
- Visual birth chart display and PDF reports
- AI-powered numerology chatbot for personalized guidance
- Daily numerology readings with push notifications
- Foundation for future premium features

### 1.2 Technology Stack
- **Backend:** Django 5 + Django REST Framework + Celery + Redis
- **Frontend:** Next.js 14 (React 18) + TypeScript + TailwindCSS
- **Database:** PostgreSQL 14+
- **Cache:** Redis 7+
- **AI:** OpenAI GPT-4 API
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Payments:** Stripe (basic setup for future)
- **Deployment:** Docker + Docker Compose

### 1.3 Target Users
- **Primary:** Spiritual Seekers (28-40 years, seeking life direction)
- **Secondary:** Young Explorers (20-28 years, self-discovery)
- **MVP Goal:** 2,000 registered users, 100 paid users by end of Phase 1

---

## 2. Feature Prioritization Matrix

### 2.1 Must-Have Features (P0) - Critical for MVP Launch

| Feature | Priority | Complexity | Business Value | User Impact | Week |
|---------|----------|------------|----------------|-------------|------|
| User Registration & Login | P0 | Medium | Critical | High | 1-2 |
| Email/Phone OTP Verification | P0 | Medium | Critical | High | 1-2 |
| Profile Setup (DOB, Name) | P0 | Low | Critical | High | 3-4 |
| Core Numerology Calculations | P0 | High | Critical | Critical | 3-4 |
| Birth Chart Visualization | P0 | Medium | High | High | 3-4 |
| Daily Reading Generation | P0 | Medium | High | High | 5-6 |
| Push Notifications | P0 | Medium | High | High | 7-8 |
| AI Chatbot (Basic) | P0 | High | High | High | 5-6 |

### 2.2 Should-Have Features (P1) - Important but not blocking

| Feature | Priority | Complexity | Business Value | User Impact | Week |
|---------|----------|------------|----------------|-------------|------|
| Social Login (Google/Apple) | P1 | Medium | Medium | Medium | 2 |
| Birth Chart PDF Export | P1 | Medium | Medium | Medium | 7-8 |
| Reading History | P1 | Low | Medium | Medium | 6 |
| Conversation History | P1 | Low | Medium | Medium | 6 |
| Profile Picture Upload | P1 | Low | Low | Low | 4 |

### 2.3 Nice-to-Have Features (P2) - Defer to Phase 2

| Feature | Priority | Complexity | Business Value | User Impact |
|---------|----------|------------|----------------|-------------|
| Multi-language Support | P2 | High | High | Medium |
| Advanced Numerology Features | P2 | High | Medium | Medium |
| Compatibility Analysis | P2 | Medium | High | Medium |
| Weekly/Monthly Predictions | P2 | Medium | High | Medium |

---

## 3. Detailed User Stories & Acceptance Criteria

### 3.1 User Authentication & Profile Management

#### User Story 3.1.1: User Registration
**As a** new user  
**I want to** create an account using email or phone  
**So that** I can access personalized numerology insights

**Acceptance Criteria:**
- [ ] User can register with email + password
- [ ] User can register with phone number + password
- [ ] Password must meet security requirements (min 8 chars, mixed case, numbers)
- [ ] Email/phone must be unique in the system
- [ ] OTP is sent to email/phone for verification
- [ ] User receives welcome email after successful registration
- [ ] Registration form validates all inputs client-side
- [ ] Clear error messages for validation failures
- [ ] Registration completes within 3 seconds (excluding OTP delivery)

**API Endpoints:**
- `POST /api/v1/auth/register`

**Database Tables:**
- `users` (id, email, phone, password_hash, is_verified, created_at)

---

#### User Story 3.1.2: Email/Phone Verification
**As a** registered user  
**I want to** verify my email/phone with OTP  
**So that** I can activate my account

**Acceptance Criteria:**
- [ ] 6-digit OTP is generated and sent to user's email/phone
- [ ] OTP is valid for 10 minutes
- [ ] User can request OTP resend (max 3 times per hour)
- [ ] OTP verification succeeds with correct code
- [ ] Account is marked as verified after successful OTP entry
- [ ] User is automatically logged in after verification
- [ ] Clear error message for expired or invalid OTP

**API Endpoints:**
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/resend-otp`

**Database Tables:**
- `otp_codes` (id, user_id, code, expires_at, attempts, created_at)

---

#### User Story 3.1.3: User Login
**As a** registered user  
**I want to** log in with my credentials  
**So that** I can access my numerology profile

**Acceptance Criteria:**
- [ ] User can login with email/phone + password
- [ ] JWT access token and refresh token are returned on successful login
- [ ] Access token expires after 1 hour
- [ ] Refresh token expires after 30 days
- [ ] Failed login attempts are tracked (max 5 attempts, then 15-min lockout)
- [ ] Clear error messages for invalid credentials
- [ ] "Remember me" option extends refresh token to 90 days
- [ ] Login completes within 2 seconds

**API Endpoints:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/logout`

**Database Tables:**
- `users` (last_login, failed_login_attempts, locked_until)
- `refresh_tokens` (id, user_id, token, expires_at, created_at)

---

#### User Story 3.1.4: Profile Setup
**As a** newly registered user  
**I want to** complete my profile with birth date and name  
**So that** my numerology calculations are accurate

**Acceptance Criteria:**
- [ ] User is prompted to complete profile after first login
- [ ] Date of birth is required (format: YYYY-MM-DD)
- [ ] Full name is required (min 2 characters)
- [ ] Gender is optional (male/female/other/prefer_not_to_say)
- [ ] Timezone is auto-detected and editable
- [ ] Location is optional
- [ ] Profile completion triggers numerology calculation
- [ ] User is redirected to birth chart after profile completion
- [ ] Profile data is validated before submission

**API Endpoints:**
- `GET /api/v1/users/profile`
- `PUT /api/v1/users/profile`
- `PATCH /api/v1/users/profile`

**Database Tables:**
- `users` (full_name, date_of_birth, gender, timezone, location, profile_completed_at)

---

### 3.2 Core Numerology Calculations Engine

#### User Story 3.2.1: Automatic Numerology Calculation
**As a** user who completed my profile  
**I want** my numerology numbers calculated automatically  
**So that** I can view my birth chart immediately

**Acceptance Criteria:**
- [ ] Calculation is triggered automatically after profile completion
- [ ] All 9 core numbers are calculated: Life Path, Destiny, Soul Urge, Personality, Attitude, Maturity, Balance, Personal Year, Personal Month
- [ ] Calculations use Pythagorean system by default
- [ ] Calculation results are stored in database
- [ ] Calculation completes within 2 seconds
- [ ] User is notified when calculation is complete
- [ ] Calculation can be re-triggered if user updates DOB/name

**Calculation Logic:**
- **Life Path Number:** Sum of birth date digits reduced to single digit (or master number 11, 22, 33)
- **Destiny Number:** Sum of full name letter values
- **Soul Urge Number:** Sum of vowels in full name
- **Personality Number:** Sum of consonants in full name
- **Attitude Number:** Sum of birth day + birth month
- **Maturity Number:** Life Path + Destiny Number
- **Balance Number:** Sum of initials
- **Personal Year Number:** Birth day + birth month + current year
- **Personal Month Number:** Personal Year + current month

**API Endpoints:**
- `POST /api/v1/numerology/calculate`
- `GET /api/v1/numerology/profile`

**Database Tables:**
- `numerology_profiles` (id, user_id, life_path_number, destiny_number, soul_urge_number, personality_number, attitude_number, maturity_number, balance_number, personal_year_number, personal_month_number, calculation_system, calculated_at)

---

### 3.3 Birth Chart & Profile Report

#### User Story 3.3.1: Birth Chart Visualization
**As a** user  
**I want to** view my complete birth chart in a visual format  
**So that** I can easily understand my numerology profile

**Acceptance Criteria:**
- [ ] Birth chart displays all 9 core numbers
- [ ] Life Path Number is prominently displayed (large, centered)
- [ ] Numbers are color-coded by category (Life numbers: purple, Compatibility: gold, Challenge: blue)
- [ ] Chart includes brief description for each number
- [ ] Chart is responsive and works on mobile/tablet/desktop
- [ ] Chart loads within 2 seconds
- [ ] User can click on each number to see full interpretation
- [ ] Chart includes calculation date and system used

**API Endpoints:**
- `GET /api/v1/numerology/birth-chart`

---

### 3.4 AI Numerology Chatbot

#### User Story 3.4.1: Ask AI Numerologist
**As a** user  
**I want to** ask questions about my numerology  
**So that** I can get personalized guidance

**Acceptance Criteria:**
- [ ] User can access chat interface from navigation
- [ ] User can type questions in natural language
- [ ] AI responds within 10 seconds
- [ ] AI responses reference user's specific numbers
- [ ] AI responses are contextually relevant
- [ ] AI provides 2-3 follow-up question suggestions
- [ ] Chat interface shows typing indicator while AI is responding
- [ ] User can send up to 20 messages per hour (free tier)
- [ ] Clear error message if rate limit is exceeded

**AI System Prompt:**
```
You are an expert numerologist with 20+ years of experience. You are helping {user_name} understand their numerology profile.

User's Numerology Profile:
- Life Path Number: {life_path}
- Destiny Number: {destiny}
- Soul Urge Number: {soul_urge}
- Personality Number: {personality}
- Personal Year Number: {personal_year}

Guidelines:
1. Always reference the user's specific numbers in your responses
2. Provide actionable advice, not just descriptions
3. Be empathetic and supportive
4. Keep responses concise (150-200 words)
5. Suggest 2-3 follow-up questions at the end
6. Never make medical, legal, or financial advice
7. If unsure, acknowledge limitations and suggest consulting a human expert
```

**API Endpoints:**
- `POST /api/v1/ai/chat`
- `GET /api/v1/ai/conversations`

**Database Tables:**
- `ai_conversations` (id, user_id, started_at, last_message_at, message_count)
- `ai_messages` (id, conversation_id, role, content, tokens_used, created_at)

---

### 3.5 Daily Numerology Reading

#### User Story 3.5.1: Daily Reading Generation
**As a** user  
**I want to** receive a personalized daily reading every morning  
**So that** I can start my day with numerological guidance

**Acceptance Criteria:**
- [ ] Daily reading is generated automatically at 7:00 AM user's timezone
- [ ] Reading is based on user's Personal Day Number
- [ ] Reading includes: Personal Day Number, lucky number, lucky color, auspicious time, activity recommendation, warning, affirmation, actionable tip
- [ ] Reading is stored in database for future reference
- [ ] User receives push notification when reading is ready
- [ ] Reading is accessible from home page
- [ ] Reading generation completes within 5 seconds

**API Endpoints:**
- `GET /api/v1/numerology/daily-reading`
- `GET /api/v1/numerology/daily-reading/{date}`

**Database Tables:**
- `daily_readings` (id, user_id, reading_date, personal_day_number, lucky_number, lucky_color, auspicious_time, activity_recommendation, warning, affirmation, actionable_tip, generated_at)

**Celery Task:**
- `generate_daily_readings` - Runs at 7:00 AM for all users

---

### 3.6 Push Notifications & Reminders

#### User Story 3.6.1: Daily Reading Notification
**As a** user  
**I want to** receive a push notification when my daily reading is ready  
**So that** I don't miss my daily guidance

**Acceptance Criteria:**
- [ ] Notification is sent at 7:00 AM user's timezone
- [ ] Notification title: "Your Daily Numerology Reading is Ready 🔮"
- [ ] Notification body: "Today is a {Personal Day Number} day. Tap to see your lucky number and guidance."
- [ ] Notification includes custom sound
- [ ] Tapping notification opens app to daily reading page
- [ ] Notification is sent only if user has enabled notifications
- [ ] Notification delivery completes within 30 seconds

**API Endpoints:**
- `POST /api/v1/notifications/send`
- `POST /api/v1/notifications/devices`

**Database Tables:**
- `notification_settings` (id, user_id, daily_reading_enabled, time_preference, timezone)
- `device_tokens` (id, user_id, fcm_token, device_type, registered_at)

---

## 4. API Endpoint Specifications

### 4.1 Authentication Endpoints

#### POST /api/v1/auth/register
**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+919876543210",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "user_id": "uuid-here",
  "email": "user@example.com",
  "message": "Registration successful. Please verify your email/phone."
}
```

---

#### POST /api/v1/auth/verify-otp
**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "Verification successful",
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token"
}
```

---

#### POST /api/v1/auth/login
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "user": {
    "user_id": "uuid-here",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

---

### 4.2 User Profile Endpoints

#### GET /api/v1/users/profile
**Headers:** `Authorization: Bearer {access_token}`

**Response (200 OK):**
```json
{
  "user_id": "uuid-here",
  "email": "user@example.com",
  "full_name": "John Doe",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "timezone": "Asia/Kolkata",
  "profile_completed": true
}
```

---

#### PUT /api/v1/users/profile
**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "full_name": "John Doe",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "timezone": "Asia/Kolkata"
}
```

---

### 4.3 Numerology Endpoints

#### POST /api/v1/numerology/calculate
**Headers:** `Authorization: Bearer {access_token}`

**Response (200 OK):**
```json
{
  "profile": {
    "life_path_number": 7,
    "destiny_number": 3,
    "soul_urge_number": 5,
    "personal_year_number": 9,
    "calculated_at": "2025-01-01T00:00:00Z"
  }
}
```

---

#### GET /api/v1/numerology/birth-chart
**Headers:** `Authorization: Bearer {access_token}`

**Response (200 OK):**
```json
{
  "birth_chart": {
    "user_name": "John Doe",
    "numbers": [
      {
        "type": "life_path",
        "value": 7,
        "interpretation": "Your Life Path Number 7 indicates..."
      }
    ]
  }
}
```

---

#### GET /api/v1/numerology/daily-reading
**Headers:** `Authorization: Bearer {access_token}`

**Response (200 OK):**
```json
{
  "reading": {
    "reading_date": "2025-01-15",
    "personal_day_number": 5,
    "lucky_number": 3,
    "lucky_color": "Yellow",
    "affirmation": "I embrace change and welcome new opportunities."
  }
}
```

---

### 4.4 AI Chat Endpoints

#### POST /api/v1/ai/chat
**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "message": "What does my Life Path Number 7 mean for my career?"
}
```

**Response (200 OK):**
```json
{
  "conversation_id": "uuid-here",
  "message": {
    "role": "assistant",
    "content": "Your Life Path Number 7 indicates..."
  },
  "suggested_followups": [
    "What are the best career paths for Life Path 7?"
  ]
}
```

---

### 4.5 Notification Endpoints

#### POST /api/v1/notifications/devices
**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "fcm_token": "firebase-token",
  "device_type": "ios"
}
```

---

## 5. Database Schema Requirements

### 5.1 Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### numerology_profiles
```sql
CREATE TABLE numerology_profiles (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES users(id),
    life_path_number INTEGER NOT NULL,
    destiny_number INTEGER NOT NULL,
    soul_urge_number INTEGER NOT NULL,
    personality_number INTEGER NOT NULL,
    attitude_number INTEGER NOT NULL,
    maturity_number INTEGER NOT NULL,
    balance_number INTEGER NOT NULL,
    personal_year_number INTEGER NOT NULL,
    personal_month_number INTEGER NOT NULL,
    calculated_at TIMESTAMP NOT NULL
);
```

---

#### daily_readings
```sql
CREATE TABLE daily_readings (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    reading_date DATE NOT NULL,
    personal_day_number INTEGER NOT NULL,
    lucky_number INTEGER NOT NULL,
    lucky_color VARCHAR(50) NOT NULL,
    auspicious_time VARCHAR(50) NOT NULL,
    activity_recommendation TEXT NOT NULL,
    warning TEXT NOT NULL,
    affirmation TEXT NOT NULL,
    actionable_tip TEXT NOT NULL,
    generated_at TIMESTAMP NOT NULL,
    UNIQUE(user_id, reading_date)
);
```

---

#### ai_conversations
```sql
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    message_count INTEGER DEFAULT 0
);
```

---

#### ai_messages
```sql
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES ai_conversations(id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Third-Party Integration Requirements

### 6.1 OpenAI GPT-4 API

**Purpose:** AI-powered numerology chatbot

**Configuration:**
```python
OPENAI_API_KEY = "sk-..."
OPENAI_MODEL = "gpt-4"
OPENAI_MAX_TOKENS = 500
OPENAI_TEMPERATURE = 0.7
```

**Rate Limits:**
- Free tier: 20 messages/hour
- Premium tier: Unlimited

**Error Handling:**
- Timeout: 30 seconds
- Retry: 3 attempts
- Fallback: Template responses

---

### 6.2 Firebase Cloud Messaging (FCM)

**Purpose:** Push notifications

**Configuration:**
```python
FIREBASE_PROJECT_ID = "numerai-app"
FIREBASE_CREDENTIALS_PATH = "/path/to/credentials.json"
```

**Notification Payload:**
```json
{
  "notification": {
    "title": "Your Daily Reading is Ready 🔮",
    "body": "Today is a {number} day..."
  },
  "data": {
    "type": "daily_reading",
    "reading_id": "uuid"
  }
}
```

---

### 6.3 Stripe (Basic Setup)

**Purpose:** Payment processing (Phase 2)

**Phase 1 Scope:**
- Install Stripe SDK
- Create webhook endpoint skeleton
- Test in sandbox mode
- **No active payments in Phase 1**

---

### 6.4 Email Service (SendGrid)

**Purpose:** Transactional emails

**Email Templates:**
1. OTP Verification
2. Welcome Email
3. Daily Reading (optional)

---

## 7. Success Metrics for MVP

### 7.1 Launch Criteria

**Technical:**
- [ ] All P0 features implemented
- [ ] API response time < 2 seconds
- [ ] Zero critical bugs
- [ ] Security audit passed
- [ ] Load testing passed (1000 concurrent users)

**Business:**
- [ ] 100 beta users tested
- [ ] Average rating: 4.0+/5.0
- [ ] 7-day retention: 40%+

---

### 7.2 Week 8 Metrics (End of Phase 1)

**User Acquisition:**
- Target: 2,000 registered users
- Source: App Store, social media, content marketing

**Engagement:**
- DAU: 600+
- MAU: 1,500+
- Average session length: 8+ minutes
- Daily reading view rate: 70%+
- AI chat usage: 40%+ of users

**Retention:**
- Day 1: 45%+
- Day 7: 30%+
- Day 30: 20%+

**Monetization (Soft Launch):**
- Paid users: 100 (5% conversion)
- MRR: ₹15,000+

**Quality:**
- App Store rating: 4.2+/5.0
- Crash rate: < 1%
- API availability: 99.9%

---

## 8. Technical Architecture Overview

### 8.1 System Architecture

```
┌─────────────────────────────────────┐
│         Client Layer                 │
│  ┌──────────┬──────────────────┐   │
│  │ Next.js  │  Flutter (future)│   │
│  └────┬─────┴──────────┬───────┘   │
└───────┼────────────────┼───────────┘
        │                │
        └────────┬───────┘
                 │
        ┌────────▼────────┐
        │  API Gateway    │
        │    (Nginx)      │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   Django REST   │
        │   Framework     │
        └────────┬────────┘
                 │
        ┌────────┼────────┐
        │        │         │
    ┌───▼───┐ ┌─▼──┐ ┌───▼────┐
    │PostgreSQL Redis│ Celery │
    └───────┘ └────┘ └───┬────┘
                          │
                ┌─────────┼─────────┐
                │         │         │
            ┌───▼───┐ ┌──▼──┐ ┌────▼────┐
            │OpenAI │ │ FCM │ │   S3    │
            └───────┘ └─────┘ └─────────┘
```

---

### 8.2 Security Requirements

**Authentication:**
- JWT tokens (1-hour access, 30-day refresh)
- bcrypt password hashing
- OTP: 6-digit, 10-minute expiration
- Rate limiting: 5 failed attempts → 15-min lockout

**Data Protection:**
- HTTPS/TLS 1.3
- Database encryption at rest
- PII compliance (GDPR, Indian data privacy)

**API Security:**
- Rate limiting: 100 requests/minute
- CORS whitelist
- Input validation
- SQL injection prevention

---

## 9. Development Timeline

### 9.1 Week-by-Week Breakdown

#### Week 1-2: Setup & Authentication
- Django project setup
- PostgreSQL + Redis configuration
- Next.js frontend setup
- Docker Compose
- User registration/login
- OTP verification
- JWT authentication

#### Week 3-4: Profile & Numerology
- Profile management
- Numerology calculation engine
- Birth chart API
- Birth chart UI
- Number interpretations

#### Week 5-6: AI & Daily Readings
- OpenAI integration
- AI chat endpoint
- Daily reading generation
- Celery tasks
- Reading UI

#### Week 7-8: Notifications & Polish
- Firebase FCM setup
- Push notifications
- PDF export
- Bug fixes
- Performance optimization
- Production deployment

---

### 9.2 Critical Path

**Must Complete in Order:**
1. Authentication → Profile
2. Profile → Numerology calculations
3. Calculations → Birth chart
4. Birth chart → Daily readings
5. Daily readings → Notifications

**Can Be Parallel:**
- AI chatbot (alongside daily readings)
- PDF export (after birth chart)

---

## 10. Next Steps

### 10.1 Immediate Actions

1. **Mike:** Review and approve specifications
2. **Bob:** Create system design document
3. **Alex:** Set up Django backend
4. **Charlie:** Initialize Next.js frontend
5. **David:** Configure Docker and CI/CD

### 10.2 Week 1 Sprint Goal

**Goal:** Complete project setup and basic authentication

**User Stories:**
1. Development environment setup
2. User registration with email/phone
3. OTP verification
4. User login

**Definition of Done:**
- Code reviewed
- Tests passing
- Deployed to staging
- QA approved

---

## Document Status

**Created:** November 10, 2025  
**Status:** Ready for Review  
**Next Review:** After Bob completes architecture design  
**Approved By:** Pending Mike's approval

---

**END OF DOCUMENT**