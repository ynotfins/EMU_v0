/**
 * Design Tokens for PA CRM
 * Based on Firebase.com and Apple design principles
 * 
 * Features:
 * - 8px grid system for consistent spacing
 * - Large touch targets (minimum 44px)
 * - Generous whitespace
 * - Clean vector aesthetic
 */

// Spacing Scale (8px grid)
export const spacing = {
  xs: '4px',    // 0.5x
  sm: '8px',    // 1x
  md: '16px',   // 2x
  lg: '24px',   // 3x
  xl: '32px',   // 4x
  '2xl': '48px', // 6x
  '3xl': '64px', // 8x
  '4xl': '96px', // 12x
} as const

// Typography Scale
export const typography = {
  // Font Families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    mono: 'SF Mono, Monaco, Consolas, "Courier New", monospace',
  },
  
  // Font Sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },
  
  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
} as const

// Color Palette
export const colors = {
  // Primary Colors (existing scheme)
  primary: {
    DEFAULT: '#007AFF', // iOS Blue
    hover: '#0051D5',
    active: '#0041A8',
    light: '#E5F2FF',
  },
  
  // Success Colors
  success: {
    DEFAULT: '#34C759', // iOS Green
    hover: '#2FB04D',
    active: '#299441',
    light: '#E8F9EC',
  },
  
  // Warning Colors
  warning: {
    DEFAULT: '#FF9500', // iOS Orange
    hover: '#E68600',
    active: '#CC7700',
    light: '#FFF4E5',
  },
  
  // Danger Colors
  danger: {
    DEFAULT: '#FF3B30', // iOS Red
    hover: '#E6352B',
    active: '#CC2F26',
    light: '#FFE5E3',
  },
  
  // Neutral Colors
  gray: {
    50: '#F9FAFB',
    100: '#F2F2F7', // iOS System Background
    200: '#E5E5EA', // iOS System Gray 6
    300: '#D1D1D6', // iOS System Gray 5
    400: '#C7C7CC', // iOS System Gray 4
    500: '#8E8E93', // iOS System Gray
    600: '#6B7280',
    700: '#4B5563',
    800: '#374151',
    900: '#1F2937',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#FFFFFF',
    elevated: '#FFFFFF',
  },
  
  // Text Colors
  text: {
    primary: '#000000',
    secondary: '#6B7280',
    tertiary: '#8E8E93',
    inverse: '#FFFFFF',
  },
} as const

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '8px',
  DEFAULT: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  full: '9999px',
} as const

// Shadows (subtle, Apple-like)
export const shadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
  DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.06)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)',
  xl: '0 12px 48px rgba(0, 0, 0, 0.08), 0 6px 24px rgba(0, 0, 0, 0.06)',
} as const

// Transitions
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  DEFAULT: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const

// Touch Targets
export const touchTargets = {
  min: '44px', // Apple HIG minimum
  comfortable: '48px',
  large: '56px',
} as const

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
} as const

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Card Styles (Firebase-like)
export const cardStyles = {
  base: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    boxShadow: shadows.DEFAULT,
    border: `1px solid ${colors.gray[200]}`,
    padding: spacing.xl,
  },
  hover: {
    boxShadow: shadows.md,
    transform: 'translateY(-2px)',
    transition: transitions.DEFAULT,
  },
  large: {
    padding: spacing['2xl'],
    borderRadius: borderRadius.lg,
  },
} as const

// Button Styles
export const buttonStyles = {
  // Base styles
  base: {
    minHeight: touchTargets.comfortable,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.DEFAULT,
    transition: transitions.DEFAULT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary.DEFAULT,
    color: colors.text.inverse,
    '&:hover': {
      backgroundColor: colors.primary.hover,
    },
    '&:active': {
      backgroundColor: colors.primary.active,
    },
  },
  
  secondary: {
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    border: `1px solid ${colors.gray[300]}`,
    '&:hover': {
      backgroundColor: colors.gray[100],
    },
    '&:active': {
      backgroundColor: colors.gray[200],
    },
  },
  
  // Sizes
  sizes: {
    small: {
      minHeight: touchTargets.min,
      fontSize: typography.fontSize.sm,
      paddingLeft: spacing.md,
      paddingRight: spacing.md,
    },
    medium: {
      minHeight: touchTargets.comfortable,
      fontSize: typography.fontSize.base,
      paddingLeft: spacing.lg,
      paddingRight: spacing.lg,
    },
    large: {
      minHeight: touchTargets.large,
      fontSize: typography.fontSize.lg,
      paddingLeft: spacing.xl,
      paddingRight: spacing.xl,
    },
  },
} as const

// Input Styles
export const inputStyles = {
  base: {
    minHeight: touchTargets.comfortable,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontSize: typography.fontSize.base,
    borderRadius: borderRadius.DEFAULT,
    border: `1px solid ${colors.gray[300]}`,
    backgroundColor: colors.background.primary,
    transition: transitions.fast,
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary.DEFAULT,
      boxShadow: `0 0 0 3px ${colors.primary.light}`,
    },
  },
} as const

// Icon Sizes (larger for better visibility)
export const iconSizes = {
  xs: '16px',
  sm: '20px',
  DEFAULT: '24px',
  lg: '32px',
  xl: '40px',
  '2xl': '48px',
} as const
