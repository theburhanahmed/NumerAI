# CI/CD Pipeline Guide

## Overview

The NumerAI project uses GitHub Actions for continuous integration and deployment. The pipeline includes automated testing, security scanning, dependency updates, and deployment automation.

## Pipeline Stages

### 1. Linting & Code Quality

**Backend:**
- Black (code formatter check)
- isort (import sorter check)
- Flake8 (linter)
- Bandit (security scanner)

**Frontend:**
- ESLint (code quality)
- npm audit (security scan)

### 2. Testing

**Backend:**
- Unit tests with pytest
- Integration tests
- Coverage requirement: 80%+
- Codecov integration

**Frontend:**
- TypeScript type checking
- Build verification

### 3. Security Scanning

- **Trivy**: Container and filesystem vulnerability scanning
- **Safety**: Python dependency vulnerability check
- **npm audit**: Node.js dependency vulnerability check
- **Bandit**: Python security linter

### 4. Dependency Management

- **Dependabot**: Automated dependency update PRs
  - Weekly schedule (Mondays at 9 AM)
  - Separate configs for Python, npm, and GitHub Actions
  - Limits on PRs to prevent overload

### 5. Performance Testing

- Load testing with Locust (when configured)
- Performance regression detection
- Response time monitoring

### 6. Deployment

**Staging:**
- Automatic deployment on `develop` branch
- Health checks after deployment

**Production:**
- Canary deployment strategy:
  1. Deploy to 10% of traffic
  2. Monitor for 5 minutes
  3. If healthy, deploy to 50%
  4. Monitor for 5 minutes
  5. If healthy, deploy to 100%
- Automatic rollback on failure
- Health checks after deployment

## Workflow Files

- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline
- `.github/workflows/dependency-audit.yml` - Weekly dependency security audit
- `.github/dependabot.yml` - Automated dependency updates

## Manual Triggers

Workflows can be manually triggered via GitHub Actions UI:
1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"

## Environment Variables

Required secrets in GitHub:
- `NEXT_PUBLIC_API_URL` - Frontend API URL
- Deployment service credentials (Render, AWS, etc.)

## Best Practices

1. **Never skip tests**: All PRs must pass tests
2. **Review security scans**: Address high/critical vulnerabilities immediately
3. **Monitor deployments**: Watch for errors after deployment
4. **Use feature flags**: For gradual feature rollouts
5. **Test locally first**: Run tests before pushing

## Troubleshooting

### Build Failures

1. Check test output in Actions tab
2. Review coverage reports
3. Fix linting errors locally
4. Run `black .` and `isort .` before committing

### Security Scan Failures

1. Review vulnerability reports
2. Update dependencies if safe
3. Add exceptions if false positives
4. Document security decisions

### Deployment Failures

1. Check deployment logs
2. Verify environment variables
3. Test health endpoints
4. Review rollback procedures

## Future Enhancements

- [ ] Performance regression testing
- [ ] Automated canary analysis
- [ ] Blue-green deployments
- [ ] Database migration testing
- [ ] E2E test automation

