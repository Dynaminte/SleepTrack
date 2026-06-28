import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import { loadAlarms, type AlarmItem } from '@/services/alarm.service';
import * as Haptics from 'expo-haptics';

const SOUND_SOURCES = {
  default: require('@/assets/audio/default.wav'),
  chime: require('@/assets/audio/chime.wav'),
  digital: require('@/assets/audio/digital.wav'),
};

export function useForegroundAlarm() {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkAlarms = async () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();

      // Hanya cek tepat saat detik == 0 agar tidak berulang kali memanggil bunyi dalam menit yang sama
      if (currentSecond !== 0) return;

      const alarms = await loadAlarms();
      const activeAlarms = alarms.filter(a => a.enabled);

      for (const alarm of activeAlarms) {
        const [hourStr, minuteStr] = alarm.time.split(':');
        if (currentHour === parseInt(hourStr, 10) && currentMinute === parseInt(minuteStr, 10)) {
          triggerAlarm(alarm);
          break; // Hindari alarm bentrok
        }
      }
    };

    // Jalankan pengecekan setiap detik
    interval = setInterval(checkAlarms, 1000);

    return () => {
      clearInterval(interval);
      stopAlarm();
    };
  }, []);

  const triggerAlarm = async (alarm: AlarmItem) => {
    try {
      await stopAlarm(); // Stop any currently playing alarm

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      
      const source = (alarm.soundUri && alarm.soundLabel === 'custom') 
        ? { uri: alarm.soundUri } 
        : (SOUND_SOURCES[alarm.soundLabel.toLowerCase() as keyof typeof SOUND_SOURCES] ?? SOUND_SOURCES.default);

      const { sound } = await Audio.Sound.createAsync(source as any, {
        shouldPlay: true,
        volume: 1,
        isLooping: true, // Looping agar berbunyi terus sampai dimatikan
      });
      
      soundRef.current = sound;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      Alert.alert(
        '⏰ Waktunya Bangun!',
        alarm.label,
        [
          {
            text: 'Matikan',
            style: 'cancel',
            onPress: stopAlarm,
          }
        ],
        { cancelable: false }
      );
    } catch (e) {
      console.error('Failed to trigger foreground alarm audio:', e);
      Alert.alert('⏰ Waktunya Bangun!', alarm.label);
    }
  };

  const stopAlarm = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        // ignore
      }
      soundRef.current = null;
    }
  };
}
