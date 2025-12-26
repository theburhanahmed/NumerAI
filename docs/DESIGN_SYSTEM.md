# NumerAI Design System

## Overview

The NumerAI design system provides a unified, consistent foundation for building user interfaces. It consolidates the cosmic, space, and glassmorphism themes into a single, token-based system.

## Design Tokens

### Colors

The design system uses a semantic color palette that supports both light and dark modes.

#### Base Colors
- `background`: Main background color
- `foreground`: Primary text color
- `card`: Card background color
- `border`: Border color

#### Semantic Colors
- `primary`: Primary brand color (purple)
- `secondary`: Secondary color
- `destructive`: Error/danger color (red)
- `muted`: Muted text/background
- `accent`: Accent color

#### Space/Cosmic Theme Colors
- `space.black`: #000000
- `space.navy`: #0a1628
- `space.blue`: #1a2942
- `space.cyan`: #00d4ff
- `space.white`: #ffffff

### Spacing

Spacing uses a 4px base unit system:

```typescript
spacing: {
  0: '0px',
  1: '4px',
  2: '8px',
  4: '16px',
  6: '24px',
  8: '32px',
  // ... up to 64: '256px'
}
```

Semantic spacing:
- `section.sm`: 4rem (64px)
- `section.md`: 5rem (80px)
- `card.sm`: 1rem (16px)
- `card.md`: 1.5rem (24px)

### Typography

#### Font Families
- **Sans**: Inter (for body text)
- **Serif**: Playfair Display (for headings)
- **Mono**: System monospace

#### Font Sizes
- `xs`: 0.75rem (12px)
- `sm`: 0.875rem (14px)
- `base`: 1rem (16px)
- `lg`: 1.125rem (18px)
- `xl`: 1.25rem (20px)
- `2xl`: 1.5rem (24px)
- `3xl`: 1.875rem (30px)
- `4xl`: 2.25rem (36px)
- `5xl`: 3rem (48px)

#### Font Weights
- `light`: 300
- `normal`: 400
- `medium`: 500
- `semibold`: 600
- `bold`: 700
- `extrabold`: 800
- `black`: 900

### Shadows

Elevation system with multiple levels:
- `sm`: Subtle shadow
- `default`: Standard shadow
- `md`: Medium shadow
- `lg`: Large shadow
- `xl`: Extra large shadow
- `2xl`: Maximum shadow

Space theme shadows:
- `space.card`: Card shadow with glow
- `space.button`: Button glow effect

### Animations

#### Durations
- `instant`: 0.15s
- `fast`: 0.3s
- `normal`: 0.5s
- `slow`: 0.8s
- `ambient`: 8s

#### Easing Functions
- `easeInOut`: cubic-bezier(0.4, 0, 0.2, 1)
- `smooth`: cubic-bezier(0.4, 0, 0.2, 1)

## Component Variants

### Button Variants

```typescript
<BaseButton variant="default" />      // Standard button
<BaseButton variant="space" />         // Space theme button
<BaseButton variant="cosmic" />       // Cosmic theme button
<BaseButton variant="glass" />        // Glassmorphism button
<BaseButton variant="outline" />      // Outlined button
<BaseButton variant="ghost" />        // Ghost button
```

### Card Variants

```typescript
<BaseCard variant="default" />        // Standard card
<BaseCard variant="space" />          // Space theme card
<BaseCard variant="cosmic" />         // Cosmic theme card
<BaseCard variant="glass" />         // Glassmorphism card
<BaseCard variant="glassPremium" />  // Premium glass card
```

### Input Variants

```typescript
<BaseInput variant="default" />       // Standard input
<BaseInput variant="space" />        // Space theme input
<BaseInput variant="glass" />        // Glassmorphism input
```

## Usage Guidelines

### Do's

✅ Use design tokens for all colors, spacing, and typography
✅ Use base components (BaseButton, BaseCard, BaseInput) as foundation
✅ Apply variants consistently across the application
✅ Support dark mode for all components
✅ Use semantic HTML and ARIA labels
✅ Test components on mobile devices

### Don'ts

❌ Don't use hardcoded colors or spacing values
❌ Don't create new component variants without adding to the design system
❌ Don't mix design systems (cosmic, space, glass) inconsistently
❌ Don't skip accessibility features
❌ Don't ignore mobile responsiveness

## Component Architecture

### Base Components
Located in `frontend/src/components/base/`:
- `BaseButton`: Foundation for all buttons
- `BaseCard`: Foundation for all cards
- `BaseInput`: Foundation for all inputs

### Layout Components
Located in `frontend/src/components/layout/`:
- `Container`: Consistent content width
- `Spacer`: Consistent spacing

### Feature Components
Organized by feature area:
- `navigation/`: Navigation components
- `onboarding/`: Onboarding components
- `loading/`: Loading states
- `empty/`: Empty states
- `feedback/`: Success/error messages
- `engagement/`: Engagement features
- `social/`: Social sharing
- `trust/`: Trust indicators
- `monetization/`: Monetization components
- `charts/`: Data visualizations
- `mobile/`: Mobile-specific components
- `pwa/`: PWA components

## Migration Guide

When migrating existing components:

1. Import base components from `@/components/base`
2. Replace custom styling with design system variants
3. Use design tokens for colors and spacing
4. Ensure dark mode support
5. Add proper TypeScript types
6. Test on mobile devices

## Examples

### Button Example

```tsx
import { BaseButton } from '@/components/base/BaseButton'

<BaseButton variant="space" size="lg" onClick={handleClick}>
  Click Me
</BaseButton>
```

### Card Example

```tsx
import { BaseCard, BaseCardHeader, BaseCardContent } from '@/components/base/BaseCard'

<BaseCard variant="space" padding="lg">
  <BaseCardHeader>
    <h3>Card Title</h3>
  </BaseCardHeader>
  <BaseCardContent>
    Card content here
  </BaseCardContent>
</BaseCard>
```

## Resources

- Design Tokens: `frontend/src/design-system/tokens.ts`
- Component Variants: `frontend/src/design-system/variants.ts`
- Base Components: `frontend/src/components/base/`

