import { create } from 'zustand';
import type { AlarmItem } from '@/services/alarm.service';

type AlarmPopupStore = {
  visible: boolean;
  alarm: AlarmItem | null;
  showAlarm: (alarm: AlarmItem) => void;
  hideAlarm: () => void;
};

export const useAlarmPopupStore = create<AlarmPopupStore>((set) => ({
  visible: false,
  alarm: null,
  showAlarm: (alarm) => set({ visible: true, alarm }),
  hideAlarm: () => set({ visible: false, alarm: null }),
}));
