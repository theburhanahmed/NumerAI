import type { Config } from "tailwindcss"
import { tokens } from "./src/design-system/tokens"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        sm: tokens.breakpoints.sm,
        md: tokens.breakpoints.md,
        lg: tokens.breakpoints.lg,
        xl: tokens.breakpoints.xl,
        "2xl": tokens.containerWidths["2xl"],
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Space/Cosmic theme colors from design tokens
        space: {
          black: tokens.colors.space.black,
          navy: tokens.colors.space.navy,
          blue: tokens.colors.space.blue,
          cyan: tokens.colors.space.cyan,
          'cyan-glow': tokens.colors.space.cyanGlow,
          white: tokens.colors.space.white,
        },
      },
      spacing: {
        ...Object.fromEntries(
          Object.entries(tokens.spacing).map(([key, value]) => [key, value])
        ),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: tokens.typography.fontFamily.sans,
        serif: tokens.typography.fontFamily.serif,
        mono: tokens.typography.fontFamily.mono,
      },
      fontSize: {
        ...Object.fromEntries(
          Object.entries(tokens.typography.fontSize).map(([key, value]) => [
            key,
            Array.isArray(value) ? value : [value],
          ])
        ),
      },
      fontWeight: tokens.typography.fontWeight,
      lineHeight: tokens.typography.lineHeight,
      letterSpacing: tokens.typography.letterSpacing,
      boxShadow: {
        ...tokens.shadows,
      },
      transitionDuration: {
        ...tokens.durations,
      },
      transitionTimingFunction: {
        ...tokens.easing,
      },
      zIndex: tokens.zIndex,
      backdropBlur: {
        ...Object.fromEntries(
          Object.entries(tokens.backdropBlur).map(([key, value]) => [key, value])
        ),
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 212, 255, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.5)" },
        },
        orbit: {
          from: { transform: "rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg)" },
          to: { transform: "rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg)" },
        },
        planetRotate: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "twinkle": "twinkle 3s infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "orbit": "orbit var(--orbit-duration, 20s) linear infinite",
        "planet-rotate": "planetRotate 60s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config