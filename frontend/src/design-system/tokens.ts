/**
 * Design System Tokens
 * 
 * Centralized design tokens for the NumerAI platform.
 * These tokens ensure consistency across all components and pages.
 */

// ============================================================================
// Colors
// ============================================================================

export const colors = {
  // Base colors (HSL format for theme support)
  base: {
    background: {
      light: '0 0% 100%',
      dark: '222.2 84% 4.9%',
    },
    foreground: {
      light: '222.2 84% 4.9%',
      dark: '210 40% 98%',
    },
  },

  // Semantic colors
  semantic: {
    primary: {
      DEFAULT: '262.1 83.3% 57.8%',
      foreground: '210 40% 98%',
    },
    secondary: {
      light: '210 40% 96.1%',
      dark: '217.2 32.6% 17.5%',
      foreground: {
        light: '222.2 47.4% 11.2%',
        dark: '210 40% 98%',
      },
    },
    destructive: {
      light: '0 84.2% 60.2%',
      dark: '0 62.8% 30.6%',
      foreground: '210 40% 98%',
    },
    muted: {
      light: '210 40% 96.1%',
      dark: '217.2 32.6% 17.5%',
      foreground: {
        light: '215.4 16.3% 46.9%',
        dark: '215 20.2% 65.1%',
      },
    },
    accent: {
      light: '210 40% 96.1%',
      dark: '217.2 32.6% 17.5%',
      foreground: {
        light: '222.2 47.4% 11.2%',
        dark: '210 40% 98%',
      },
    },
    border: {
      light: '214.3 31.8% 91.4%',
      dark: '217.2 32.6% 17.5%',
    },
    input: {
      light: '214.3 31.8% 91.4%',
      dark: '217.2 32.6% 17.5%',
    },
    ring: '262.1 83.3% 57.8%',
  },

  // Space/Cosmic theme colors (hex for direct use)
  space: {
    black: '#000000',
    navy: '#0a1628',
    blue: '#1a2942',
    cyan: '#00d4ff',
    cyanGlow: 'rgba(0, 212, 255, 0.5)',
    white: '#ffffff',
  },

  // Glassmorphism colors
  glass: {
    card: {
      background: 'rgba(26, 41, 66, 0.4)',
      backgroundPremium: 'rgba(26, 41, 66, 0.6)',
      border: 'rgba(0, 212, 255, 0.2)',
      borderPremium: 'rgba(0, 212, 255, 0.3)',
    },
    glow: {
      purple: 'rgba(139, 92, 246, 0.3)',
      purpleHover: 'rgba(139, 92, 246, 0.5)',
    },
  },
} as const;

// ============================================================================
// Spacing Scale (4px base unit)
// ============================================================================

export const spacing = {
  // Base spacing scale (4px increments)
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  64: '256px',

  // Semantic spacing
  section: {
    sm: '4rem', // 64px
    md: '5rem', // 80px
    lg: '6rem', // 96px
  },
  card: {
    sm: '1rem', // 16px
    md: '1.5rem', // 24px
    lg: '2rem', // 32px
    xl: '3rem', // 48px
  },
} as const;

// ============================================================================
// Typography
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Playfair Display', 'serif'],
    mono: ['ui-monospace', 'monospace'],
  },

  // Font sizes
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }], // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }], // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }], // 72px
    '8xl': ['6rem', { lineHeight: '1' }], // 96px
    '9xl': ['8rem', { lineHeight: '1' }], // 128px
  },

  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  none: '0px',
  sm: '0.125rem', // 2px
  md: 'calc(var(--radius) - 2px)',
  DEFAULT: 'var(--radius)', // 0.5rem / 8px
  lg: 'var(--radius)', // 0.5rem / 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// ============================================================================
// Shadows (Elevation System)
// ============================================================================

export const shadows = {
  // Standard shadows
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  // Space/Cosmic theme shadows
  space: {
    card: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    cardPremium: '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 40px rgba(0, 212, 255, 0.1)',
    cardHover: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 212, 255, 0.2)',
    button: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.5)',
    buttonHover: '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.3), 0 0 90px rgba(0, 212, 255, 0.2)',
  },

  // Glassmorphism shadows
  glass: {
    glow: '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2), 0 0 60px rgba(139, 92, 246, 0.1)',
    glowHover: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3), 0 0 90px rgba(139, 92, 246, 0.2)',
  },
} as const;

// ============================================================================
// Animation Durations
// ============================================================================

export const durations = {
  instant: '0.15s',
  fast: '0.3s',
  normal: '0.5s',
  slow: '0.8s',
  ambient: '8s',
} as const;

// ============================================================================
// Animation Easing Functions
// ============================================================================

export const easing = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// ============================================================================
// Z-Index Scale
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const;

// ============================================================================
// Breakpoints (for reference, actual breakpoints in Tailwind config)
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// Container Widths
// ============================================================================

export const containerWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px',
  full: '100%',
} as const;

// ============================================================================
// Backdrop Blur
// ============================================================================

export const backdropBlur = {
  none: '0',
  sm: '4px',
  DEFAULT: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '40px',
} as const;

// ============================================================================
// Export all tokens
// ============================================================================

export const tokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  durations,
  easing,
  zIndex,
  breakpoints,
  containerWidths,
  backdropBlur,
} as const;

export default tokens;

