# NumerAI Repository Conventions

This document outlines the coding standards, branch naming, commit message format, and PR guidelines for the NumerAI project.

## Branch Naming

Follow the pattern: `TYPE/TICKET-short-description`

### Types:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### Examples:
```
feature/PAY-001-stripe-subscription-integration
bugfix/AUTH-005-google-oauth-error
hotfix/PAY-010-webhook-signature-validation
refactor/NOTIF-003-notification-service-cleanup
```

## Commit Messages

Follow the format: `TYPE(scope): short summary`

### Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### Scope (optional):
- `payments` - Payment-related changes
- `auth` - Authentication changes
- `notifications` - Notification system
- `api` - API changes
- `frontend` - Frontend changes
- `backend` - Backend changes

### Examples:
```
feat(payments): add Stripe subscription service
fix(auth): resolve Google OAuth token validation issue
docs(api): update payment webhook documentation
refactor(notifications): simplify notification center component
test(payments): add unit tests for subscription creation
```

### Commit Message Body (optional):
For complex changes, add a detailed description:
```
feat(payments): add Stripe subscription service

- Implement create_subscription service function
- Add webhook handler for subscription events
- Create Subscription, Payment, and BillingHistory models
- Add API endpoints for subscription management

Closes #PAY-001
```

## Pull Request Guidelines

### PR Title
Follow the same format as commit messages: `TYPE(scope): short summary`

### PR Description
Use the PR template and include:
1. **Description** - What changes are being made and why
2. **Type of Change** - Bug fix, feature, etc.
3. **Ticket Reference** - Link to related ticket/issue
4. **Changes Made** - List of key changes
5. **Testing** - Test coverage and results
6. **Checklist** - All items must be checked before merge
7. **Environment Variables** - Any new env vars needed
8. **Database Changes** - Migration details
9. **Screenshots/Demo** - Visual proof if applicable

### PR Requirements
- [ ] All tests pass
- [ ] Code coverage > 50% for new code
- [ ] Documentation updated
- [ ] Migration files included (if DB changes)
- [ ] Environment variables documented
- [ ] Staging tested (if applicable)
- [ ] Reviewed by at least 2 engineers (1 backend, 1 frontend)

### Review Process
1. Create PR with proper title and description
2. Tag reviewers: `@backend-reviewer @frontend-reviewer`
3. Address review comments
4. Get approval from both reviewers
5. Merge after CI passes

## Code Style

### Backend (Python/Django)
- Follow PEP 8 style guide
- Use Black for code formatting
- Use isort for import sorting
- Maximum line length: 100 characters
- Use type hints where applicable
- Add docstrings to all functions and classes

### Frontend (TypeScript/React)
- Follow Airbnb TypeScript style guide
- Use ESLint for linting
- Use Prettier for formatting
- Use functional components with hooks
- Use TypeScript strict mode
- Add JSDoc comments for complex functions

## File Organization

### Backend Structure
```
backend/
├── app_name/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── services.py (business logic)
│   ├── tests/
│   └── migrations/
```

### Frontend Structure
```
frontend/src/
├── app/              # Next.js app router pages
├── components/        # Reusable components
│   ├── ui/          # Base UI components
│   └── feature/     # Feature-specific components
├── lib/              # Utilities and API clients
├── contexts/         # React contexts
├── hooks/            # Custom hooks
└── types/            # TypeScript types
```

## Testing Requirements

### Backend
- Unit tests for all services and utilities
- Integration tests for API endpoints
- Test coverage > 50% for new code (target: 80%)
- Use pytest and pytest-django

### Frontend
- Unit tests for components (target: 60%+)
- Integration tests for critical flows
- Use Jest and React Testing Library

## Documentation

### Code Documentation
- Add docstrings to all functions and classes
- Document complex algorithms and business logic
- Include examples in docstrings where helpful

### API Documentation
- Update OpenAPI/Swagger docs for API changes
- Document request/response formats
- Include example requests/responses

### README Updates
- Update README for new features
- Document new environment variables
- Update setup instructions if needed

## Environment Variables

### Naming Convention
- Use UPPER_SNAKE_CASE
- Prefix with service name if applicable (e.g., `STRIPE_SECRET_KEY`)
- Document in `.env.example` and deployment checklist

### Required vs Optional
- Mark required variables clearly
- Provide sensible defaults for optional variables
- Document in README and deployment docs

## Database Migrations

### Naming
- Use descriptive names: `0002_add_subscription_model.py`
- Include ticket number if applicable

### Guidelines
- Never delete migration files
- Test migrations on staging first
- Ensure backward compatibility when possible
- Document breaking changes

## Security

### Secrets Management
- Never commit secrets to repository
- Use environment variables for all secrets
- Rotate secrets regularly
- Document secret requirements

### Code Security
- Validate all user inputs
- Use parameterized queries
- Implement rate limiting
- Follow OWASP guidelines

## Deployment

### Staging
- Deploy to staging before production
- Test all critical flows on staging
- Verify environment variables
- Check logs for errors

### Production
- Follow deployment checklist
- Monitor logs after deployment
- Have rollback plan ready
- Document any issues

## Communication

### Issues and Blockers
- Create issue with title: `BLOCKER: <short reason>`
- Tag `@dev-lead` for urgent issues
- Include logs and error details
- Update status regularly

### Status Updates
- Update ticket status regularly
- Communicate blockers immediately
- Share progress in standups
- Document decisions in PR descriptions

---

**Last Updated:** November 26, 2025
**Maintained By:** Development Team

