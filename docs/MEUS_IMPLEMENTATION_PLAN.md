# Multi-Entity Universe System (MEUS) - Implementation Plan
**Version:** 1.0  
**Date:** December 2025  
**Status:** Planning Phase  
**Target Phase:** Phase 3

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Schema](#2-database-schema)
3. [API Specifications](#3-api-specifications)
4. [Implementation Roadmap](#4-implementation-roadmap)
5. [Algorithm Specifications](#5-algorithm-specifications)
6. [Frontend Components](#6-frontend-components)
7. [Testing Strategy](#7-testing-strategy)

---

## 1. Overview

### 1.1 Purpose

The Multi-Entity Universe System (MEUS) enables users to store and analyze the numerology of all people, assets, and events in their life within a unified intelligence system. This provides real-time insights into how entities affect opportunities, challenges, timing, and outcomes.

### 1.2 Key Features

- Store unlimited entities (people, assets, events)
- Automatic numerology calculation for all entities
- Cross-entity compatibility analysis
- Influence scoring and tracking
- Universe Intelligence Dashboard
- AI-powered action recommendations
- Multi-profile report generation

### 1.3 Success Criteria

- Users can add and manage 20+ entities
- Cross-entity analysis completes in <5 seconds
- Dashboard loads in <3 seconds
- 80%+ user adoption rate
- 60%+ users add at least 5 entities

---

## 2. Database Schema

### 2.1 Entity Profiles Table

```sql
CREATE TABLE entity_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('person', 'asset', 'event')),
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,  -- For people and events
    relationship_type VARCHAR(50),  -- For people: 'family', 'friend', 'partner', 'colleague', etc.
    metadata JSONB,  -- Flexible storage for entity-specific data
    numerology_profile_id UUID REFERENCES numerology_profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_person_dob CHECK (
        (entity_type = 'person' AND date_of_birth IS NOT NULL) OR
        (entity_type != 'person')
    )
);

CREATE INDEX idx_entity_profiles_user ON entity_profiles(user_id);
CREATE INDEX idx_entity_profiles_type ON entity_profiles(entity_type);
CREATE INDEX idx_entity_profiles_active ON entity_profiles(user_id, is_active) WHERE is_active = TRUE;
```

### 2.2 Entity Relationships Table

```sql
CREATE TABLE entity_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_1_id UUID NOT NULL REFERENCES entity_profiles(id) ON DELETE CASCADE,
    entity_2_id UUID NOT NULL REFERENCES entity_profiles(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50),  -- 'compatible', 'challenging', 'neutral', etc.
    compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
    influence_score INTEGER CHECK (influence_score >= -100 AND influence_score <= 100),
    analysis_data JSONB,  -- Detailed compatibility analysis
    calculated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,  -- For cache invalidation
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT different_entities CHECK (entity_1_id != entity_2_id),
    CONSTRAINT unique_relationship UNIQUE (entity_1_id, entity_2_id)
);

CREATE INDEX idx_entity_relationships_entity1 ON entity_relationships(entity_1_id);
CREATE INDEX idx_entity_relationships_entity2 ON entity_relationships(entity_2_id);
CREATE INDEX idx_entity_relationships_compatibility ON entity_relationships(compatibility_score);
```

### 2.3 Entity Influences Table

```sql
CREATE TABLE entity_influences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL REFERENCES entity_profiles(id) ON DELETE CASCADE,
    influence_strength INTEGER NOT NULL CHECK (influence_strength >= 0 AND influence_strength <= 100),
    impact_type VARCHAR(20) NOT NULL CHECK (impact_type IN ('positive', 'negative', 'neutral')),
    impact_areas JSONB NOT NULL,  -- {"health": 75, "money": 60, "career": 80, "relationships": 70, "stability": 65}
    cycle_period VARCHAR(10) NOT NULL,  -- 'year' or 'month'
    cycle_value VARCHAR(20) NOT NULL,  -- '2026' or '2026-04'
    calculated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_influence UNIQUE (user_id, entity_id, cycle_period, cycle_value)
);

CREATE INDEX idx_entity_influences_user ON entity_influences(user_id);
CREATE INDEX idx_entity_influences_entity ON entity_influences(entity_id);
CREATE INDEX idx_entity_influences_cycle ON entity_influences(cycle_period, cycle_value);
CREATE INDEX idx_entity_influences_type ON entity_influences(impact_type);
```

### 2.4 Universe Events Table

```sql
CREATE TABLE universe_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,  -- 'wedding', 'business_launch', 'travel', 'purchase', 'medical', 'decision'
    event_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    related_entity_ids UUID[],  -- Array of entity profile IDs
    numerology_insight JSONB,  -- Numerology analysis of the event date
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_universe_events_user ON universe_events(user_id);
CREATE INDEX idx_universe_events_date ON universe_events(event_date);
CREATE INDEX idx_universe_events_type ON universe_events(event_type);
```

### 2.5 Asset Profiles Table

```sql
CREATE TABLE asset_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL UNIQUE REFERENCES entity_profiles(id) ON DELETE CASCADE,
    asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('vehicle', 'property', 'business', 'phone')),
    asset_number VARCHAR(100) NOT NULL,  -- License plate, house number, phone number, etc.
    numerology_vibration INTEGER,  -- Calculated vibration number
    safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100),  -- For vehicles
    compatibility_with_owner INTEGER CHECK (compatibility_with_owner >= 0 AND compatibility_with_owner <= 100),
    additional_data JSONB,  -- Asset-specific data
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_asset_entity CHECK (
        EXISTS (SELECT 1 FROM entity_profiles WHERE id = entity_id AND entity_type = 'asset')
    )
);

CREATE INDEX idx_asset_profiles_entity ON asset_profiles(entity_id);
CREATE INDEX idx_asset_profiles_type ON asset_profiles(asset_type);
```

### 2.6 Cross-Profile Analysis Cache Table

```sql
CREATE TABLE cross_profile_analysis_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_combination_hash VARCHAR(64) NOT NULL,  -- SHA-256 hash of sorted entity IDs
    analysis_result JSONB NOT NULL,
    calculated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_cache_entry UNIQUE (user_id, entity_combination_hash)
);

CREATE INDEX idx_analysis_cache_user ON cross_profile_analysis_cache(user_id);
CREATE INDEX idx_analysis_cache_expires ON cross_profile_analysis_cache(expires_at);
CREATE INDEX idx_analysis_cache_hash ON cross_profile_analysis_cache(entity_combination_hash);
```

---

## 3. API Specifications

### 3.1 Entity Management Endpoints

#### POST /api/v1/entity/add

**Request:**
```json
{
  "entity_type": "person" | "asset" | "event",
  "name": "John Doe",
  "date_of_birth": "1990-05-15",  // Required for person, optional for event
  "relationship_type": "friend",  // For person
  "metadata": {
    "phone": "+1234567890",  // Optional
    "email": "john@example.com"  // Optional
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "entity_type": "person",
  "name": "John Doe",
  "numerology_profile": {
    "life_path_number": 5,
    "destiny_number": 7,
    // ... all numerology numbers
  },
  "compatibility_with_user": {
    "overall_score": 85,
    "life_path_compatibility": "excellent",
    "details": "..."
  },
  "created_at": "2025-12-01T10:00:00Z"
}
```

#### GET /api/v1/entity/{id}/profile

**Response:**
```json
{
  "id": "uuid",
  "entity_type": "person",
  "name": "John Doe",
  "date_of_birth": "1990-05-15",
  "relationship_type": "friend",
  "numerology_profile": { /* full profile */ },
  "current_cycles": {
    "personal_year": 7,
    "personal_month": 3,
    "personal_day": 5
  },
  "compatibility_with_user": { /* compatibility data */ },
  "influence_on_user": {
    "strength": 75,
    "impact_type": "positive",
    "impact_areas": {
      "health": 80,
      "money": 70,
      "career": 85,
      "relationships": 90,
      "stability": 65
    }
  },
  "created_at": "2025-12-01T10:00:00Z"
}
```

#### GET /api/v1/entity/list

**Query Parameters:**
- `entity_type` (optional): Filter by type
- `relationship_type` (optional): Filter by relationship
- `page` (optional): Page number
- `page_size` (optional): Items per page

**Response:**
```json
{
  "count": 25,
  "next": "/api/v1/entity/list?page=2",
  "previous": null,
  "results": [
    { /* entity summary */ }
  ]
}
```

#### PUT /api/v1/entity/{id}

**Request:** Same as POST /api/v1/entity/add

#### DELETE /api/v1/entity/{id}

**Response:**
```json
{
  "success": true,
  "message": "Entity deleted successfully"
}
```

### 3.2 Universe Dashboard Endpoints

#### GET /api/v1/universe/dashboard

**Response:**
```json
{
  "summary": {
    "total_entities": 15,
    "people_count": 10,
    "assets_count": 3,
    "events_count": 2
  },
  "network_graph": {
    "nodes": [
      {
        "id": "user-uuid",
        "type": "user",
        "label": "You",
        "life_path": 7
      },
      {
        "id": "entity-uuid",
        "type": "person",
        "label": "John Doe",
        "life_path": 5,
        "relationship": "friend"
      }
    ],
    "edges": [
      {
        "source": "user-uuid",
        "target": "entity-uuid",
        "compatibility": 85,
        "influence": 75,
        "type": "positive"
      }
    ]
  },
  "influence_heatmap": {
    "current_month": {
      "positive_influences": [
        {
          "entity_id": "uuid",
          "entity_name": "John Doe",
          "strength": 85,
          "impact_areas": ["career", "relationships"]
        }
      ],
      "negative_influences": [],
      "neutral_influences": []
    }
  },
  "alerts": [
    {
      "type": "conflict_warning",
      "message": "Avoid conflict with Jane Doe until next month",
      "entity_id": "uuid",
      "severity": "medium",
      "expires_at": "2025-12-15T00:00:00Z"
    },
    {
      "type": "opportunity",
      "message": "Best timing for property purchase: December 20-25",
      "severity": "high",
      "expires_at": "2025-12-25T00:00:00Z"
    }
  ],
  "opportunities": [
    {
      "type": "relationship",
      "message": "Your business partner becomes beneficial after April 2026",
      "entity_id": "uuid",
      "timing": "2026-04-01"
    }
  ]
}
```

#### GET /api/v1/universe/influence-map

**Query Parameters:**
- `period`: "month" | "year" (default: "month")
- `period_value`: "2026-04" or "2026" (default: current)

**Response:**
```json
{
  "period": "2026-04",
  "influences": [
    {
      "entity_id": "uuid",
      "entity_name": "John Doe",
      "influence_strength": 85,
      "impact_type": "positive",
      "impact_areas": {
        "health": 80,
        "money": 70,
        "career": 85,
        "relationships": 90,
        "stability": 65
      }
    }
  ],
  "heatmap_data": {
    "positive_count": 5,
    "negative_count": 1,
    "neutral_count": 4
  }
}
```

### 3.3 Analysis Endpoints

#### POST /api/v1/analysis/cross-entity

**Request:**
```json
{
  "entity_ids": ["uuid1", "uuid2", "uuid3"],
  "analysis_type": "compatibility" | "influence" | "full"
}
```

**Response:**
```json
{
  "compatibility_matrix": [
    {
      "entity_1": "uuid1",
      "entity_2": "uuid2",
      "compatibility_score": 85,
      "life_path_compatibility": "excellent",
      "destiny_compatibility": "good",
      "details": "..."
    }
  ],
  "influence_analysis": {
    "positive_influences": [],
    "negative_influences": [],
    "recommendations": []
  },
  "calculated_at": "2025-12-01T10:00:00Z"
}
```

### 3.4 Recommendations Endpoints

#### GET /api/v1/recommendations/next-actions

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 10)
- `priority` (optional): "high" | "medium" | "low" | "all" (default: "all")

**Response:**
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "type": "attention",
      "priority": "high",
      "title": "Who needs your attention this week",
      "message": "Focus on strengthening relationship with John Doe",
      "entity_id": "uuid",
      "entity_name": "John Doe",
      "reasoning": "Based on numerology compatibility and current cycles...",
      "action_items": [
        "Schedule a meeting this week",
        "Avoid discussing financial matters"
      ],
      "timing": {
        "start": "2025-12-01",
        "end": "2025-12-07"
      }
    },
    {
      "id": "uuid",
      "type": "timing",
      "priority": "high",
      "title": "Best timing for property purchase",
      "message": "Optimal dates: December 20-25, 2025",
      "reasoning": "Your Personal Year 7 aligns with property number 4...",
      "action_items": [
        "Schedule property viewings",
        "Complete paperwork"
      ],
      "timing": {
        "start": "2025-12-20",
        "end": "2025-12-25"
      }
    }
  ],
  "generated_at": "2025-12-01T10:00:00Z"
}
```

### 3.5 Report Generation Endpoints

#### POST /api/v1/universe/reports/generate

**Request:**
```json
{
  "report_type": "family_compatibility" | "relationship_health" | "asset_suitability" | "monthly_influence" | "business_timing",
  "entity_ids": ["uuid1", "uuid2"],  // Optional, defaults to all entities
  "format": "pdf" | "json"
}
```

**Response:**
```json
{
  "report_id": "uuid",
  "report_type": "family_compatibility",
  "status": "generating" | "completed",
  "download_url": "/api/v1/universe/reports/{id}/download",  // When completed
  "created_at": "2025-12-01T10:00:00Z"
}
```

#### GET /api/v1/universe/reports/{id}/download

Returns PDF file or JSON data.

---

## 4. Implementation Roadmap

### Phase 3.1: Foundation (Weeks 1-2)

**Goals:**
- Database schema implementation
- Basic models and serializers
- CRUD endpoints for entities
- Entity type categorization

**Tasks:**
1. Create Django app `meus` (Multi-Entity Universe System)
2. Implement all 6 database models
3. Create migrations
4. Implement serializers for all models
5. Create basic CRUD views for EntityProfile
6. Add URL routing
7. Write unit tests for models
8. Write API tests for CRUD endpoints

**Deliverables:**
- ✅ All database tables created
- ✅ Entity CRUD API working
- ✅ Basic validation in place
- ✅ Tests passing

### Phase 3.2: Core Intelligence (Weeks 3-4)

**Goals:**
- Cross-entity compatibility engine
- Influence scoring algorithm
- Time-cycle synchronization
- Basic dashboard data aggregation

**Tasks:**
1. Implement `CompatibilityEngine` service
2. Implement `InfluenceScoringService`
3. Implement `CycleSynchronizationService`
4. Create dashboard data aggregation service
5. Implement caching for compatibility calculations
6. Add background tasks for heavy calculations
7. Write tests for all services

**Deliverables:**
- ✅ Compatibility analysis working
- ✅ Influence scores calculated
- ✅ Cycle synchronization working
- ✅ Dashboard API returning data

### Phase 3.3: Advanced Features (Weeks 5-6)

**Goals:**
- Relationship graph generator
- Action recommendation engine
- Universe Intelligence Dashboard UI
- Alert system

**Tasks:**
1. Implement `GraphGeneratorService` for network visualization
2. Implement `RecommendationEngine` with AI integration
3. Create dashboard frontend components
4. Implement alert generation system
5. Add real-time updates (WebSocket or polling)
6. Create visualization components (network graph, heatmap)
7. Write integration tests

**Deliverables:**
- ✅ Dashboard UI complete
- ✅ Recommendations engine working
- ✅ Alerts system functional
- ✅ Graph visualization working

### Phase 3.4: Reports & Polish (Weeks 7-8)

**Goals:**
- Multi-profile report generation
- PDF export for universe reports
- Performance optimization
- Testing and bug fixes

**Tasks:**
1. Implement report generation service
2. Create PDF templates for all report types
3. Optimize database queries
4. Add caching layers
5. Performance testing and optimization
6. Bug fixes
7. Documentation
8. User acceptance testing

**Deliverables:**
- ✅ All report types generating
- ✅ PDF export working
- ✅ Performance optimized (<3s dashboard load)
- ✅ Production ready

---

## 5. Algorithm Specifications

### 5.1 Cross-Entity Compatibility Engine

**Algorithm:**
```python
def calculate_compatibility(entity_1, entity_2, user_profile):
    """
    Calculate compatibility between two entities.
    
    Factors:
    1. Life Path compatibility (40% weight)
    2. Destiny compatibility (30% weight)
    3. Current cycle alignment (20% weight)
    4. Relationship type modifier (10% weight)
    """
    life_path_score = calculate_life_path_compatibility(
        entity_1.life_path, entity_2.life_path
    )
    destiny_score = calculate_destiny_compatibility(
        entity_1.destiny, entity_2.destiny
    )
    cycle_alignment = calculate_cycle_alignment(
        entity_1.current_cycles, entity_2.current_cycles
    )
    relationship_modifier = get_relationship_modifier(
        entity_1.relationship_type
    )
    
    compatibility = (
        life_path_score * 0.4 +
        destiny_score * 0.3 +
        cycle_alignment * 0.2 +
        relationship_modifier * 0.1
    )
    
    return {
        "overall_score": round(compatibility),
        "life_path_compatibility": get_compatibility_level(life_path_score),
        "destiny_compatibility": get_compatibility_level(destiny_score),
        "cycle_alignment": get_alignment_level(cycle_alignment),
        "details": generate_compatibility_details(...)
    }
```

### 5.2 Influence Scoring Model

**Algorithm:**
```python
def calculate_influence(entity, user_profile, current_period):
    """
    Calculate entity's influence on user.
    
    Factors:
    1. Numerology compatibility (50% weight)
    2. Relationship strength (20% weight)
    3. Current cycle alignment (20% weight)
    4. Historical interaction patterns (10% weight)
    """
    compatibility = get_compatibility_score(entity, user_profile)
    relationship_strength = get_relationship_strength(entity.relationship_type)
    cycle_alignment = check_cycle_alignment(entity, user_profile, current_period)
    historical_pattern = get_historical_pattern(entity, user_profile)
    
    influence_strength = (
        compatibility * 0.5 +
        relationship_strength * 0.2 +
        cycle_alignment * 0.2 +
        historical_pattern * 0.1
    )
    
    # Determine impact type
    if influence_strength > 70:
        impact_type = "positive"
    elif influence_strength < 40:
        impact_type = "negative"
    else:
        impact_type = "neutral"
    
    # Calculate impact areas
    impact_areas = calculate_impact_areas(
        entity, user_profile, compatibility
    )
    
    return {
        "influence_strength": round(influence_strength),
        "impact_type": impact_type,
        "impact_areas": impact_areas
    }
```

### 5.3 Action Recommendation Engine

**Algorithm:**
```python
def generate_recommendations(user, entities, current_date):
    """
    Generate AI-powered action recommendations.
    
    Process:
    1. Analyze all entity influences
    2. Identify timing opportunities
    3. Flag conflicts and challenges
    4. Prioritize recommendations
    5. Generate AI explanations
    """
    recommendations = []
    
    # Analyze entity influences
    for entity in entities:
        influence = get_current_influence(entity, user, current_date)
        
        if influence["impact_type"] == "positive" and influence["strength"] > 75:
            recommendations.append({
                "type": "attention",
                "priority": "high",
                "entity": entity,
                "message": f"Focus on {entity.name} this week",
                "reasoning": generate_ai_reasoning(entity, influence)
            })
    
    # Identify timing opportunities
    timing_opportunities = find_timing_opportunities(user, entities, current_date)
    recommendations.extend(timing_opportunities)
    
    # Flag conflicts
    conflicts = identify_conflicts(user, entities, current_date)
    recommendations.extend(conflicts)
    
    # Prioritize and limit
    recommendations = prioritize_recommendations(recommendations)
    recommendations = recommendations[:10]
    
    return recommendations
```

---

## 6. Frontend Components

### 6.1 Entity Management Components

- `EntityForm` - Add/edit entity form
- `EntityList` - List of all entities with filters
- `EntityCard` - Entity summary card
- `EntityProfile` - Full entity profile view

### 6.2 Dashboard Components

- `UniverseDashboard` - Main dashboard container
- `NetworkGraph` - Visual network graph (using D3.js or vis.js)
- `InfluenceHeatmap` - Monthly/yearly influence visualization
- `AlertsPanel` - Alerts and warnings display
- `OpportunitiesPanel` - Opportunities display

### 6.3 Analysis Components

- `CompatibilityMatrix` - Compatibility comparison table
- `InfluenceChart` - Influence strength visualization
- `CycleTimeline` - Cycle synchronization timeline

### 6.4 Recommendation Components

- `RecommendationsList` - List of action recommendations
- `RecommendationCard` - Individual recommendation card
- `ActionItems` - Actionable items from recommendations

### 6.5 Report Components

- `ReportGenerator` - Report generation form
- `ReportPreview` - Report preview before download
- `ReportHistory` - Previously generated reports

---

## 7. Testing Strategy

### 7.1 Unit Tests

- Model validation tests
- Service algorithm tests
- Compatibility calculation tests
- Influence scoring tests
- Cycle synchronization tests

### 7.2 Integration Tests

- API endpoint tests
- Database operation tests
- Cache invalidation tests
- Background task tests

### 7.3 Performance Tests

- Dashboard load time (<3 seconds)
- Compatibility calculation time (<5 seconds for 20 entities)
- Report generation time (<30 seconds)
- Concurrent user load tests

### 7.4 User Acceptance Tests

- Entity management workflow
- Dashboard usability
- Recommendation accuracy
- Report quality

---

## Success Metrics

- **Adoption Rate:** 60%+ of users add at least 5 entities
- **Engagement:** 70%+ of users check dashboard weekly
- **Performance:** Dashboard loads in <3 seconds
- **Accuracy:** 80%+ user satisfaction with recommendations
- **Retention:** MEUS users have 20%+ higher retention

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Status:** 📋 Planning Complete - Ready for Implementation

