/**
 * Component Variant System
 * 
 * Defines component variants using class-variance-authority (CVA).
 * This ensures consistent styling across all components.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { tokens } from './tokens';

// ============================================================================
// Button Variants
// ============================================================================

export const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Standard variants
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        
        // Space/Cosmic theme variants
        space: 'bg-gradient-to-r from-space-cyan/20 to-space-blue/40 border border-space-cyan text-space-white hover:from-space-cyan/40 hover:to-space-blue/60 hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] transition-all duration-300',
        cosmic: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl',
        
        // Glassmorphism variants
        glass: 'backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 text-white hover:bg-white/20 dark:hover:bg-white/10 shadow-md hover:shadow-lg',
        glassPrimary: 'backdrop-blur-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 border border-transparent text-white hover:from-blue-700/90 hover:to-purple-700/90 shadow-lg hover:shadow-xl',
      },
      size: {
        sm: 'h-9 rounded-md px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

// ============================================================================
// Card Variants
// ============================================================================

export const cardVariants = cva(
  // Base styles
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        space: 'bg-space-blue/40 backdrop-blur-xl border-space-cyan/20 text-space-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] hover:border-space-cyan transition-all duration-500',
        cosmic: 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl border-purple-500/20 text-white',
        glass: 'backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20 shadow-md',
        glassPremium: 'backdrop-blur-2xl bg-white/15 dark:bg-white/10 border-white/30 shadow-lg',
        elevated: 'shadow-lg hover:shadow-xl transition-shadow',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export type CardVariantProps = VariantProps<typeof cardVariants>;

// ============================================================================
// Input Variants
// ============================================================================

export const inputVariants = cva(
  // Base styles
  'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        space: 'border-space-cyan/30 bg-space-blue/20 text-space-white placeholder:text-space-cyan/50 focus:border-space-cyan focus:ring-space-cyan/50',
        glass: 'backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20',
      },
      size: {
        sm: 'h-9 px-2 text-xs',
        default: 'h-10 px-3',
        lg: 'h-11 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type InputVariantProps = VariantProps<typeof inputVariants>;

// ============================================================================
// Badge/Chip Variants
// ============================================================================

export const badgeVariants = cva(
  // Base styles
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        space: 'border-space-cyan/30 bg-space-cyan/10 text-space-cyan',
        cosmic: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
        glass: 'backdrop-blur-xl bg-white/10 border-white/20 text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;

// ============================================================================
// Alert Variants
// ============================================================================

export const alertVariants = cva(
  // Base styles
  'relative w-full rounded-lg border p-4',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        success: 'border-green-500/50 text-green-600 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400',
        warning: 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400',
        info: 'border-blue-500/50 text-blue-600 dark:text-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type AlertVariantProps = VariantProps<typeof alertVariants>;

// ============================================================================
// Skeleton Variants
// ============================================================================

export const skeletonVariants = cva(
  // Base styles
  'animate-pulse rounded-md bg-muted',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        space: 'bg-space-blue/30',
        glass: 'bg-white/10',
      },
      size: {
        sm: 'h-4',
        default: 'h-6',
        lg: 'h-8',
        xl: 'h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type SkeletonVariantProps = VariantProps<typeof skeletonVariants>;

// ============================================================================
// Avatar Variants
// ============================================================================

export const avatarVariants = cva(
  // Base styles
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        default: 'h-10 w-10',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export type AvatarVariantProps = VariantProps<typeof avatarVariants>;

// ============================================================================
// Tooltip Variants
// ============================================================================

export const tooltipVariants = cva(
  // Base styles
  'z-50 overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md animate-in fade-in-0 zoom-in-95',
  {
    variants: {
      variant: {
        default: 'bg-popover text-popover-foreground',
        space: 'bg-space-blue/90 backdrop-blur-xl border-space-cyan/30 text-space-white',
        glass: 'backdrop-blur-xl bg-white/20 border-white/20 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type TooltipVariantProps = VariantProps<typeof tooltipVariants>;

// ============================================================================
// Export all variants
// ============================================================================

export const variants = {
  button: buttonVariants,
  card: cardVariants,
  input: inputVariants,
  badge: badgeVariants,
  alert: alertVariants,
  skeleton: skeletonVariants,
  avatar: avatarVariants,
  tooltip: tooltipVariants,
} as const;

export default variants;

