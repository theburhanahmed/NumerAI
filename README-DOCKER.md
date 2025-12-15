# Docker Setup for Local Development

This guide explains how to run all NumerAI services locally using Docker Desktop.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose 2.0+ (included with Docker Desktop)

**Note**: This guide uses `docker compose` (with space) which is the command for Docker Compose v2. If you're using an older version, you may need to use `docker-compose` (with hyphen) instead.

## Quick Start

### 1. Start All Services

```bash
# Start all services in detached mode
docker compose up -d

# Or start with logs visible
docker compose up
```

### 2. Initialize Database

```bash
# Run migrations
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser
```

### 3. Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1/
- **Django Admin**: http://localhost:8000/admin/
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Services

The docker-compose setup includes:

1. **postgres** - PostgreSQL 14 database
2. **redis** - Redis cache and message broker
3. **backend** - Django REST API
4. **celery-worker** - Background task processor
5. **celery-beat** - Scheduled task scheduler
6. **frontend** - Next.js frontend application

## Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f celery-worker
```

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (clears database)
docker compose down -v
```

### Restart a Service

```bash
# Restart backend
docker compose restart backend

# Restart frontend
docker compose restart frontend
```

### Execute Commands

```bash
# Django shell
docker compose exec backend python manage.py shell

# Django migrations
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Run tests
docker compose exec backend python manage.py test

# Frontend shell
docker compose exec frontend sh
```

### Rebuild Services

```bash
# Rebuild all services
docker compose build

# Rebuild specific service
docker compose build backend

# Rebuild and restart
docker compose up -d --build
```

## Development Mode

For hot-reload development, use the dev override:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This will:
- Run Django development server with auto-reload
- Run Next.js dev server with hot-reload
- Mount volumes for live code changes

## Environment Variables

Default environment variables are set in `docker-compose.yml`. To override:

1. Create `.env` file in project root
2. Add your variables:
   ```
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgresql://numerai:numerai@postgres:5432/numerai
   ```

## Troubleshooting

### Port Already in Use

If ports 3000, 8000, 5432, or 6379 are already in use:

1. Stop the conflicting service
2. Or modify ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "8001:8000"  # Use 8001 instead of 8000
   ```

### Database Connection Issues

```bash
# Check if postgres is running
docker compose ps postgres

# Check postgres logs
docker compose logs postgres

# Restart postgres
docker compose restart postgres
```

### Clear Everything and Start Fresh

```bash
# Stop and remove all containers, networks, and volumes
docker compose down -v

# Remove all images
docker compose down --rmi all

# Start fresh
docker compose up -d --build
```

### Check Service Health

```bash
# Check all services status
docker compose ps

# Check backend health
curl http://localhost:8000/api/v1/health/

# Check frontend
curl http://localhost:3000
```

## Production Build

For production-like local testing:

```bash
# Build production images
docker compose -f docker-compose.yml build

# Run with production settings
docker compose up
```

## Database Management

### Access PostgreSQL

```bash
# Using docker exec
docker compose exec postgres psql -U numerai -d numerai

# Or using psql client
psql -h localhost -U numerai -d numerai
```

### Backup Database

```bash
docker compose exec postgres pg_dump -U numerai numerai > backup.sql
```

### Restore Database

```bash
docker compose exec -T postgres psql -U numerai numerai < backup.sql
```

## Redis Management

### Access Redis CLI

```bash
docker compose exec redis redis-cli
```

### Clear Redis Cache

```bash
docker compose exec redis redis-cli FLUSHALL
```

## Monitoring

### Resource Usage

```bash
# View resource usage
docker stats

# View specific service
docker stats numerai-backend
```

### Service Logs

```bash
# Follow logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100
```

## Cleanup

### Remove Unused Resources

```bash
# Remove stopped containers
docker compose rm

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune
```

## Next Steps

1. Set up environment variables for your local development
2. Run migrations: `docker compose exec backend python manage.py migrate`
3. Create superuser: `docker compose exec backend python manage.py createsuperuser`
4. Access the application at http://localhost:3000

