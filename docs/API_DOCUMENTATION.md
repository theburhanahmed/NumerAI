# NumerAI API Documentation

## Base URL

```
Production: https://api.numerobuddy.com/api/v1
Development: http://localhost:8000/api/v1
```

## Authentication

### JWT Authentication (Recommended)

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### API Key Authentication (Mobile Apps)

For mobile applications, you can use API keys:

```
X-API-Key: <api_key>
```

To generate an API key:
1. Authenticate with JWT
2. POST `/api/v1/users/api-keys/` with `{"name": "Mobile App", "expires_in_days": 365}`
3. Save the returned `key` value (only shown once)

## API Versioning

The API uses versioning in the URL path (`/api/v1/`). Version information is included in response headers:

- `X-API-Version`: Current request version
- `X-API-Current-Version`: Latest available version
- `X-API-Deprecated`: `true` if version is deprecated
- `X-API-Sunset-Date`: Date when deprecated version will be removed

### Version Negotiation

You can specify the API version via:
1. URL path: `/api/v1/...` (recommended)
2. Header: `X-API-Version: v1.0`
3. Accept header: `Accept: application/json; version=1.0`
4. Query parameter: `?version=v1.0`

## Rate Limiting

Rate limits are applied per user and endpoint. Rate limit information is included in response headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

### Default Limits

- Anonymous users: 10 requests/minute
- Authenticated users: 300 requests/minute
- Premium users: 1000 requests/hour
- Basic users: 500 requests/hour

### Per-Endpoint Limits

- AI Chat: 20 requests/hour (free), 100/hour (premium)
- Profile: 200 requests/minute
- Notifications: 200 requests/minute

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": {
      "field": "field_name",
      "code": "error_code"
    }
  }
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `426 Upgrade Required`: API version too old

## Endpoints

### Authentication

#### Register
```
POST /api/v1/auth/register/
Body: {
  "email": "user@example.com",
  "password": "secure_password",
  "full_name": "User Name",
  "phone": "+1234567890" (optional)
}
Response: {
  "message": "Registration successful. Please check your email for OTP.",
  "user_id": "uuid",
  "email": "user@example.com"
}
```

#### Verify OTP
```
POST /api/v1/auth/verify-otp/
Body: {
  "email": "user@example.com" (or "phone": "+1234567890"),
  "otp": "123456"
}
Response: {
  "message": "OTP verified successfully",
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": { ... }
}
```

#### Login
```
POST /api/v1/auth/login/
Body: {
  "email": "user@example.com" (or "phone": "+1234567890"),
  "password": "password"
}
Response: {
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": { ... }
}
```

#### Refresh Token
```
POST /api/v1/auth/refresh-token/
Body: {
  "refresh": "refresh_token"
}
Response: {
  "access_token": "new_jwt_token",
  "refresh_token": "new_refresh_token"
}
```

### User Profile

#### Get Profile
```
GET /api/v1/users/profile/
Headers: Authorization: Bearer <token>
Response: {
  "id": "uuid",
  "full_name": "User Name",
  "email": "user@example.com",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "timezone": "UTC",
  "location": "City, Country",
  "bio": "User bio"
}
```

#### Update Profile
```
PATCH /api/v1/users/profile/
Headers: Authorization: Bearer <token>
Body: {
  "full_name": "New Name",
  "date_of_birth": "1990-01-01",
  "gender": "female",
  "timezone": "America/New_York",
  "location": "New York, USA",
  "bio": "Updated bio"
}
Response: { ... updated profile ... }
```

### Numerology

#### Calculate Profile
```
POST /api/v1/numerology/calculate/
Headers: Authorization: Bearer <token>
Body: {
  "system": "pythagorean" (or "chaldean")
}
Response: {
  "message": "Profile calculated successfully",
  "profile": {
    "life_path_number": 3,
    "destiny_number": 7,
    "soul_urge_number": 5,
    ...
  }
}
```

#### Get Birth Chart
```
GET /api/v1/numerology/birth-chart/
Headers: Authorization: Bearer <token>
Response: {
  "profile": { ... },
  "interpretations": {
    "life_path_number": { ... },
    "destiny_number": { ... },
    ...
  },
  "lo_shu_grid": { ... } (if available)
}
```

#### Get Daily Reading
```
GET /api/v1/numerology/daily-reading/?date=2024-01-15
Headers: Authorization: Bearer <token>
Response: {
  "reading_date": "2024-01-15",
  "personal_day_number": 5,
  "lucky_number": 8,
  "lucky_color": "Green",
  "auspicious_time": "9-11 AM",
  "affirmation": "...",
  "actionable_tip": "...",
  "warning": "...",
  "activity_recommendation": "..."
}
```

#### Get Lo Shu Grid
```
GET /api/v1/numerology/lo-shu-grid/
Headers: Authorization: Bearer <token>
Response: {
  "grid": {
    "pos_1": { "count": 2, "numbers": [1, 4] },
    "pos_2": { "count": 1, "numbers": [2] },
    ...
  },
  "missing_numbers": [3, 6],
  "strong_numbers": [1, 5, 9],
  "strength_arrows": ["spiritual_plane", "material_plane"],
  "interpretation": "...",
  "personality_signature": { ... },
  "remedy_suggestions": [ ... ]
}
```

### Payments

#### Get Subscription Status
```
GET /api/v1/payments/subscription-status/
Headers: Authorization: Bearer <token>
Response: {
  "subscription_plan": "premium",
  "is_active": true,
  "current_period_end": "2024-12-31T23:59:59Z",
  "cancel_at_period_end": false
}
```

#### Create Subscription
```
POST /api/v1/payments/create-subscription/
Headers: Authorization: Bearer <token>
Body: {
  "price_id": "price_xxx",
  "payment_method_id": "pm_xxx" (optional)
}
Response: {
  "subscription_id": "sub_xxx",
  "client_secret": "seti_xxx" (if payment method needed),
  "status": "active"
}
```

### Notifications

#### List Notifications
```
GET /api/v1/notifications/?page=1
Headers: Authorization: Bearer <token>
Response: {
  "count": 50,
  "next": "http://...?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "title": "Daily Reading Ready",
      "message": "Your daily reading is available",
      "notification_type": "daily_reading",
      "is_read": false,
      "created_at": "2024-01-15T10:00:00Z"
    },
    ...
  ]
}
```

#### Get Unread Count
```
GET /api/v1/notifications/unread-count/
Headers: Authorization: Bearer <token>
Response: {
  "count": 5
}
```

#### Notification Stream (SSE)
```
GET /api/v1/notifications/stream/
Headers: Authorization: Bearer <token>
Content-Type: text/event-stream

data: {"type": "connected", "message": "Notification stream connected"}

data: {"type": "notification", "id": "uuid", "title": "...", ...}

data: {"type": "unread_count", "count": 5}
```

### Privacy & GDPR

#### Get Privacy Settings
```
GET /api/v1/users/privacy-settings/
Headers: Authorization: Bearer <token>
Response: {
  "share_analytics": true,
  "share_marketing": false,
  "profile_visibility": "private",
  "gdpr_consent": true,
  "privacy_policy_accepted": true,
  "privacy_policy_version": "1.0"
}
```

#### Export Data
```
GET /api/v1/users/export-data/
Headers: Authorization: Bearer <token>
Response: JSON file download with all user data
```

#### Delete Account
```
DELETE /api/v1/users/delete-account/
Headers: Authorization: Bearer <token>
Body: {
  "confirm": true,
  "password": "user_password" (optional)
}
Response: {
  "message": "Account deleted successfully. All personal data has been removed."
}
```

## Pagination

List endpoints support pagination:

```
GET /api/v1/notifications/?page=1&page_size=20
```

Response includes:
- `count`: Total number of items
- `next`: URL for next page (null if last page)
- `previous`: URL for previous page (null if first page)
- `results`: Array of items

## Filtering & Search

Many endpoints support filtering:

```
GET /api/v1/experts/?specialty=relationship&rating__gte=4.5
GET /api/v1/consultations/?status=confirmed&scheduled_at__gte=2024-01-01
```

## OpenAPI Schema

Interactive API documentation is available at:
- Swagger UI: `/api/schema/swagger-ui/`
- ReDoc: `/api/schema/redoc/`
- JSON Schema: `/api/schema/`

## Best Practices

1. **Always include Authorization header** for authenticated endpoints
2. **Handle rate limiting** - Check `X-RateLimit-Remaining` header
3. **Use pagination** for list endpoints
4. **Handle errors gracefully** - Check status codes and error messages
5. **Store refresh tokens securely** - Use secure storage (not localStorage in production)
6. **Implement retry logic** - For transient errors (5xx)
7. **Cache responses** - Where appropriate to reduce API calls
8. **Monitor API version** - Check for deprecation warnings

## Support

For API support, contact: api-support@numerobuddy.com

