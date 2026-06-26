import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SleepChart } from '@/components/SleepChart';
import { Colors } from '@/constants/colors';

// Data dummy 7 hari terakhir
const DUMMY_DATA = [
  { day: 'Sen', hours: 6.5, score: 72 },
  { day: 'Sel', hours: 7.2, score: 81 },
  { day: 'Rab', hours: 5.8, score: 60 },
  { day: 'Kam', hours: 8.0, score: 90 },
  { day: 'Jum', hours: 7.5, score: 85 },
  { day: 'Sab', hours: 9.0, score: 95 },
  { day: 'Min', hours: 6.0, score: 65 },
];

export default function StatisticsScreen() {
  const avgHours = (DUMMY_DATA.reduce((s, d) => s + d.hours, 0) / DUMMY_DATA.length).toFixed(1);
  const avgScore = Math.round(DUMMY_DATA.reduce((s, d) => s + d.score, 0) / DUMMY_DATA.length);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.title}>Statistik Tidur</ThemedText>
          <ThemedText style={styles.sub}>7 hari terakhir</ThemedText>

          {/* Summary cards */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryValue}>{avgHours} jam</ThemedText>
              <ThemedText style={styles.summaryLabel}>Rata-rata durasi</ThemedText>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardHighlight]}>
              <ThemedText style={[styles.summaryValue, { color: Colors.primary }]}>
                {avgScore}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Rata-rata skor</ThemedText>
            </View>
          </View>

          {/* Grafik durasi */}
          <ThemedText style={styles.sectionTitle}>Durasi Tidur (jam)</ThemedText>
          <SleepChart data={DUMMY_DATA} />

          {/* Riwayat */}
          <ThemedText style={styles.sectionTitle}>Riwayat</ThemedText>
          {DUMMY_DATA.slice().reverse().map((item, i) => (
            <View key={i} style={styles.historyRow}>
              <ThemedText style={styles.historyDay}>{item.day}</ThemedText>
              <ThemedText style={styles.historyHours}>{item.hours} jam</ThemedText>
              <View
                style={[
                  styles.scoreBadge,
                  { backgroundColor: item.score >= 80 ? '#14532d' : '#7f1d1d' },
                ]}
              >
                <ThemedText style={styles.scoreText}>{item.score}</ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 16 },
  title: {},
  sub: { color: '#64748b', marginTop: -8 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  summaryCardHighlight: { borderWidth: 1, borderColor: Colors.primary },
  summaryValue: { fontSize: 24, fontWeight: '700' },
  summaryLabel: { color: '#64748b', fontSize: 13 },
  sectionTitle: { fontWeight: '600', fontSize: 16, marginTop: 4 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  historyDay: { flex: 1, fontWeight: '500' },
  historyHours: { color: '#94a3b8' },
  scoreBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  scoreText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
