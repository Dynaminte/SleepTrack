import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SleepChart } from '@/components/SleepChart';
import { Colors } from '@/constants/colors';
import { useSleepStore } from '@/store/sleepStore';
import { getSleepSessions, deleteAllSleepSessions } from '@/services/sleep.service';
import { auth } from '@/lib/firebase';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function StatisticsScreen() {
  const { sessions, setSessions, resetSessions } = useSleepStore();
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Muat ulang sesi tidur dari Firestore setiap kali layar difokuskan
  useFocusEffect(
    useCallback(() => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      setLoading(true);
      getSleepSessions(userId, 7)
        .then((loaded) => setSessions(loaded))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [])
  );

  const handleReset = () => {
    Alert.alert(
      'Reset Statistik Tidur',
      'Semua riwayat tidur selama 7 hari terakhir akan dihapus permanen. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Konfirmasi kedua agar tidak tidak sengaja
            Alert.alert(
              'Konfirmasi Reset',
              'Data yang dihapus tidak bisa dikembalikan. Yakin?',
              [
                { text: 'Tidak', style: 'cancel' },
                {
                  text: 'Ya, Hapus Semua',
                  style: 'destructive',
                  onPress: async () => {
                    const userId = auth.currentUser?.uid;
                    if (!userId) return;
                    setResetting(true);
                    try {
                      await deleteAllSleepSessions(userId);
                      resetSessions(); // Reset state lokal di store
                    } catch (e) {
                      Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus data.');
                    } finally {
                      setResetting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Konversi sesi nyata ke format chart
  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const chartData = sessions.map((s) => ({
    day: dayLabels[new Date(s.startTime).getDay()],
    hours: parseFloat(s.durationHours.toFixed(1)),
    score: s.score,
  }));

  const hasSessions = chartData.length > 0;
  const avgHours = hasSessions
    ? (chartData.reduce((sum, d) => sum + d.hours, 0) / chartData.length).toFixed(1)
    : '0.0';
  const avgScore = hasSessions
    ? Math.round(chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length)
    : 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View>
              <ThemedText type="title" style={styles.title}>Statistik Tidur</ThemedText>
              <ThemedText style={styles.sub}>7 hari terakhir</ThemedText>
            </View>
            <Pressable
              style={[styles.resetBtn, resetting && styles.resetBtnDisabled]}
              onPress={handleReset}
              disabled={resetting || !hasSessions}
            >
              {resetting ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <ThemedText style={styles.resetBtnText}>Reset Data</ThemedText>
              )}
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText style={styles.stateText}>Memuat data...</ThemedText>
            </View>
          ) : !hasSessions ? (
            <View style={styles.centerState}>
              <ThemedText style={styles.emptyIcon}>🌙</ThemedText>
              <ThemedText style={styles.stateText}>Belum ada riwayat tidur</ThemedText>
              <ThemedText style={styles.stateSub}>
                Mulai sesi tidur pertama dari dashboard untuk melihat statistik.
              </ThemedText>
            </View>
          ) : (
            <>
              {/* Summary cards */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <ThemedText style={styles.summaryValue}>{avgHours} jam</ThemedText>
                  <ThemedText style={styles.summaryLabel}>Rata-rata durasi</ThemedText>
                </View>
                <View style={[styles.summaryCard, styles.summaryCardHighlight]}>
                  <ThemedText style={[styles.summaryValue, { color: theme.primary }]}>
                    {avgScore}
                  </ThemedText>
                  <ThemedText style={styles.summaryLabel}>Rata-rata skor</ThemedText>
                </View>
              </View>

              {/* Grafik durasi */}
              <ThemedText style={styles.sectionTitle}>Durasi Tidur (jam)</ThemedText>
              <SleepChart data={chartData} />

              {/* Riwayat */}
              <ThemedText style={styles.sectionTitle}>Riwayat</ThemedText>
              {chartData.slice().reverse().map((item, i) => (
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
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const getStyles = (theme: typeof Colors.light | typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  title: {},
  sub: { color: theme.textSecondary, marginTop: -8 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resetBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  resetBtnDisabled: {
    opacity: 0.4,
  },
  resetBtnText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
    lineHeight: 60,
  },
  stateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  stateSub: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryCardHighlight: { borderWidth: 1, borderColor: theme.primary },
  summaryValue: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  summaryLabel: { color: theme.textSecondary, fontSize: 13 },
  sectionTitle: { fontWeight: '600', fontSize: 16, marginTop: 4 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 10,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  historyDay: { flex: 1, fontWeight: '500' },
  historyHours: { color: theme.textSecondary },
  scoreBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  scoreText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
