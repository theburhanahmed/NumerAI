# Monitoring & Alerting Guide

## Overview

NumerAI uses comprehensive monitoring and alerting to ensure system reliability and performance.

## Monitoring Stack

### 1. Error Tracking

**Sentry Integration:**
- Backend: Django integration with Celery support
- Frontend: Next.js integration with React error boundaries
- Performance monitoring: Transaction tracing
- Release tracking: Automatic release detection

**Configuration:**
- `SENTRY_DSN`: Sentry project DSN
- `SENTRY_ENVIRONMENT`: Environment name (development/staging/production)
- `SENTRY_TRACES_SAMPLE_RATE`: Performance monitoring sample rate (0.1 = 10%)

### 2. Application Performance Monitoring (APM)

**Metrics Tracked:**
- API response times
- Database query performance
- Cache hit rates
- Celery task execution times
- Frontend page load times
- Web Vitals (LCP, FID, CLS)

**Tools:**
- Sentry Performance Monitoring
- Custom metrics via Prometheus (optional)

### 3. Infrastructure Monitoring

**Uptime Monitoring:**
- UptimeRobot or Pingdom
- Health check endpoint: `/api/v1/health/`
- Monitoring intervals: 1-5 minutes
- Alert channels: Email, Slack, PagerDuty

**Server Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

### 4. Database Monitoring

**PostgreSQL:**
- Query performance
- Connection pool usage
- Slow query logging
- Replication lag (if applicable)

**Redis:**
- Memory usage
- Hit/miss rates
- Connection count
- Command latency

### 5. Business Metrics

**User Metrics:**
- Daily/Monthly Active Users (DAU/MAU)
- User retention rates
- Conversion rates
- Feature adoption

**Revenue Metrics:**
- Subscription conversions
- Revenue per user
- Churn rate
- Payment success rate

## Alerting Rules

### Critical Alerts (Immediate Response)

1. **Service Down**
   - Condition: Health check fails for 2+ minutes
   - Action: Page on-call engineer
   - Channels: PagerDuty, SMS

2. **High Error Rate**
   - Condition: Error rate > 5% for 5 minutes
   - Action: Alert team, investigate
   - Channels: Slack, Email

3. **Database Issues**
   - Condition: Query time > 1s, connection pool exhausted
   - Action: Alert DBA, investigate
   - Channels: Slack, Email

### Warning Alerts (Monitor)

1. **Performance Degradation**
   - Condition: P95 response time > 2s for 10 minutes
   - Action: Monitor, investigate if persists
   - Channels: Slack

2. **High Resource Usage**
   - Condition: CPU > 80% or Memory > 85%
   - Action: Monitor, scale if needed
   - Channels: Slack

3. **Low Cache Hit Rate**
   - Condition: Cache hit rate < 70%
   - Action: Review cache strategy
   - Channels: Slack

## Dashboards

### 1. System Health Dashboard

**Metrics:**
- Uptime percentage
- Error rate
- Response times (P50, P95, P99)
- Request rate
- Active users

### 2. Business Metrics Dashboard

**Metrics:**
- DAU/MAU
- New signups
- Subscription conversions
- Revenue
- Feature usage

### 3. Infrastructure Dashboard

**Metrics:**
- Server resources (CPU, Memory, Disk)
- Database performance
- Cache performance
- Queue depth
- Task execution times

## Health Check Endpoint

```
GET /api/v1/health/
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "celery": "healthy"
  },
  "version": "1.0.0"
}
```

## Logging

### Structured Logging

All logs use structured format:
```json
{
  "timestamp": "2024-01-15T10:00:00Z",
  "level": "INFO",
  "logger": "accounts.views",
  "message": "User logged in",
  "user_id": "uuid",
  "ip_address": "1.2.3.4",
  "request_id": "req-uuid"
}
```

### Log Levels

- **ERROR**: Errors requiring attention
- **WARNING**: Potential issues
- **INFO**: Important events
- **DEBUG**: Detailed debugging (development only)

### Log Aggregation

- **Development**: Console output
- **Production**: Centralized logging (CloudWatch, Datadog, or ELK)

## Monitoring Best Practices

1. **Set Appropriate Thresholds**: Avoid alert fatigue
2. **Use SLOs**: Define Service Level Objectives
3. **Regular Reviews**: Review alerts weekly
4. **Document Runbooks**: Create playbooks for common issues
5. **Test Alerts**: Verify alert delivery monthly

## Tools & Services

- **Sentry**: Error tracking and APM
- **UptimeRobot**: Uptime monitoring
- **Prometheus**: Metrics collection (optional)
- **Grafana**: Visualization (optional)
- **CloudWatch**: AWS logging (if on AWS)
- **Datadog**: Full-stack monitoring (optional)

## Status Page

Public status page available at:
- `https://status.numerobuddy.com`

Shows:
- System status
- Incident history
- Scheduled maintenance
- Performance metrics

