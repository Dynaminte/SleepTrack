import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SleepSession } from '@/types/sleep.types';

const COLLECTION = 'sleep_sessions';

/**
 * Simpan sesi tidur baru ke Firestore
 */
export async function saveSleepSession(
  userId: string,
  session: Omit<SleepSession, 'id'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...session,
    userId,
    startTime: Timestamp.fromDate(session.startTime),
    endTime: Timestamp.fromDate(session.endTime),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Ambil sesi tidur milik user (default 7 hari terakhir)
 */
export async function getSleepSessions(
  userId: string,
  limitDays = 7
): Promise<SleepSession[]> {
  const since = new Date();
  since.setDate(since.getDate() - limitDays);

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('startTime', '>=', Timestamp.fromDate(since)),
    orderBy('startTime', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      startTime: (data.startTime as Timestamp).toDate(),
      endTime: (data.endTime as Timestamp).toDate(),
      durationHours: data.durationHours,
      score: data.score,
      note: data.note ?? '',
    };
  });
}

/**
 * Hitung skor kualitas tidur (0–100)
 * Berdasarkan: durasi vs target, waktu mulai tidur
 */
export function calculateSleepScore(
  durationHours: number,
  targetHours: number,
  startHour: number // jam mulai tidur (0-23)
): number {
  // Komponen durasi: max 70 poin
  const durationRatio = Math.min(durationHours / targetHours, 1.2);
  const durationScore = Math.round(durationRatio * 70);

  // Komponen waktu mulai: max 30 poin (ideal 21-23)
  let timeScore = 0;
  if (startHour >= 21 && startHour <= 23) timeScore = 30;
  else if (startHour >= 20 || startHour === 0) timeScore = 20;
  else if (startHour >= 1 && startHour <= 2) timeScore = 10;

  return Math.min(durationScore + timeScore, 100);
}
