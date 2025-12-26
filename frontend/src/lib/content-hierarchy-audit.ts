/**
 * Content Hierarchy Audit
 * 
 * Utility functions for auditing and fixing content hierarchy issues.
 */

export interface HeadingStructure {
  level: number
  text: string
  id?: string
}

/**
 * Extract heading structure from HTML
 */
export function extractHeadingStructure(html: string): HeadingStructure[] {
  const headings: HeadingStructure[] = []
  const regex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
  let match

  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      text: match[2].replace(/<[^>]*>/g, '').trim(),
    })
  }

  return headings
}

/**
 * Validate heading hierarchy
 */
export function validateHeadingHierarchy(headings: HeadingStructure[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  let previousLevel = 0

  for (let i = 0; i < headings.length; i++) {
    const current = headings[i]

    // Check for skipped levels (e.g., h1 -> h3)
    if (previousLevel > 0 && current.level > previousLevel + 1) {
      errors.push(
        `Heading level skipped: ${headings[i - 1].text} (h${previousLevel}) -> ${current.text} (h${current.level})`
      )
    }

    previousLevel = current.level
  }

  // Check for multiple h1 tags (should only have one per page)
  const h1Count = headings.filter((h) => h.level === 1).length
  if (h1Count > 1) {
    errors.push(`Multiple h1 tags found (${h1Count}). Should only have one per page.`)
  }

  // Check if page starts with h1
  if (headings.length > 0 && headings[0].level !== 1) {
    errors.push(`Page should start with h1, but starts with h${headings[0].level}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Generate heading structure recommendations
 */
export function generateRecommendations(headings: HeadingStructure[]): string[] {
  const recommendations: string[] = []

  if (headings.length === 0) {
    recommendations.push('Page has no headings. Add at least one h1 heading.')
    return recommendations
  }

  // Check for proper hierarchy
  const validation = validateHeadingHierarchy(headings)
  if (!validation.isValid) {
    recommendations.push(...validation.errors)
  }

  // Check for heading depth
  const maxLevel = Math.max(...headings.map((h) => h.level))
  if (maxLevel > 4) {
    recommendations.push(
      `Deep heading hierarchy detected (h${maxLevel}). Consider flattening structure for better readability.`
    )
  }

  // Check for heading distribution
  const levelCounts = headings.reduce((acc, h) => {
    acc[h.level] = (acc[h.level] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  if (levelCounts[2] && levelCounts[2] > 10) {
    recommendations.push(
      `Many h2 headings (${levelCounts[2]}). Consider grouping related sections.`
    )
  }

  return recommendations
}

/**
 * Common heading structure patterns
 */
export const headingPatterns = {
  page: ['h1', 'h2', 'h3'],
  section: ['h2', 'h3', 'h4'],
  card: ['h3', 'h4'],
  article: ['h1', 'h2', 'h3', 'h4'],
}

/**
 * Best practices for heading structure
 */
export const headingBestPractices = {
  page: {
    description: 'Each page should have exactly one h1',
    structure: ['h1 (page title)', 'h2 (main sections)', 'h3 (subsections)'],
  },
  section: {
    description: 'Sections should start with h2',
    structure: ['h2 (section title)', 'h3 (subsection)', 'h4 (sub-subsection)'],
  },
  card: {
    description: 'Cards should use h3 or h4 for titles',
    structure: ['h3 (card title)', 'h4 (card subtitle)'],
  },
}

