export const Colors = {
  // Brand
  primary: '#4f46e5',
  primaryLight: '#312e81',
  primaryText: '#a5b4fc',

  light: {
    background: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    switchTrack: '#e2e8f0',
    switchThumb: '#ffffff',
    primaryCard: '#f1f5f9',
    surfaceContainerLow: "#f1f5f9",
    surfaceContainer: "#ffffff",
    surfaceContainerHighest: "#e2e8f0",
    primary: '#4f46e5',
    onPrimary: "#ffffff",
    secondary: '#16a34a',
    white5: "rgba(0, 0, 0, 0.05)",
  },
  dark: {
    background: '#0f172a',
    card: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    switchTrack: '#334155',
    switchThumb: '#64748b',
    primaryCard: 'rgba(181, 196, 255, 0.1)',
    surfaceContainerLow: "#1a1b22",
    surfaceContainer: "#1e1f27",
    surfaceContainerHighest: "#33343c",
    primary: '#b5c4ff',
    onPrimary: "#00287b",
    secondary: '#4ae183',
    white5: "rgba(255, 255, 255, 0.05)",
  }
} as const;

// Untuk useThemeColor hook
export const ThemeColors = {
  light: {
    text: Colors.light.text,
    background: Colors.light.background,
    tint: Colors.light.primary,
    icon: Colors.light.textSecondary,
    tabIconDefault: Colors.light.textSecondary,
    tabIconSelected: Colors.light.primary,
  },
  dark: {
    text: Colors.dark.text,
    background: Colors.dark.background,
    tint: Colors.dark.primary,
    icon: Colors.dark.textSecondary,
    tabIconDefault: Colors.dark.textSecondary,
    tabIconSelected: Colors.dark.primary,
  },
};
