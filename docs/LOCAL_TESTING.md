# Local Testing Setup Guide

This guide explains how to run NumerAI services locally for manual testing. The frontend runs locally (not in Docker), while all backend services run in Docker containers.

## Prerequisites

- Docker Desktop installed and running
- Node.js 18+ installed
- npm installed

## Quick Start

### Start All Services

```bash
./start-local-testing.sh
```

This script will:
1. Start PostgreSQL, Redis, Backend, Celery Worker, and Celery Beat in Docker
2. Wait for all services to be ready
3. Install frontend dependencies if needed
4. Start the frontend locally on port 3000

### Stop All Services

Press `Ctrl+C` in the terminal where frontend is running, then:

```bash
./stop-local-testing.sh
```

## Service URLs

Once started, services will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Health Check**: http://localhost:8000/api/v1/health/
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Manual Service Management

### Start Docker Services Only

```bash
docker compose -f docker-compose.local.yml up -d
```

### Stop Docker Services

```bash
docker compose -f docker-compose.local.yml down
```

### View Service Logs

```bash
# All services
docker compose -f docker-compose.local.yml logs -f

# Specific service
docker compose -f docker-compose.local.yml logs -f backend
docker compose -f docker-compose.local.yml logs -f celery-worker
docker compose -f docker-compose.local.yml logs -f celery-beat
```

### Check Service Status

```bash
docker compose -f docker-compose.local.yml ps
```

### Restart a Specific Service

```bash
docker compose -f docker-compose.local.yml restart backend
```

## Frontend Configuration

The frontend is configured to connect to the backend at `http://localhost:8000/api/v1` by default. This is set in:

- `frontend/next.config.mjs` - Default API URL
- Environment variable `NEXT_PUBLIC_API_URL` (can be overridden)

To run frontend manually:

```bash
cd frontend
export NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
```

## Database Management

### Access PostgreSQL

```bash
docker exec -it numerai-postgres psql -U numerai -d numerai
```

### Run Migrations

```bash
docker exec -it numerai-backend python manage.py migrate
```

### Create Superuser

```bash
docker exec -it numerai-backend python manage.py createsuperuser
```

### Access Django Shell

```bash
docker exec -it numerai-backend python manage.py shell
```

## Redis Management

### Access Redis CLI

```bash
docker exec -it numerai-redis redis-cli
```

### Monitor Redis Commands

```bash
docker exec -it numerai-redis redis-cli MONITOR
```

## Troubleshooting

### Backend Not Starting

1. Check backend logs:
   ```bash
   docker logs numerai-backend
   ```

2. Verify database connection:
   ```bash
   docker exec -it numerai-backend python manage.py check --database default
   ```

3. Check if migrations are needed:
   ```bash
   docker exec -it numerai-backend python manage.py showmigrations
   ```

### Frontend Can't Connect to Backend

1. Verify backend is running:
   ```bash
   curl http://localhost:8000/api/v1/health/
   ```

2. Check CORS settings in backend logs

3. Verify `NEXT_PUBLIC_API_URL` is set correctly

### Port Already in Use

If a port is already in use, you can:

1. Stop the conflicting service
2. Or modify ports in `docker-compose.local.yml`

### Clean Start (Remove All Data)

```bash
# Stop and remove containers, networks, and volumes
docker compose -f docker-compose.local.yml down -v

# Then start again
./start-local-testing.sh
```

## Service Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Local)                │
│      http://localhost:3000              │
└──────────────┬──────────────────────────┘
               │ HTTP
               │
┌──────────────▼──────────────────────────┐
│      Backend (Docker)                   │
│      http://localhost:8000              │
│  - Django REST API                      │
│  - WebSocket Server                    │
└──────┬──────────────┬───────────────────┘
       │              │
       │              │
┌──────▼──────┐  ┌────▼──────────────┐
│ PostgreSQL  │  │      Redis        │
│  :5432      │  │      :6379        │
└─────────────┘  └───────────────────┘
                       │
                       │
            ┌──────────┴──────────┐
            │                     │
    ┌───────▼──────┐    ┌─────────▼────────┐
    │ Celery       │    │  Celery Beat     │
    │ Worker       │    │  (Scheduler)     │
    └──────────────┘    └──────────────────┘
```

## Environment Variables

### Backend (in docker-compose.local.yml)

- `DJANGO_SETTINGS_MODULE=numerai.settings.development`
- `DEBUG=True`
- `DATABASE_URL=postgresql://numerai:numerai@postgres:5432/numerai`
- `REDIS_URL=redis://redis:6379/0`
- `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`

### Frontend

- `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` (default)

## Testing

### Test Backend API

```bash
# Health check
curl http://localhost:8000/api/v1/health/

# List endpoints (if available)
curl http://localhost:8000/api/v1/
```

### Test Database Connection

```bash
docker exec -it numerai-backend python manage.py dbshell
```

### Test Redis Connection

```bash
docker exec -it numerai-redis redis-cli ping
```

## Notes

- All Docker services restart automatically unless stopped manually
- Frontend runs in development mode with hot reload
- Backend runs with DEBUG=True for detailed error messages
- Database and Redis data persist in Docker volumes
- To reset everything, use `docker compose -f docker-compose.local.yml down -v`

