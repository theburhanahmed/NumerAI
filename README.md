# NumerAI - AI-Powered Numerology Platform

NumerAI is an innovative numerology platform that combines ancient wisdom with modern AI technology to provide personalized insights and guidance.

## Prerequisites

- Python 3.9+
- PostgreSQL database
- Redis (for caching and task queue)
- Node.js 16+ (for frontend)

## Setup Instructions

### 1. Database Setup

You need to have PostgreSQL and Redis running locally. You can either:

**Option A: Install PostgreSQL and Redis locally**

For macOS:
```bash
# Install PostgreSQL
brew install postgresql
brew services start postgresql

# Install Redis
brew install redis
brew services start redis
```

**Option B: Use Docker (Recommended)**

Install Docker Desktop from https://www.docker.com/products/docker-desktop

Then run:
```bash
cd /Users/burhanahmed/Desktop/NumerAI
docker-compose up -d
```

### 2. Backend Setup

1. Create a virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (create a `.env` file in the backend directory):
```bash
DB_NAME=numerai
DB_USER=numerai
DB_PASSWORD=numerai
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key-here
DEBUG=True
```

4. Run database migrations:
```bash
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Start the development server:
```bash
python manage.py runserver
```

### 3. Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

## API Endpoints

- Backend: http://localhost:8000/api/v1/
- Frontend: http://localhost:3000/

## Key Features

### Authentication & User Management
- Email/Phone registration with OTP verification
- JWT-based authentication
- User profile management

### Numerology Engine
- Birth chart calculation with 9 core numbers
- Daily numerology readings
- Compatibility analysis for relationships
- Personalized remedies and tracking

### People & Reports
- Multi-person management system
- Report generation with customizable templates
- PDF export functionality

### AI Integration
- AI-powered numerology chat
- Context-aware responses based on user profiles

### Notifications
- In-app notification system
- Push notifications via Firebase Cloud Messaging
- Real-time alerts for reports, readings, and consultations

## Troubleshooting

### 404 Errors for Person Numerology Profile

If you're getting 404 errors when accessing person numerology profiles, ensure:

1. The database is running (PostgreSQL and Redis)
2. All migrations have been applied:
   ```bash
   cd backend
   python manage.py migrate
   ```
3. The person exists in the database and has an associated numerology profile
4. You're authenticated with a valid JWT token

### Database Connection Issues

If you're having trouble connecting to the database:

1. Verify PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Check your database credentials in the `.env` file

3. If using Docker, ensure containers are running:
   ```bash
   docker-compose ps
   ```

## Development

### Running Tests

```bash
cd backend
python manage.py test
```

### Code Structure

- `backend/` - Django backend with REST API
- `frontend/` - Next.js frontend application