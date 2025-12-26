# GraphQL API Documentation

## Overview

NumerAI provides a GraphQL API alongside the REST API for flexible data querying. GraphQL allows clients to request exactly the data they need, reducing over-fetching and under-fetching.

## Endpoint

```
POST /api/v1/graphql/
GET /api/v1/graphql/playground/  # GraphiQL interface
```

## Authentication

GraphQL API uses JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Or use JWT mutations to authenticate:

```graphql
mutation {
  tokenAuth(username: "user@example.com", password: "password") {
    token
    refreshToken
  }
}
```

## Schema

### Queries

#### Get Current User

```graphql
query {
  me {
    id
    email
    fullName
    dateOfBirth
    isPremium
    subscriptionPlan
  }
}
```

#### Get Numerology Profile

```graphql
query {
  numerologyProfile {
    id
    lifePathNumber
    destinyNumber
    soulUrgeNumber
    personalityNumber
    system
    calculatedAt
  }
}
```

#### Get Daily Reading

```graphql
query {
  dailyReading(date: "2024-01-15") {
    id
    readingDate
    personalDayNumber
    luckyNumber
    luckyColor
    affirmation
    actionableTip
  }
}
```

#### Get Daily Readings (Range)

```graphql
query {
  dailyReadings(startDate: "2024-01-01", endDate: "2024-01-31") {
    edges {
      node {
        id
        readingDate
        personalDayNumber
        luckyNumber
      }
    }
  }
}
```

#### Get Consultations

```graphql
query {
  consultations {
    edges {
      node {
        id
        expert {
          id
          fullName
        }
        scheduledAt
        status
        duration
      }
    }
  }
}
```

#### Get Subscription

```graphql
query {
  subscription {
    id
    plan
    status
    currentPeriodEnd
    cancelAtPeriodEnd
  }
}
```

### Mutations

#### Calculate Numerology Profile

```graphql
mutation {
  calculateNumerologyProfile(system: "pythagorean") {
    success
    message
    profile {
      id
      lifePathNumber
      destinyNumber
    }
  }
}
```

#### Update User Profile

```graphql
mutation {
  updateUserProfile(
    fullName: "John Doe"
    dateOfBirth: "1990-01-01"
    gender: "male"
    location: "New York, USA"
  ) {
    success
    message
    user {
      id
      fullName
      dateOfBirth
    }
  }
}
```

#### JWT Authentication

```graphql
mutation {
  tokenAuth(email: "user@example.com", password: "password") {
    token
    refreshToken
  }
}
```

#### Refresh Token

```graphql
mutation {
  refreshToken(refreshToken: "your_refresh_token") {
    token
    refreshToken
  }
}
```

#### Verify Token

```graphql
mutation {
  verifyToken(token: "your_token") {
    payload
  }
}
```

## Examples

### Complete User Query

```graphql
query {
  me {
    id
    email
    fullName
    dateOfBirth
    isPremium
    subscriptionPlan
  }
  numerologyProfile {
    lifePathNumber
    destinyNumber
    soulUrgeNumber
  }
  dailyReading {
    personalDayNumber
    luckyNumber
    affirmation
  }
  subscription {
    plan
    status
    currentPeriodEnd
  }
}
```

### Filtered Consultations

```graphql
query {
  consultations(status: "confirmed") {
    edges {
      node {
        id
        expert {
          fullName
        }
        scheduledAt
        duration
      }
    }
  }
}
```

## Best Practices

1. **Request Only Needed Fields**: GraphQL allows you to request exactly what you need, reducing payload size.

2. **Use Fragments**: Reuse common field selections:

```graphql
fragment UserFields on UserType {
  id
  email
  fullName
}

query {
  me {
    ...UserFields
  }
}
```

3. **Handle Errors**: GraphQL returns errors in a structured format:

```json
{
  "errors": [
    {
      "message": "Permission denied",
      "locations": [{"line": 2, "column": 3}],
      "path": ["me"]
    }
  ],
  "data": {
    "me": null
  }
}
```

4. **Use Variables**: For dynamic queries:

```graphql
query GetDailyReading($date: String!) {
  dailyReading(date: $date) {
    personalDayNumber
    luckyNumber
  }
}
```

Variables:
```json
{
  "date": "2024-01-15"
}
```

## Rate Limiting

GraphQL queries are subject to the same rate limiting as REST API endpoints. Rate limit information is included in response headers.

## Comparison with REST API

| Feature | REST API | GraphQL |
|---------|----------|---------|
| Over-fetching | Possible | Avoided |
| Under-fetching | Possible | Avoided |
| Multiple requests | Often needed | Single request |
| Caching | Easy | Complex |
| Learning curve | Low | Medium |
| Tooling | Mature | Growing |

## Support

For GraphQL support, contact: api-support@numerobuddy.com

