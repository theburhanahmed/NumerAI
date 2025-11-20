# Troubleshooting Guide for NumerAI

This guide helps you resolve common issues when setting up and running the NumerAI application.

## Common Issues and Solutions

### 1. 404 Errors for Person Numerology Profile

**Error Message:**
```
GET https://numerai-backend.onrender.com/api/v1/people/{id}/profile/ 404 (Not Found)
```

**Causes and Solutions:**

#### A. Database Services Not Running
The application requires PostgreSQL and Redis to be running.

**Solution:**
1. Check if services are running:
   ```bash
   # On macOS with Homebrew
   brew services list | grep -E "(postgresql|redis)"
   
   # Start services if needed
   brew services start postgresql
   brew services start redis
   ```

2. Or use Docker:
   ```bash
   cd /Users/burhanahmed/Desktop/NumerAI
   docker-compose up -d
   ```

#### B. Database Migrations Not Applied
The required database tables may not exist.

**Solution:**
```bash
cd backend
source venv/bin/activate  # If using virtual environment
python manage.py migrate
```

#### C. Person or Profile Doesn't Exist
The person record or their numerology profile may not exist in the database.

**Solution:**
1. Create a person record through the API or admin interface
2. Calculate their numerology profile:
   ```bash
   python manage.py shell
   ```
   Then in the Django shell:
   ```python
   from core.models import Person, PersonNumerologyProfile
   from core.numerology import NumerologyCalculator
   
   # Find the person
   person = Person.objects.get(id='your-person-id')
   
   # Calculate their profile
   calculator = NumerologyCalculator()
   numbers = calculator.calculate_all(person.name, person.birth_date)
   
   # Create the profile
   profile = PersonNumerologyProfile.objects.create(
       person=person,
       **numbers,
       calculation_system='pythagorean'
   )
   ```

### 2. Database Connection Issues

**Error Message:**
```
connection to server at "localhost" (::1), port 5432 failed: Connection refused
```

**Solution:**
1. Ensure PostgreSQL is running:
   ```bash
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

2. Check if PostgreSQL is accepting connections:
   ```bash
   pg_isready
   ```

3. Verify database credentials in `.env` file:
   ```bash
   DB_NAME=numerai
   DB_USER=numerai
   DB_PASSWORD=numerai
   DB_HOST=localhost
   DB_PORT=5432
   ```

### 3. Redis Connection Issues

**Error Message:**
```
Error connecting to Redis
```

**Solution:**
1. Ensure Redis is running:
   ```bash
   # macOS
   brew services start redis
   
   # Linux
   sudo systemctl start redis
   ```

2. Check if Redis is accepting connections:
   ```bash
   redis-cli ping
   # Should return "PONG"
   ```

3. Verify Redis configuration in `.env` file:
   ```bash
   REDIS_URL=redis://localhost:6379/0
   CELERY_BROKER_URL=redis://localhost:6379/1
   CELERY_RESULT_BACKEND=redis://localhost:6379/2
   ```

### 4. Missing Environment Variables

**Error Message:**
```
KeyError: 'SECRET_KEY' or similar
```

**Solution:**
Create a `.env` file in the backend directory with required variables:
```bash
DB_NAME=numerai
DB_USER=numerai
DB_PASSWORD=numerai
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key-here
DEBUG=True
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

### 5. Virtual Environment Issues

**Error Message:**
```
ModuleNotFoundError: No module named 'django'
```

**Solution:**
1. Create and activate virtual environment:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Quick Start Commands

### Setup Environment
```bash
# Run the setup script
./setup-local.sh

# Or manually:
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Start Services
```bash
# Check service status
./check-services.sh

# Start database services (macOS)
brew services start postgresql redis

# Or use Docker
docker-compose up -d
```

### Run Application
```bash
# Backend
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver

# Frontend (in another terminal)
cd frontend
npm run dev
```

## Debugging Steps

1. **Check if all services are running:**
   ```bash
   ./check-services.sh
   ```

2. **Verify database connection:**
   ```bash
   cd backend
   python manage.py dbshell
   ```

3. **Check migrations:**
   ```bash
   python manage.py showmigrations
   ```

4. **Run tests to verify functionality:**
   ```bash
   python manage.py test
   ```

## Useful Django Management Commands

```bash
# Create superuser
python manage.py createsuperuser

# Access Django shell
python manage.py shell

# Access database shell
python manage.py dbshell

# Collect static files
python manage.py collectstatic

# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Check for issues
python manage.py check
```

## Need Help?

If you're still experiencing issues:

1. Check the logs:
   ```bash
   # Backend logs
   tail -f backend/logs/numerai.log
   
   # Docker logs (if using Docker)
   docker-compose logs -f
   ```

2. Verify your setup with the check script:
   ```bash
   ./check-services.sh
   ```

3. Contact support with:
   - Error messages
   - Steps you've taken
   - Output of `./check-services.sh`