import { useRef, useState } from 'react';
import { auth } from '@/lib/firebase';
import { saveSleepSession, calculateSleepScore } from '@/services/sleep.service';
import { useSleepStore } from '@/store/sleepStore';

export function useSleepSession() {
  const [isTracking, setIsTracking] = useState(false);
  const startTimeRef = useRef<Date | null>(null);
  const { sleepTarget, setLastSession } = useSleepStore();

  const startSleep = () => {
    startTimeRef.current = new Date();
    setIsTracking(true);
  };

  const stopSleep = async () => {
    if (!startTimeRef.current) return;

    const endTime = new Date();
    const startTime = startTimeRef.current;
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    const startHour = startTime.getHours();
    const score = calculateSleepScore(durationHours, sleepTarget, startHour);

    setIsTracking(false);

    const session = {
      userId: auth.currentUser?.uid ?? '',
      startTime,
      endTime,
      durationHours,
      score,
    };

    setLastSession({ ...session, id: '' });

    // Simpan ke Firestore jika user login
    if (auth.currentUser) {
      await saveSleepSession(auth.currentUser.uid, session);
    }
  };

  return { isTracking, startSleep, stopSleep };
}
