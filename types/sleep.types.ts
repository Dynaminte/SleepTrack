export type SleepSession = {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  durationHours: number;
  score: number;          // 0-100
  note?: string;
};

export type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor';

export function getSleepQuality(score: number): SleepQuality {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

export const QUALITY_LABELS: Record<SleepQuality, string> = {
  excellent: 'Sangat Baik',
  good: 'Baik',
  fair: 'Cukup',
  poor: 'Kurang',
};
