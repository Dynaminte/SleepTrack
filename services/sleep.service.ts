import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
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
 * Filter tanggal dilakukan di client untuk menghindari kebutuhan composite index Firestore
 */
export async function getSleepSessions(
  userId: string,
  limitDays = 7
): Promise<SleepSession[]> {
  const since = new Date();
  since.setDate(since.getDate() - limitDays);

  // Query HANYA filter by userId — tidak ada composite index yang diperlukan
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const sessions = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        startTime: (data.startTime as Timestamp).toDate(),
        endTime: (data.endTime as Timestamp).toDate(),
        durationHours: data.durationHours,
        score: data.score,
        note: data.note ?? '',
      } as SleepSession;
    })
    // Filter tanggal di sisi client
    .filter((s) => s.startTime >= since);

  // Sort descending (terbaru duluan) di sisi client
  return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
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

/**
 * Hapus semua sesi tidur milik user dari Firestore (untuk reset statistik)
 */
export async function deleteAllSleepSessions(userId: string): Promise<void> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map((d) => deleteDoc(doc(db, COLLECTION, d.id)));
  await Promise.all(deletePromises);
}
