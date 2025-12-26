# Backup & Disaster Recovery Guide

## Overview

This document outlines the backup and disaster recovery procedures for NumerAI platform.

## Backup Strategy

### 1. Database Backups

**PostgreSQL Backups:**
- **Frequency**: Daily automated backups
- **Retention**: 30 days daily, 12 weeks weekly, 12 months monthly
- **Method**: `pg_dump` with compression
- **Storage**: S3 or equivalent object storage
- **Encryption**: AES-256 encryption at rest

**Backup Script:**
```bash
#!/bin/bash
# Daily database backup
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="numerai_backup_${DATE}.sql.gz"
pg_dump -U numerai numerai | gzip > /backups/${BACKUP_FILE}
aws s3 cp /backups/${BACKUP_FILE} s3://numerai-backups/database/${BACKUP_FILE}
# Cleanup local files older than 7 days
find /backups -name "*.sql.gz" -mtime +7 -delete
```

**Verification:**
- Weekly restore tests to verify backup integrity
- Automated backup verification script

### 2. Media Files Backup

**User Uploads:**
- **Frequency**: Real-time replication to backup storage
- **Storage**: S3 with versioning enabled
- **Retention**: 90 days
- **Cross-region**: Replication to secondary region

### 3. Configuration Backups

**Environment Variables:**
- Stored in secure vault (AWS Secrets Manager, HashiCorp Vault)
- Version controlled (encrypted)
- Regular exports for disaster recovery

**Code & Configuration:**
- Git repository (primary backup)
- Regular snapshots
- Tagged releases

## Disaster Recovery Plan

### Recovery Time Objectives (RTO)

- **Critical Systems**: 1 hour
- **Non-Critical Systems**: 4 hours
- **Full System**: 24 hours

### Recovery Point Objectives (RPO)

- **Database**: 1 hour (maximum data loss)
- **User Files**: 15 minutes
- **Configuration**: Real-time

### Disaster Scenarios

#### 1. Database Failure

**Scenario**: Primary database becomes unavailable

**Recovery Steps:**
1. Identify failure type (hardware, corruption, network)
2. Switch to standby database (if available)
3. Restore from latest backup if no standby
4. Verify data integrity
5. Update application configuration
6. Monitor for issues

**Estimated Recovery Time**: 30 minutes - 2 hours

#### 2. Application Server Failure

**Scenario**: Application servers become unavailable

**Recovery Steps:**
1. Identify affected servers
2. Scale up replacement servers
3. Verify health checks
4. Monitor performance
5. Investigate root cause

**Estimated Recovery Time**: 15 minutes - 1 hour

#### 3. Data Center Outage

**Scenario**: Entire data center becomes unavailable

**Recovery Steps:**
1. Activate disaster recovery site
2. Restore database from backup
3. Deploy application to DR environment
4. Update DNS to point to DR site
5. Verify all services
6. Monitor closely

**Estimated Recovery Time**: 2-4 hours

#### 4. Data Corruption

**Scenario**: Database corruption detected

**Recovery Steps:**
1. Stop application to prevent further corruption
2. Identify corruption scope
3. Restore from last known good backup
4. Replay transaction logs (if available)
5. Verify data integrity
6. Resume application

**Estimated Recovery Time**: 1-4 hours

#### 5. Security Breach

**Scenario**: Unauthorized access detected

**Recovery Steps:**
1. Isolate affected systems
2. Assess breach scope
3. Revoke compromised credentials
4. Restore from clean backup (if data modified)
5. Patch vulnerabilities
6. Notify affected users (if required)
7. Document incident

**Estimated Recovery Time**: 2-6 hours

## Backup Testing

### Regular Testing Schedule

- **Weekly**: Verify backup completion
- **Monthly**: Test restore procedure
- **Quarterly**: Full disaster recovery drill
- **Annually**: Comprehensive DR test

### Test Procedures

1. **Backup Verification**
   - Check backup file existence
   - Verify backup file size
   - Test backup file integrity

2. **Restore Testing**
   - Restore to test environment
   - Verify data completeness
   - Test application functionality
   - Document any issues

3. **DR Drill**
   - Simulate disaster scenario
   - Execute recovery procedures
   - Measure recovery time
   - Document lessons learned

## Backup Storage

### Primary Storage
- **Location**: AWS S3 (or equivalent)
- **Region**: Primary region
- **Encryption**: AES-256
- **Access**: IAM roles only

### Secondary Storage
- **Location**: Different region
- **Replication**: Automated daily
- **Purpose**: Disaster recovery

### Offline Storage
- **Location**: Secure offsite facility
- **Frequency**: Monthly
- **Retention**: 7 years (compliance)

## Monitoring & Alerts

### Backup Monitoring

- **Success/Failure**: Alert on backup failures
- **Size Verification**: Alert if backup size changes significantly
- **Completion Time**: Alert if backup takes too long

### Recovery Monitoring

- **RTO Tracking**: Monitor actual recovery times
- **RPO Tracking**: Monitor data loss windows
- **Test Results**: Track backup test outcomes

## Documentation

### Runbooks

Maintain runbooks for:
- Database restore procedures
- Application deployment
- DNS failover
- Service recovery

### Contact Information

- **On-Call Engineer**: Rotating schedule
- **Database Administrator**: Contact info
- **Infrastructure Team**: Contact info
- **Management**: Escalation path

## Compliance

### Data Retention

- **User Data**: Per GDPR requirements
- **Financial Data**: 7 years
- **Logs**: 90 days (anonymized after 30 days)
- **Backups**: Per retention policy

### Audit Trail

- All backup operations logged
- All restore operations logged
- Access to backups logged
- Regular audit reviews

## Automation

### Automated Backups

- **Database**: Cron job or scheduled task
- **Configuration**: Git hooks
- **Monitoring**: Automated health checks

### Automated Testing

- **Backup Verification**: Automated scripts
- **Restore Testing**: Scheduled in test environment
- **Alert Testing**: Monthly alert verification

## Recovery Procedures

### Database Restore

```bash
# Stop application
systemctl stop numerai-backend

# Restore database
gunzip < backup_file.sql.gz | psql -U numerai numerai

# Verify restore
psql -U numerai -c "SELECT COUNT(*) FROM users;" numerai

# Start application
systemctl start numerai-backend
```

### Application Restore

```bash
# Clone repository
git clone https://github.com/org/numerai.git

# Install dependencies
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Configure environment
cp .env.example .env
# Edit .env with production values

# Run migrations
cd backend && python manage.py migrate

# Build frontend
cd ../frontend && npm run build

# Deploy
# (Follow deployment guide)
```

## Maintenance Windows

- **Backup Testing**: Weekly, Sunday 2 AM
- **DR Drills**: Quarterly, scheduled in advance
- **Backup Cleanup**: Daily, after backup completion

## Support

For backup and recovery issues:
- **Email**: devops@numerobuddy.com
- **Slack**: #devops-alerts
- **On-Call**: Check PagerDuty schedule

