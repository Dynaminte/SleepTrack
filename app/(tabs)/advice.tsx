import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/colors';

type Advice = {
  icon: string;
  title: string;
  body: string;
  category: 'good' | 'warning' | 'info';
};

const ADVICE_LIST: Advice[] = [
  {
    icon: '📵',
    title: 'Kurangi layar sebelum tidur',
    body: 'Hindari menggunakan ponsel, tablet, atau laptop minimal 30 menit sebelum tidur. Cahaya biru dari layar menghambat produksi melatonin.',
    category: 'warning',
  },
  {
    icon: '🌡️',
    title: 'Jaga suhu kamar tetap sejuk',
    body: 'Suhu kamar ideal untuk tidur adalah 18–22°C. Tubuh melepas panas saat tidur, sehingga kamar yang sejuk membantu proses ini.',
    category: 'info',
  },
  {
    icon: '⏰',
    title: 'Tidur & bangun di waktu yang sama',
    body: 'Konsistensi jadwal tidur membantu mengatur jam biologis tubuh. Usahakan jadwal yang sama bahkan di akhir pekan.',
    category: 'good',
  },
  {
    icon: '☕',
    title: 'Batasi kafein setelah jam 14.00',
    body: 'Kafein dapat bertahan dalam darah hingga 6 jam. Hindari kopi, teh, atau minuman berenergi di sore hari.',
    category: 'warning',
  },
  {
    icon: '🧘',
    title: 'Lakukan relaksasi sebelum tidur',
    body: 'Meditasi singkat 5–10 menit, pernapasan dalam, atau peregangan ringan dapat membantu tubuh dan pikiran bersiap untuk tidur.',
    category: 'good',
  },
];

const categoryColor: Record<Advice['category'], string> = {
  good: '#14532d',
  warning: '#7c2d12',
  info: '#1e3a5f',
};

export default function AdviceScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText type="title">Saran Tidur</ThemedText>
          <ThemedText style={styles.sub}>
            Tips untuk meningkatkan kualitas tidurmu
          </ThemedText>

          {ADVICE_LIST.map((advice, i) => (
            <View key={i} style={[styles.card, { borderLeftColor: categoryColor[advice.category] }]}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.icon}>{advice.icon}</ThemedText>
                <ThemedText style={styles.cardTitle}>{advice.title}</ThemedText>
              </View>
              <ThemedText style={styles.cardBody}>{advice.body}</ThemedText>
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
  scroll: { padding: 20, gap: 14 },
  sub: { color: '#64748b', marginTop: -8, marginBottom: 4 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderLeftWidth: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: 22 },
  cardTitle: { fontWeight: '600', fontSize: 15, flex: 1 },
  cardBody: { color: '#94a3b8', lineHeight: 22 },
});
