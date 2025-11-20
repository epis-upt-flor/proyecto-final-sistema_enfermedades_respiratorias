/**
 * Colores estilo Telegram para RespiCare Mobile
 * Basado en el esquema de colores oscuro de Telegram
 */

// Colores principales estilo Telegram
export const TelegramColors = {
  // Fondos
  background: '#0e1621',        // Fondo principal oscuro
  backgroundSecondary: '#17212b', // Fondo secundario
  backgroundTertiary: '#1e2732', // Fondo terciario
  
  // Mensajes
  userMessage: '#3390ec',      // Azul de mensajes del usuario
  botMessage: '#182229',       // Gris oscuro de mensajes del bot
  messageText: '#ffffff',      // Texto blanco en mensajes
  
  // Acentos
  accent: '#5d9cec',           // Azul claro para acentos
  accentSecondary: '#3390ec',  // Azul principal
  accentHover: '#4a8cd4',      // Azul hover
  
  // Texto
  textPrimary: '#ffffff',      // Texto principal blanco
  textSecondary: '#b1bbc4',    // Texto secundario gris claro
  textTertiary: '#708499',     // Texto terciario gris
  
  // Bordes y divisores
  border: '#1e2732',           // Bordes
  divider: '#1e2732',          // Divisores
  
  // Estados
  success: '#4caf50',          // Verde éxito
  warning: '#ff9800',          // Naranja advertencia
  error: '#f44336',            // Rojo error
  info: '#2196f3',             // Azul información
};

const tintColorLight = TelegramColors.accent;
const tintColorDark = TelegramColors.accent;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: TelegramColors.textPrimary,
    background: TelegramColors.background,
    tint: tintColorDark,
    icon: TelegramColors.textSecondary,
    tabIconDefault: TelegramColors.textSecondary,
    tabIconSelected: tintColorDark,
    // Colores adicionales estilo Telegram
    userMessage: TelegramColors.userMessage,
    botMessage: TelegramColors.botMessage,
    backgroundSecondary: TelegramColors.backgroundSecondary,
    backgroundTertiary: TelegramColors.backgroundTertiary,
    textSecondary: TelegramColors.textSecondary,
    border: TelegramColors.border,
  },
};
