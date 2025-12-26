# Developer Onboarding Guide

Welcome to the NumerAI development team! This guide will help you get started.

## Prerequisites

- Python 3.10+
- Node.js 22.x
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose (optional but recommended)
- Git

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/numerai.git
cd numerai
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your local settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Edit .env.local with your local settings

# Run development server
npm run dev
```

### 4. Docker Setup (Alternative)

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Hotfix branches

### Commit Messages

Follow conventional commits:
- `feat: Add Lo Shu Grid visualization`
- `fix: Resolve OTP verification issue`
- `docs: Update API documentation`
- `refactor: Clean up debug code`
- `test: Add integration tests for payments`

### Code Style

#### Backend (Python)

- Follow PEP 8
- Use Black for formatting: `black .`
- Type hints for all functions
- Docstrings for all classes and functions

#### Frontend (TypeScript)

- ESLint configuration
- Prettier for formatting: `npm run format`
- TypeScript strict mode
- Component documentation

### Testing

```bash
# Backend tests
cd backend
pytest

# With coverage
pytest --cov=. --cov-report=html

# Frontend tests
cd frontend
npm test

# E2E tests
cd e2e
npm test
```

## Project Structure

```
numerai/
├── backend/
│   ├── accounts/          # User authentication & profiles
│   ├── numerology/       # Numerology calculations
│   ├── ai_chat/          # AI chat functionality
│   ├── consultations/    # Expert consultations
│   ├── payments/         # Stripe integration
│   ├── reports/          # Report generation
│   ├── numerai/          # Django project settings
│   └── tests/            # Test suite
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities & API clients
│   └── public/           # Static assets
├── e2e/                  # End-to-end tests
└── docs/                 # Documentation
```

## Key Technologies

### Backend
- Django 4.2
- Django REST Framework
- Celery (background tasks)
- Redis (caching)
- PostgreSQL
- Stripe (payments)
- OpenAI (AI chat)
- Firebase (push notifications)

### Frontend
- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Zustand (state management)
- React Hook Form + Zod (forms)
- Axios (API client)

## Common Tasks

### Adding a New API Endpoint

1. Create view in appropriate app
2. Add URL route
3. Create serializer
4. Add tests
5. Update API documentation

### Adding a New Frontend Page

1. Create page in `src/app/`
2. Add API client method
3. Create components
4. Add navigation link
5. Test responsiveness

### Database Changes

1. Create migration: `python manage.py makemigrations`
2. Review migration file
3. Test migration: `python manage.py migrate`
4. Commit migration file

## Debugging

### Backend

```bash
# Django shell
python manage.py shell

# Debug logging
# Set LOG_LEVEL=DEBUG in .env

# Django Debug Toolbar (development)
# Already configured in development settings
```

### Frontend

```bash
# React DevTools
# Install browser extension

# Next.js debugging
# Use browser DevTools
# Check Network tab for API calls
```

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## Getting Help

- **Slack**: #numerai-dev
- **Email**: dev@numerobuddy.com
- **Documentation**: Check `/docs` folder
- **Code Review**: Tag team members in PRs

## Next Steps

1. Read the codebase review: `docs/CODEBASE_REVIEW_2025.md`
2. Set up your development environment
3. Run the test suite
4. Pick a small issue to start with
5. Submit your first PR!

Happy coding! 🚀

