// LiteDaemon Brand Colors
// Use these tokens everywhere in our custom UI (payment gate, license screen, etc.)
// Do NOT use random colors — always reference these.

export const brand = {
  // Primary blue (matches the icon)
  primary: '#3D5AFE',
  primaryDark: '#2541E8',
  primaryLight: '#6B80FF',

  // Backgrounds
  bgDark: '#0F0F12',
  bgCard: '#1A1A24',
  bgSurface: '#22222F',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted: '#606078',

  // Status
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',

  // Border
  border: '#2E2E40',
  borderHover: '#3D5AFE',
} as const;

export type BrandColor = keyof typeof brand;
