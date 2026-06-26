import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeColors } from '@/constants/colors';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof ThemeColors.light & keyof typeof ThemeColors.dark
) {
  const theme = useColorScheme() ?? 'dark';
  const colorFromProps = props[theme];
  if (colorFromProps) return colorFromProps;
  return ThemeColors[theme][colorName];
}
