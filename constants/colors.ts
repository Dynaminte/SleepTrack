export const Colors = {
  // Brand
  primary: '#4f46e5',       // indigo-600
  primaryLight: '#312e81',  // indigo-900 (untuk background aktif)
  primaryText: '#a5b4fc',   // indigo-300 (teks di atas bg gelap)

  // Background (dark theme)
  bg: '#0f172a',            // slate-900
  bgCard: '#1e293b',        // slate-800
  bgBorder: '#334155',      // slate-700

  // Text
  textPrimary: '#f1f5f9',   // slate-100
  textSecondary: '#94a3b8', // slate-400
  textMuted: '#64748b',     // slate-500

  // Status
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',

  // Light theme overrides (opsional)
  light: {
    bg: '#f8fafc',
    bgCard: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
  },
} as const;

// Untuk useThemeColor hook
export const ThemeColors = {
  light: {
    text: Colors.light.textPrimary,
    background: Colors.light.bg,
    tint: Colors.primary,
    icon: Colors.light.textSecondary,
    tabIconDefault: Colors.light.textSecondary,
    tabIconSelected: Colors.primary,
  },
  dark: {
    text: Colors.textPrimary,
    background: Colors.bg,
    tint: Colors.primaryText,
    icon: Colors.textSecondary,
    tabIconDefault: Colors.textSecondary,
    tabIconSelected: Colors.primaryText,
  },
};
