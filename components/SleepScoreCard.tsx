import { StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/colors';

type Props = {
  score: number;
  duration: number;
  date: Date;
};

function scoreLabel(score: number) {
  if (score >= 85) return { text: 'Sangat Baik', color: '#16a34a' };
  if (score >= 70) return { text: 'Baik', color: Colors.primary };
  if (score >= 50) return { text: 'Cukup', color: '#d97706' };
  return { text: 'Kurang', color: '#dc2626' };
}

export function SleepScoreCard({ score, duration, date }: Props) {
  const label = scoreLabel(score);

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <ThemedText style={styles.scoreNum}>{score}</ThemedText>
        <ThemedText style={[styles.scoreLabel, { color: label.color }]}>{label.text}</ThemedText>
      </View>
      <View style={styles.divider} />
      <View style={styles.right}>
        <View style={styles.stat}>
          <ThemedText style={styles.statValue}>{duration.toFixed(1)} jam</ThemedText>
          <ThemedText style={styles.statLabel}>Durasi tidur</ThemedText>
        </View>
        <View style={styles.stat}>
          <ThemedText style={styles.statValue}>
            {format(date, 'EEEE, dd MMM', { locale: id })}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Tanggal</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  left: { alignItems: 'center', minWidth: 72 },
  scoreNum: { fontSize: 42, fontWeight: '800', color: Colors.primary },
  scoreLabel: { fontSize: 13, fontWeight: '600' },
  divider: { width: 1, height: 60, backgroundColor: '#334155' },
  right: { flex: 1, gap: 12 },
  stat: { gap: 2 },
  statValue: { fontWeight: '600', fontSize: 15 },
  statLabel: { color: '#64748b', fontSize: 12 },
});
