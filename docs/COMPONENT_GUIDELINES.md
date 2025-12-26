# Component Guidelines

## Component Structure

All components should follow this structure:

```tsx
/**
 * ComponentName Component
 * 
 * Brief description of what the component does.
 */

'use client' // If using client-side features

import * as React from "react"
import { BaseButton } from "@/components/base/BaseButton"
import { cn } from "@/lib/utils"

export interface ComponentNameProps {
  // Props definition
}

export function ComponentName({
  // Destructured props
}: ComponentNameProps) {
  // Component logic
  
  return (
    // JSX
  )
}
```

## Best Practices

### 1. Use Base Components

Always use base components as the foundation:

```tsx
// ✅ Good
import { BaseButton } from "@/components/base/BaseButton"
<BaseButton variant="space" size="lg">Click</BaseButton>

// ❌ Bad
<button className="custom-styles">Click</button>
```

### 2. Support Dark Mode

All components should work in both light and dark modes:

```tsx
// Use semantic colors
className="bg-background text-foreground"
// Not hardcoded colors
className="bg-white text-black"
```

### 3. Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers

### 4. TypeScript

- Always define prop interfaces
- Use proper types
- Export types for reuse

### 5. Responsive Design

- Mobile-first approach
- Test on multiple screen sizes
- Use responsive utilities

### 6. Performance

- Use React.memo for expensive components
- Lazy load heavy components
- Optimize images

## Component Patterns

### Controlled vs Uncontrolled

Use controlled components when you need to manage state:

```tsx
const [value, setValue] = useState('')
<BaseInput value={value} onChange={(e) => setValue(e.target.value)} />
```

### Composition

Prefer composition over configuration:

```tsx
<BaseCard>
  <BaseCardHeader>
    <BaseCardTitle>Title</BaseCardTitle>
  </BaseCardHeader>
  <BaseCardContent>
    Content
  </BaseCardContent>
</BaseCard>
```

## File Organization

```
components/
  feature-name/
    ComponentName.tsx
    ComponentName.test.tsx
    index.ts
```

## Testing

- Unit tests for component logic
- Integration tests for user flows
- Accessibility tests
- Visual regression tests

