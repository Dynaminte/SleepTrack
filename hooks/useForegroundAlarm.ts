import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

import { loadAlarms, type AlarmItem } from '@/services/alarm.service';
import { useAlarmPopupStore } from '@/store/alarmPopupStore';

const SOUND_SOURCES = {
  default: require('@/assets/audio/default.wav'),
  chime: require('@/assets/audio/chime.wav'),
  digital: require('@/assets/audio/digital.wav'),
};

// Ref global agar bisa diakses dari luar hook (dipanggil oleh AlarmPopup saat dismiss/snooze)
export const alarmSoundRef = { current: null as Audio.Sound | null };

export function useForegroundAlarm() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const { showAlarm } = useAlarmPopupStore();

  // Sync ref global agar AlarmPopup bisa stop suara
  useEffect(() => {
    alarmSoundRef.current = soundRef.current;
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    // Simpan id alarm yang sudah dipicu menit ini agar tidak berulang
    const firedThisMinute = new Set<string>();
    let lastCheckedMinute = -1;

    const checkAlarms = async () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();

      // Hanya panggil check sekali per menit per alarm
      if (currentMinute !== lastCheckedMinute) {
        firedThisMinute.clear();
        lastCheckedMinute = currentMinute;
      }

      const alarms = await loadAlarms();
      const activeAlarms = alarms.filter((a) => a.enabled);

      for (const alarm of activeAlarms) {
        const [hourStr, minuteStr] = alarm.time.split(':');
        const matches =
          currentHour === parseInt(hourStr, 10) &&
          currentMinute === parseInt(minuteStr, 10);

        if (matches && !firedThisMinute.has(alarm.id)) {
          firedThisMinute.add(alarm.id);
          triggerAlarm(alarm);
          break; // Hindari alarm bentrok
        }
      }
    };

    interval = setInterval(checkAlarms, 1000);

    return () => {
      clearInterval(interval);
      stopAlarm();
    };
  }, []);

  const triggerAlarm = async (alarm: AlarmItem) => {
    try {
      await stopAlarm();

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const source =
        alarm.soundUri && alarm.soundLabel === 'custom'
          ? { uri: alarm.soundUri }
          : (SOUND_SOURCES[
              alarm.soundLabel.toLowerCase() as keyof typeof SOUND_SOURCES
            ] ?? SOUND_SOURCES.default);

      const { sound } = await Audio.Sound.createAsync(source as any, {
        shouldPlay: true,
        volume: 1,
        isLooping: true,
      });

      soundRef.current = sound;
      alarmSoundRef.current = sound;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      // Tampilkan modal custom (bukan Alert.alert)
      showAlarm(alarm);
    } catch (e) {
      console.error('Failed to trigger foreground alarm audio:', e);
      // Tetap tampilkan popup meski audio gagal
      showAlarm(alarm);
    }
  };

  const stopAlarm = async () => {
    const sound = soundRef.current;
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch {
        // ignore
      }
      soundRef.current = null;
      alarmSoundRef.current = null;
    }
  };
}

/**
 * Fungsi utilitas untuk menghentikan suara alarm dari luar hook
 * Dipanggil oleh AlarmPopup saat user menekan Matikan atau Tunda
 */
export async function stopAlarmSound() {
  const sound = alarmSoundRef.current;
  if (sound) {
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
    } catch {
      // ignore
    }
    alarmSoundRef.current = null;
  }
}
