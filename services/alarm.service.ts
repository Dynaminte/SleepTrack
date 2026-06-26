import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const isExpoGo = Platform.OS === 'ios' || Platform.OS === 'android';
let hasNotificationSupport = !isExpoGo;

export type AlarmItem = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
  soundEnabled: boolean;
  soundLabel: string;
  soundUri?: string;
};

const STORAGE_KEY = 'sleeptrack_alarms';

export async function saveAlarms(alarms: AlarmItem[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
}

export async function loadAlarms(): Promise<AlarmItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [
      {
        id: '1',
        time: '06:00',
        label: 'Bangun Pagi',
        enabled: true,
        days: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'],
        soundEnabled: true,
        soundLabel: 'Default',
      },
    ];
  }

  try {
    return JSON.parse(raw) as AlarmItem[];
  } catch {
    return [];
  }
}

export async function scheduleAlarm(alarm: AlarmItem) {
  if (!alarm.enabled) return;
  if (!hasNotificationSupport) return;

  try {
    const [hour, minute] = alarm.time.split(':').map(Number);
    const now = new Date();
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    const trigger = new Date(next);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'SleepTrack Alarm',
        body: alarm.label,
        sound: alarm.soundEnabled ? 'default' : undefined,
      },
      trigger: Platform.OS === 'android' ? { hour, minute, repeats: true } : trigger,
    });
  } catch {
    if (isExpoGo) {
      console.warn('Alarm notification is not fully supported in Expo Go; use a development build for full behavior.');
    }
  }
}

export async function cancelAllAlarms() {
  if (!hasNotificationSupport) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore in unsupported environments
  }
}
