import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useSleepStore } from '@/store/sleepStore';

export function useColorScheme() {
  const darkMode = useSleepStore((state) => state.darkMode);
  const systemColorScheme = useSystemColorScheme();

  if (typeof darkMode === 'boolean') {
    return darkMode ? 'dark' : 'light';
  }

  return systemColorScheme ?? 'light';
}
