import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useSleepStore } from '@/store/sleepStore';
import { useForegroundAlarm } from '@/hooks/useForegroundAlarm';
import { AlarmPopup } from '@/components/AlarmPopup';

// Mencegah splash screen menghilang otomatis sebelum aplikasi siap
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Menjalankan pendeteksi alarm latar depan (untuk Expo Go)
  useForegroundAlarm();

  useEffect(() => {
    // Menyembunyikan splash screen setelah memuat data dari storage
    SplashScreen.hideAsync();
    useSleepStore.getState().loadFromStorage().catch(console.error);
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      {/* Popup alarm muncul di atas semua layar */}
      <AlarmPopup />
    </ThemeProvider>
  );
}