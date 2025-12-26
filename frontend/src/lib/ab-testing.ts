/**
 * A/B Testing Framework
 * 
 * Simple A/B testing framework for UI variations and conversion optimization.
 */

export interface Experiment {
  id: string
  name: string
  variants: string[]
  defaultVariant: string
  trafficSplit?: number[] // Percentage for each variant (default: 50/50)
}

export interface ExperimentResult {
  experimentId: string
  variant: string
  userId?: string
  sessionId: string
  timestamp: number
}

class ABTesting {
  private experiments: Map<string, Experiment> = new Map()
  private results: Map<string, string> = new Map() // experimentId -> variant

  /**
   * Register an experiment
   */
  registerExperiment(experiment: Experiment): void {
    this.experiments.set(experiment.id, experiment)
  }

  /**
   * Get variant for an experiment
   */
  getVariant(experimentId: string, userId?: string): string {
    // Check if variant already assigned
    const stored = this.results.get(experimentId)
    if (stored) {
      return stored
    }

    const experiment = this.experiments.get(experimentId)
    if (!experiment) {
      return 'default'
    }

    // Assign variant based on consistent hashing
    const hash = this.hash(`${experimentId}-${userId || this.getSessionId()}`)
    const split = experiment.trafficSplit || 
      Array(experiment.variants.length).fill(100 / experiment.variants.length)
    
    let cumulative = 0
    for (let i = 0; i < experiment.variants.length; i++) {
      cumulative += split[i]
      if (hash % 100 < cumulative) {
        const variant = experiment.variants[i]
        this.results.set(experimentId, variant)
        this.trackAssignment(experimentId, variant, userId)
        return variant
      }
    }

    // Fallback to default
    const variant = experiment.defaultVariant
    this.results.set(experimentId, variant)
    return variant
  }

  /**
   * Track experiment assignment
   */
  private trackAssignment(
    experimentId: string,
    variant: string,
    userId?: string
  ): void {
    const result: ExperimentResult = {
      experimentId,
      variant,
      userId,
      sessionId: this.getSessionId(),
      timestamp: Date.now(),
    }

    // Store in localStorage
    if (typeof window !== 'undefined') {
      const assignments = this.getStoredAssignments()
      assignments[experimentId] = result
      localStorage.setItem('ab-test-assignments', JSON.stringify(assignments))
    }

    // Track analytics event
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('experiment_assigned', {
        experiment_id: experimentId,
        variant,
        user_id: userId,
      })
    }
  }

  /**
   * Get stored assignments from localStorage
   */
  private getStoredAssignments(): Record<string, ExperimentResult> {
    if (typeof window === 'undefined') return {}
    
    try {
      const stored = localStorage.getItem('ab-test-assignments')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  /**
   * Load stored assignments
   */
  loadStoredAssignments(): void {
    const assignments = this.getStoredAssignments()
    for (const [experimentId, result] of Object.entries(assignments)) {
      this.results.set(experimentId, result.variant)
    }
  }

  /**
   * Hash function for consistent assignment
   */
  private hash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return ''
    
    let sessionId = sessionStorage.getItem('ab-test-session-id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('ab-test-session-id', sessionId)
    }
    return sessionId
  }

  /**
   * Track conversion for experiment
   */
  trackConversion(experimentId: string, conversionName: string, value?: number): void {
    const variant = this.results.get(experimentId)
    if (!variant) return

    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('experiment_conversion', {
        experiment_id: experimentId,
        variant,
        conversion_name: conversionName,
        value,
      })
    }
  }

  /**
   * Reset experiment (for testing)
   */
  resetExperiment(experimentId: string): void {
    this.results.delete(experimentId)
    if (typeof window !== 'undefined') {
      const assignments = this.getStoredAssignments()
      delete assignments[experimentId]
      localStorage.setItem('ab-test-assignments', JSON.stringify(assignments))
    }
  }
}

// Singleton instance
const abTesting = new ABTesting()

// Load stored assignments on init
if (typeof window !== 'undefined') {
  abTesting.loadStoredAssignments()
}

/**
 * Register default experiments
 */
export function registerDefaultExperiments(): void {
  abTesting.registerExperiment({
    id: 'pricing-layout',
    name: 'Pricing Page Layout',
    variants: ['default', 'compact', 'detailed'],
    defaultVariant: 'default',
    trafficSplit: [33, 33, 34],
  })

  abTesting.registerExperiment({
    id: 'onboarding-flow',
    name: 'Onboarding Flow',
    variants: ['short', 'detailed'],
    defaultVariant: 'short',
  })

  abTesting.registerExperiment({
    id: 'cta-button',
    name: 'CTA Button Style',
    variants: ['primary', 'space', 'glass'],
    defaultVariant: 'primary',
  })
}

/**
 * Get variant for experiment
 */
export function getVariant(experimentId: string, userId?: string): string {
  return abTesting.getVariant(experimentId, userId)
}

/**
 * Track conversion
 */
export function trackExperimentConversion(
  experimentId: string,
  conversionName: string,
  value?: number
): void {
  abTesting.trackConversion(experimentId, conversionName, value)
}

/**
 * Register experiment
 */
export function registerExperiment(experiment: Experiment): void {
  abTesting.registerExperiment(experiment)
}

/**
 * Reset experiment
 */
export function resetExperiment(experimentId: string): void {
  abTesting.resetExperiment(experimentId)
}

export default abTesting

