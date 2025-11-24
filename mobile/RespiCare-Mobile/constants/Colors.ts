/**
 * Colores modernos RespiCare Mobile
 * Basado en el tema CSS con colores oklch convertidos
 * Tema moderno con tonos teal/cyan suaves, glassmorphism y gradientes
 */

// Colores principales - Tema RespiCare basado en CSS
export const RespiCareColors = {
  // Fondos - Modo claro (oklch(0.98 0.01 200))
  light: {
    background: '#f8fafc',           // oklch(0.98 0.01 200) - Cool white
    backgroundSecondary: '#ffffff',  // oklch(1 0 0) - White
    backgroundTertiary: '#f5f7fa',   // Light slate
    card: '#ffffff',                  // oklch(1 0 0) - Card
    cardGlass: 'rgba(255, 255, 255, 0.6)',
  },
  
  // Fondos - Modo oscuro (oklch(0.1 0.02 240))
  dark: {
    background: '#0f172a',          // oklch(0.1 0.02 240) - Darker, cooler background
    backgroundSecondary: '#1e293b', // oklch(0.15 0.04 240) - Card dark
    backgroundTertiary: '#334155',   // Slate 700
    card: '#1e293b',                 // oklch(0.15 0.04 240) - Card
    cardGlass: 'rgba(30, 41, 59, 0.6)',
  },
  
  // Primary - Teal vibrante (oklch(0.55 0.18 195) light, oklch(0.65 0.18 195) dark)
  primary: '#14b8a6',               // oklch(0.55 0.18 195) - Teal primary
  primaryLight: '#2dd4bf',           // oklch(0.65 0.18 195) - Teal brighter for dark mode
  primaryDark: '#0d9488',           // Teal 600
  primaryForeground: '#f8fafc',     // oklch(0.98 0 0) - White text on primary
  primaryGradient: ['#14b8a6', '#06b6d4'], // Teal to Cyan
  
  // Secondary (oklch(0.95 0.03 195) light, oklch(0.2 0.05 240) dark)
  secondary: '#f0f9ff',              // oklch(0.95 0.03 195) - Light cyan
  secondaryForeground: '#0891b2',    // oklch(0.4 0.1 195) - Dark cyan text
  secondaryDark: '#1e293b',          // oklch(0.2 0.05 240) - Dark mode secondary
  
  // Acentos (oklch(0.94 0.04 195) light, oklch(0.25 0.1 240) dark)
  accent: '#f0fdfa',                 // oklch(0.94 0.04 195) - Teal 50
  accentForeground: '#0f766e',       // Teal 700
  accentDark: '#334155',              // oklch(0.25 0.1 240) - Dark mode accent
  
  // Mensajes
  userMessage: '#14b8a6',            // Teal primary
  botMessage: '#1e293b',             // Slate 800
  messageText: '#ffffff',
  
  // Texto
  // Light: oklch(0.2 0.03 200), Dark: oklch(0.98 0.01 200)
  textPrimary: '#0f172a',            // oklch(0.2 0.03 200) - Light mode
  textPrimaryDark: '#f8fafc',       // oklch(0.98 0.01 200) - Dark mode
  textSecondary: '#64748b',          // Slate 500
  textTertiary: '#94a3b8',           // oklch(0.7 0.05 200) - Muted foreground dark
  textMuted: '#cbd5e1',              // Slate 300
  
  // Bordes
  // Light: oklch(0.92 0.02 200), Dark: oklch(0.25 0.05 240)
  border: '#e8f0f5',                 // oklch(0.92 0.02 200) - Light mode
  borderDark: '#334155',             // oklch(0.25 0.05 240) - Dark mode
  borderLight: '#f1f5f9',            // Slate 100
  input: '#e8f0f5',                  // oklch(0.92 0.02 200) - Input border light
  inputDark: '#334155',              // oklch(0.25 0.05 240) - Input border dark
  
  // Estados
  // Destructive: oklch(0.6 0.2 25)
  success: '#10b981',                // Emerald 500
  warning: '#f59e0b',                // Amber 500
  error: '#ef4444',                  // oklch(0.6 0.2 25) - Destructive
  errorForeground: '#f8fafc',        // oklch(0.98 0 0) - White text on error
  info: '#3b82f6',                   // Blue 500
  
  // Chart colors (basados en CSS)
  chart1: '#14b8a6',                 // oklch(0.55 0.18 195) / oklch(0.65 0.15 195) - Teal
  chart2: '#10b981',                 // oklch(0.65 0.2 150) / oklch(0.75 0.15 150) - Green
  chart3: '#3b82f6',                 // oklch(0.6 0.2 250) / oklch(0.7 0.15 250) - Blue
  chart4: '#f59e0b',                 // oklch(0.7 0.2 30) / oklch(0.75 0.15 30) - Orange
  chart5: '#8b5cf6',                 // oklch(0.5 0.2 320) / oklch(0.6 0.15 320) - Purple
  
  // Radius (1.5rem = 24px)
  radius: 24,                         // --radius: 1.5rem
  radiusSm: 20,                       // calc(var(--radius) - 4px)
  radiusMd: 22,                       // calc(var(--radius) - 2px)
  radiusLg: 24,                       // var(--radius)
  radiusXl: 28,                       // calc(var(--radius) + 4px)
};

const tintColorLight = RespiCareColors.primary;
const tintColorDark = RespiCareColors.primary;

export const Colors = {
  light: {
    text: RespiCareColors.textPrimary,              // oklch(0.2 0.03 200)
    background: RespiCareColors.light.background,   // oklch(0.98 0.01 200)
    tint: tintColorLight,
    icon: RespiCareColors.textSecondary,
    tabIconDefault: RespiCareColors.textSecondary,
    tabIconSelected: tintColorLight,
    // Colores adicionales basados en CSS
    primary: RespiCareColors.primary,                // oklch(0.55 0.18 195)
    primaryForeground: RespiCareColors.primaryForeground,
    secondary: RespiCareColors.secondary,            // oklch(0.95 0.03 195)
    secondaryForeground: RespiCareColors.secondaryForeground,
    card: RespiCareColors.light.card,                // oklch(1 0 0)
    cardForeground: RespiCareColors.textPrimary,
    border: RespiCareColors.border,                  // oklch(0.92 0.02 200)
    input: RespiCareColors.input,                    // oklch(0.92 0.02 200)
    textSecondary: RespiCareColors.textSecondary,
    muted: '#f5f7fa',                                // oklch(0.96 0.01 200)
    mutedForeground: RespiCareColors.textSecondary,  // oklch(0.55 0.05 200)
    accent: RespiCareColors.accent,                  // oklch(0.94 0.04 195)
    accentForeground: RespiCareColors.accentForeground,
    destructive: RespiCareColors.error,              // oklch(0.6 0.2 25)
    destructiveForeground: RespiCareColors.errorForeground,
  },
  dark: {
    text: RespiCareColors.textPrimaryDark,           // oklch(0.98 0.01 200)
    background: RespiCareColors.dark.background,     // oklch(0.1 0.02 240)
    tint: tintColorDark,
    icon: RespiCareColors.textTertiary,
    tabIconDefault: RespiCareColors.textTertiary,
    tabIconSelected: tintColorDark,
    // Colores adicionales basados en CSS
    primary: RespiCareColors.primaryLight,           // oklch(0.65 0.18 195) - Brighter for dark
    primaryForeground: RespiCareColors.dark.background, // oklch(0.1 0.05 200)
    secondary: RespiCareColors.secondaryDark,        // oklch(0.2 0.05 240)
    secondaryForeground: RespiCareColors.textPrimaryDark, // oklch(0.98 0.01 200)
    card: RespiCareColors.dark.card,                 // oklch(0.15 0.04 240)
    cardForeground: RespiCareColors.textPrimaryDark,  // oklch(0.98 0.01 200)
    border: RespiCareColors.borderDark,              // oklch(0.25 0.05 240)
    input: RespiCareColors.inputDark,                 // oklch(0.25 0.05 240)
    textSecondary: RespiCareColors.textTertiary,
    muted: RespiCareColors.secondaryDark,             // oklch(0.2 0.05 240)
    mutedForeground: RespiCareColors.textTertiary,    // oklch(0.7 0.05 200)
    accent: RespiCareColors.accentDark,              // oklch(0.25 0.1 240)
    accentForeground: RespiCareColors.textPrimaryDark, // oklch(0.98 0.01 200)
    destructive: RespiCareColors.error,               // oklch(0.6 0.2 25)
    destructiveForeground: RespiCareColors.errorForeground, // oklch(0.98 0 0)
    userMessage: RespiCareColors.userMessage,
    botMessage: RespiCareColors.botMessage,
    backgroundSecondary: RespiCareColors.dark.backgroundSecondary,
    backgroundTertiary: RespiCareColors.dark.backgroundTertiary,
  },
};
