# Deployment Fix for Index Rename Issue

## Problem Description

During deployment, the application was failing with the following error:

```
psycopg2.errors.UndefinedTable: relation "compatibilit_user_id_3f8b4a_idx" does not exist
```

This error occurred when Django tried to rename indexes that were created in migration `0002_numerai_features.py` but didn't exist in the production database.

## Root Cause

The issue happens when:
1. The production database doesn't have the indexes with the expected names
2. Django's automatic migration generation tries to rename indexes that don't exist
3. The deployment fails because of the missing indexes

## Solution

We've implemented a two-part solution:

### 1. Safe Index Rename Migration (0004_fix_index_naming_issue.py)

This migration safely handles index renaming by:
- Checking if indexes exist before attempting to rename them
- Using try/catch blocks to prevent deployment failures
- Providing detailed logging for debugging purposes
- Handling both forward and reverse migrations

### 2. New Models Migration (0005_create_new_models.py)

This migration creates the new models required for multi-person numerology reporting:
- GeneratedReport
- Person
- PersonNumerologyProfile
- ReportTemplate

## Deployment Instructions

1. Apply the migrations in order:
   ```bash
   python manage.py migrate core 0004_fix_index_naming_issue
   python manage.py migrate core 0005_create_new_models
   ```

2. Or apply all migrations at once:
   ```bash
   python manage.py migrate
   ```

## Why This Solution Works

1. **Graceful Handling**: The migration checks for index existence before renaming
2. **Error Resilience**: Uses try/catch blocks to prevent deployment failures
3. **Backward Compatibility**: Works whether indexes exist or not
4. **Clear Separation**: Separates index fixing from model creation for clarity

## Testing

The solution has been tested to ensure:
- It works when indexes exist
- It works when indexes don't exist
- It handles reverse migrations properly
- New models are created correctly