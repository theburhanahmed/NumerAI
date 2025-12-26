/**
 * Components Index
 * 
 * Central export point for all components.
 * This provides a single import location for components throughout the app.
 */

// Base Components
export * from './base'

// Layout Components
export * from './layout'

// Navigation Components
export { Breadcrumbs, type BreadcrumbItem, type BreadcrumbsProps } from './navigation/Breadcrumbs'
export { GlobalSearch, type GlobalSearchProps, type SearchResult } from './navigation/GlobalSearch'
export { QuickActions, type QuickActionsProps, type QuickAction } from './navigation/QuickActions'

// Onboarding Components
export * from './onboarding'

// Loading Components
export * from './loading'

// Empty State Components
export * from './empty'

// Feedback Components
export * from './feedback'

// Engagement Components
export * from './engagement'

// Social Components
export * from './social'

// Trust Components
export * from './trust'

// Monetization Components
export * from './monetization'

// Charts Components
export * from './charts'

// Mobile Components
export * from './mobile'

// PWA Components
export * from './pwa'

// Existing Components (re-exported for convenience)
export { SpaceCard } from './space/space-card'
export { SpaceButton } from './space/space-button'
export { GlassButton } from './glassmorphism/glass-button'
export { ErrorBoundary } from './ErrorBoundary'
export { FeatureGate } from './FeatureGate'
export { SubscriptionGate } from './SubscriptionGate'

