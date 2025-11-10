# NumerAI - AI-Powered Numerology Platform

Sprint 1 (Weeks 1-2): Project Setup & Authentication

## Overview

NumerAI is an AI-powered numerology platform that provides personalized numerology insights, daily readings, and AI-powered guidance. This repository contains the complete Sprint 1 implementation including authentication system, user management, and foundational infrastructure.

## Technology Stack

### Backend
- **Framework**: Django 5.1.3
- **API**: Django REST Framework 3.15.2
- **Database**: PostgreSQL 14+
- **Cache**: Redis 7+
- **Task Queue**: Celery 5.4.0
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Documentation**: drf-spectacular (OpenAPI 3.0)

### Frontend
- **Framework**: Next.js 14.2.23
- **Language**: TypeScript 5
- **UI Library**: React 18
- **Styling**: TailwindCSS 3.4.1
- **Components**: Shadcn-ui
- **State Management**: Zustand
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions

## Features (Sprint 1)

✅ **User Authentication**
- Email/phone registration
- OTP verification
- JWT token authentication
- Password reset
- Social login (Google/Apple) ready

✅ **User Profile Management**
- Profile creation and updates
- User preferences
- Profile completion tracking

✅ **Infrastructure**
- PostgreSQL database with optimized schema
- Redis caching layer
- Celery task queue
- Docker containerization
- CI/CD pipeline

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd workspace
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services**
```bash
docker-compose up --build
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Django Backend (port 8000)
- Celery Worker
- Celery Beat
- Next.js Frontend (port 3000)

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/schema/swagger-ui/
- Admin Panel: http://localhost:8000/admin/

### Development Setup

#### Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

#### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - Register new user
- `POST /api/v1/auth/verify-otp/` - Verify OTP
- `POST /api/v1/auth/resend-otp/` - Resend OTP
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/logout/` - User logout
- `POST /api/v1/auth/refresh-token/` - Refresh JWT token
- `POST /api/v1/auth/password-reset/` - Request password reset
- `POST /api/v1/auth/password-reset/confirm/` - Confirm password reset

### User Profile
- `GET /api/v1/users/profile/` - Get user profile
- `PUT /api/v1/users/profile/` - Update user profile
- `PATCH /api/v1/users/profile/` - Partial update user profile

### Notifications
- `POST /api/v1/notifications/devices/` - Register device token

### Health Check
- `GET /api/v1/health/` - API health status

## Database Schema

### Core Tables
- `users` - User accounts and authentication
- `user_profiles` - Extended user information
- `otp_codes` - OTP verification codes
- `refresh_tokens` - JWT refresh tokens
- `device_tokens` - FCM device tokens for push notifications

See `/workspace/docs/architecture/database_schema.sql` for complete schema.

## Project Structure

```
workspace/
├── backend/
│   ├── numerai/              # Django project
│   │   ├── settings/         # Settings (base, dev, prod)
│   │   ├── celery.py         # Celery configuration
│   │   ├── urls.py           # URL routing
│   │   └── wsgi.py           # WSGI application
│   ├── core/                 # Core app
│   │   ├── models.py         # Database models
│   │   ├── serializers.py    # API serializers
│   │   ├── views.py          # API views
│   │   ├── urls.py           # App URLs
│   │   ├── admin.py          # Admin configuration
│   │   ├── tasks.py          # Celery tasks
│   │   └── utils.py          # Utility functions
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Backend Docker image
│   └── manage.py             # Django management
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   │   ├── (auth)/       # Auth pages
│   │   │   ├── dashboard/    # Dashboard
│   │   │   └── page.tsx      # Home page
│   │   ├── components/       # React components
│   │   │   └── ui/           # UI components
│   │   ├── contexts/         # React contexts
│   │   │   └── auth-context.tsx
│   │   ├── lib/              # Utilities
│   │   │   ├── api-client.ts # API client
│   │   │   └── utils.ts      # Helper functions
│   │   └── types/            # TypeScript types
│   ├── package.json          # npm dependencies
│   ├── Dockerfile            # Frontend Docker image
│   └── next.config.mjs       # Next.js configuration
├── docs/                     # Documentation
│   ├── architecture/         # Architecture docs
│   └── phase1_specifications.md
├── docker-compose.yml        # Docker Compose config
├── .github/
│   └── workflows/
│       └── ci-cd.yml         # CI/CD pipeline
└── README.md                 # This file
```

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Deployment

### Production Environment Variables

Create a `.env` file with production values:

```env
# Django
DEBUG=False
SECRET_KEY=<your-secret-key>
ALLOWED_HOSTS=your-domain.com

# Database
DB_NAME=numerai
DB_USER=numerai
DB_PASSWORD=<secure-password>
DB_HOST=<db-host>
DB_PORT=5432

# Redis
REDIS_URL=redis://<redis-host>:6379/0

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<sendgrid-api-key>

# Frontend
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
```

### Deploy with Docker

```bash
docker-compose -f docker-compose.yml up -d
```

## Security

- JWT tokens with 15-minute access and 7-day refresh
- Password hashing with Django's default (PBKDF2)
- OTP verification with 10-minute expiration
- Rate limiting on authentication endpoints
- CORS configuration for frontend
- HTTPS/TLS in production

## Monitoring

- Health check endpoint: `/api/v1/health/`
- Django admin panel: `/admin/`
- API documentation: `/api/schema/swagger-ui/`

## Next Steps (Sprint 2)

Sprint 2 will implement:
- Numerology calculation engine
- Birth chart visualization
- Daily readings generation
- AI chatbot integration
- Push notifications

## Support

For issues and questions:
- GitHub Issues: <repository-url>/issues
- Documentation: `/workspace/docs/`

## License

Proprietary - All rights reserved

## Team

- **Product Manager**: Mike
- **Architect**: Bob
- **Backend Engineer**: Alex
- **Frontend Engineer**: Charlie
- **DevOps Engineer**: David
- **QA Engineer**: Emma

---

**Sprint 1 Status**: ✅ Complete
**Last Updated**: November 10, 2025