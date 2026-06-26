import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SleepScoreCard } from '@/components/SleepScoreCard';
import { SleepTimer } from '@/components/SleepTimer';
import { Colors } from '@/constants/colors';
import { useSleepStore } from '@/store/sleepStore';

export default function DashboardScreen() {
  const { lastSession, sleepTarget } = useSleepStore();
  const [isTracking, setIsTracking] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.greeting}>Selamat malam 🌙</ThemedText>
            <ThemedText style={styles.sub}>Target tidur: {sleepTarget} jam</ThemedText>
          </View>

          {/* Skor tidur terakhir */}
          {lastSession && (
            <SleepScoreCard
              score={lastSession.score}
              duration={lastSession.durationHours}
              date={lastSession.endTime}
            />
          )}

          {/* Timer / tombol mulai tidur */}
          <SleepTimer
            isTracking={isTracking}
            onStart={() => setIsTracking(true)}
            onStop={() => setIsTracking(false)}
          />

          {/* Info waktu tidur ideal */}
          <View style={styles.infoCard}>
            <ThemedText style={styles.infoTitle}>Waktu Tidur Ideal</ThemedText>
            <ThemedText style={styles.infoText}>
              Berdasarkan target {sleepTarget} jam, kamu sebaiknya tidur pukul{' '}
              <ThemedText style={styles.highlight}>22:00</ThemedText> untuk bangun pukul{' '}
              <ThemedText style={styles.highlight}>06:00</ThemedText>.
            </ThemedText>
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
  header: { gap: 4 },
  greeting: { fontSize: 26 },
  sub: { color: '#94a3b8' },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  infoTitle: { fontWeight: '600', fontSize: 15 },
  infoText: { color: '#94a3b8', lineHeight: 22 },
  highlight: { color: Colors.primary, fontWeight: '600' },
});
