import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SleepScoreCard } from '@/components/SleepScoreCard';
import { SleepTimer } from '@/components/SleepTimer';
import { Colors } from '@/constants/colors';
import { useSleepStore } from '@/store/sleepStore';
import { useSleepSession } from '@/hooks/useSleepSession';

export default function DashboardScreen() {
  const { lastSession, sleepTarget } = useSleepStore();
  const { isTracking, startSleep, stopSleep } = useSleepSession();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View>
                <ThemedText type="title" style={styles.greeting}>Selamat malam 🌙</ThemedText>
                <ThemedText style={styles.sub}>Target tidur kamu {sleepTarget} jam setiap hari</ThemedText>
              </View>
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>SleepTrack</ThemedText>
              </View>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.statBox}>
                <ThemedText style={styles.statLabel}>Durasi</ThemedText>
                <ThemedText style={styles.statValue}>{lastSession?.durationHours?.toFixed(1) ?? '0.0'}h</ThemedText>
              </View>
              <View style={styles.statBox}>
                <ThemedText style={styles.statLabel}>Skor</ThemedText>
                <ThemedText style={styles.statValue}>{lastSession?.score ?? '0'}</ThemedText>
              </View>
            </View>
          </View>

          {lastSession && (
            <SleepScoreCard
              score={lastSession.score}
              duration={lastSession.durationHours}
              date={lastSession.endTime}
            />
          )}

          <SleepTimer
            isTracking={isTracking}
            onStart={startSleep}
            onStop={stopSleep}
          />

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <ThemedText type="defaultSemiBold">Waktu Tidur Ideal</ThemedText>
              <ThemedText style={styles.sectionHint}>Rekomendasi</ThemedText>
            </View>
            <ThemedText style={styles.infoText}>
              Berdasarkan target {sleepTarget} jam, kamu sebaiknya tidur pukul{' '}
              <ThemedText style={styles.highlight}>22:00</ThemedText> untuk bangun pukul{' '}
              <ThemedText style={styles.highlight}>06:00</ThemedText>.
            </ThemedText>
          </View>

          <View style={styles.quickGrid}>
            <View style={styles.quickCard}>
              <ThemedText style={styles.quickTitle}>Alarm</ThemedText>
              <ThemedText style={styles.quickText}>Atur jam bangun</ThemedText>
            </View>
            <View style={styles.quickCard}>
              <ThemedText style={styles.quickTitle}>Saran</ThemedText>
              <ThemedText style={styles.quickText}>Tips kesehatan tidur</ThemedText>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 16 },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 18,
    gap: 16,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { fontSize: 26, color: '#f8fafc' },
  sub: { color: '#94a3b8', marginTop: 4 },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  heroStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 12,
  },
  statLabel: { color: '#94a3b8', fontSize: 12 },
  statValue: { color: '#f8fafc', fontSize: 20, fontWeight: '700', marginTop: 4 },
  sectionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHint: { color: '#64748b', fontSize: 12 },
  infoText: { color: '#94a3b8', lineHeight: 22 },
  highlight: { color: Colors.primary, fontWeight: '600' },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  quickTitle: { fontWeight: '600', color: '#f8fafc' },
  quickText: { color: '#94a3b8', fontSize: 13 },
});