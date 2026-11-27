/**
 * AdaptSec Light Enterprise Design Tokens
 * Reference feel: Okta, Stripe Dashboard, Atlassian, Workday, KnowBe4.
 * Calm, dense, trustworthy. Light theme only.
 */
export const DESIGN_TOKENS = {
  colors: {
    bgCanvas: "#F6F7F9",
    bgSurface: "#FFFFFF",
    bgSubtle: "#F0F2F5",
    border: "#E2E5EA",
    borderStrong: "#CBD2D9",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
    brandPrimary: "#1E3A8A", // Deep Indigo-Blue
    brandPrimaryHover: "#172554",
    brandTint: "#EFF6FF",
    brandBorder: "#BFDBFE",
    semantic: {
      danger: "#DC2626",
      dangerBg: "#FEF2F2",
      dangerBorder: "#FECACA",
      warning: "#D97706",
      warningBg: "#FFFBEB",
      warningBorder: "#FDE68A",
      success: "#15803D",
      successBg: "#F0FDF4",
      successBorder: "#BBF7D0",
      info: "#1D4ED8",
      infoBg: "#EFF6FF",
      infoBorder: "#BFDBFE",
    },
  },
  radius: {
    sm: "4px",
    md: "6px",
    lg: "8px",
  },
  shadows: {
    card: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
    popover: "0 4px 12px -2px rgba(15, 23, 42, 0.08)",
  },
} as const;
