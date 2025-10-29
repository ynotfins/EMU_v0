/**
 * EMU Alerts - Standard Color Palette
 * 
 * ALL colors across the entire application MUST use these constants.
 * DO NOT hardcode colors anywhere else!
 * 
 * This ensures consistent branding and easy theme changes.
 */

export const COLORS = {
  // Primary Brand Colors
  PRIMARY_BLUE: "#007AFF",        // Main blue - buttons, links, active states
  PRIMARY_BLUE_HOVER: "#0051D5",  // Blue hover state
  
  // Alert Colors
  ALERT_RED: "#FF3B30",           // Red - alerts, errors, destructive actions, hearts
  ALERT_RED_HOVER: "#FF2D1F",     // Red hover state
  
  SUCCESS_GREEN: "#34C759",       // Green - success states, toggles ON, confirmations
  SUCCESS_GREEN_HOVER: "#2FB04D", // Green hover state
  
  WARNING_ORANGE: "#FF9500",      // Orange - warnings, notifications, toggle switches
  WARNING_ORANGE_HOVER: "#FF8800", // Orange hover state
  
  // Neutral Colors
  GRAY_DARK: "#1C1C1E",           // Dark text
  GRAY_MEDIUM: "#6B7280",         // Medium gray text
  GRAY_LIGHT: "#E5E7EB",          // Borders, dividers
  GRAY_BG: "#F9FAFB",             // Background
  
  // Text Colors
  TEXT_PRIMARY: "foreground",     // Main text
  TEXT_SECONDARY: "#6B7280",      // Secondary text
  TEXT_MUTED: "#9CA3AF",          // Muted text
  
  // Background Colors
  BG_WHITE: "white",
  BG_GRAY: "#F3F4F6",
  
  // Status Badge Colors
  BADGE_NEW: "#007AFF",
  BADGE_UPDATE: "#6B7280",
  BADGE_HIGH_ALERT: "#FF3B30",
} as const;

/**
 * Tailwind CSS class names for colors
 * Use these in className props
 * 
 * IMPORTANT: Always use these constants instead of hardcoded colors!
 * This ensures consistent color interpretation across the app.
 */
export const COLOR_CLASSES = {
  // Backgrounds
  bgPrimaryBlue: "bg-[#007AFF]",
  bgPrimaryBlueHover: "hover:bg-[#0051D5]",
  
  bgAlertRed: "bg-[#FF3B30]",
  bgAlertRedHover: "hover:bg-[#FF2D1F]",
  
  bgSuccessGreen: "bg-[#34C759]",
  bgSuccessGreenHover: "hover:bg-[#2FB04D]",
  
  bgWarningOrange: "bg-[#FF9500]",
  bgWarningOrangeHover: "hover:bg-[#FF8800]",
  
  bgGrayLight: "bg-[#F2F2F7]",
  bgGrayMedium: "bg-[#6B7280]",
  bgGrayHover: "hover:bg-[#F2F2F7]",
  
  // Text Colors
  textPrimaryBlue: "text-[#007AFF]",
  textAlertRed: "text-[#FF3B30]",
  textSuccessGreen: "text-[#34C759]",
  textWarningOrange: "text-[#FF9500]",
  textGray: "text-[#6B7280]",
  textGrayLight: "text-[#9CA3AF]",
  
  // Border Colors
  borderGrayLight: "border-[#E5E7EB]",
  borderAlertRed: "border-[#FF3B30]",
  borderPrimaryBlue: "border-[#007AFF]",
  
  // Fill Colors (for SVG/icons)
  fillAlertRed: "fill-[#FF3B30]",
  fillSuccessGreen: "fill-[#34C759]",
  fillPrimaryBlue: "fill-[#007AFF]",
} as const;

/**
 * Usage Examples:
 * 
 * 1. In JSX with inline styles:
 *    <div style={{ backgroundColor: COLORS.PRIMARY_BLUE }}>
 * 
 * 2. In Tailwind classes:
 *    <div className={COLOR_CLASSES.bgPrimaryBlue}>
 * 
 * 3. In dynamic classes:
 *    <div className={`text-[${COLORS.ALERT_RED}]`}>
 */

