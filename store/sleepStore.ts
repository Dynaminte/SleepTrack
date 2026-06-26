import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SleepSession } from '@/types/sleep.types';

type SleepStore = {
  sleepTarget: number;           // target jam tidur (default 8)
  notificationsEnabled: boolean;
  darkMode: boolean;
  lastSession: SleepSession | null;
  sessions: SleepSession[];

  setSleepTarget: (hours: number) => void;
  setNotifications: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setLastSession: (session: SleepSession) => void;
  setSessions: (sessions: SleepSession[]) => void;
  loadFromStorage: () => Promise<void>;
};

export const useSleepStore = create<SleepStore>((set, get) => ({
  sleepTarget: 8,
  notificationsEnabled: true,
  darkMode: true,
  lastSession: null,
  sessions: [],

  setSleepTarget: async (hours) => {
    set({ sleepTarget: hours });
    await AsyncStorage.setItem('sleepTarget', String(hours));
  },

  setNotifications: async (enabled) => {
    set({ notificationsEnabled: enabled });
    await AsyncStorage.setItem('notificationsEnabled', String(enabled));
  },

  setDarkMode: async (enabled) => {
    set({ darkMode: enabled });
    await AsyncStorage.setItem('darkMode', String(enabled));
  },

  setLastSession: (session) => {
    set({ lastSession: session });
  },

  setSessions: (sessions) => {
    set({ sessions });
  },

  loadFromStorage: async () => {
    const [target, notif, dark] = await Promise.all([
      AsyncStorage.getItem('sleepTarget'),
      AsyncStorage.getItem('notificationsEnabled'),
      AsyncStorage.getItem('darkMode'),
    ]);
    set({
      sleepTarget: target ? parseFloat(target) : 8,
      notificationsEnabled: notif !== 'false',
      darkMode: dark !== 'false',
    });
  },
}));
