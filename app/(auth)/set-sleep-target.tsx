import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/colors';
import { useSleepStore } from '@/store/sleepStore';

const TARGET_OPTIONS = [6, 7, 7.5, 8, 8.5, 9];

export default function SetSleepTargetScreen() {
  const router = useRouter();
  const { setSleepTarget } = useSleepStore();
  const [selected, setSelected] = useState<number>(8);

  const onConfirm = () => {
    setSleepTarget(selected);
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>Target Tidur</ThemedText>
        <ThemedText style={styles.desc}>
          Pilih berapa jam tidur ideal kamu per malam. Ini digunakan untuk menghitung skor kualitas tidur.
        </ThemedText>

        <View style={styles.optionsGrid}>
          {TARGET_OPTIONS.map((hours) => (
            <Pressable
              key={hours}
              style={[styles.option, selected === hours && styles.optionSelected]}
              onPress={() => setSelected(hours)}
            >
              <ThemedText
                style={[styles.optionText, selected === hours && styles.optionTextSelected]}
              >
                {hours} jam
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.button} onPress={onConfirm}>
          <ThemedText style={styles.buttonText}>Simpan &amp; Mulai</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, gap: 20 },
  title: { textAlign: 'center' },
  desc: { textAlign: 'center', color: '#94a3b8', lineHeight: 22 },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginVertical: 8,
  },
  option: {
    width: 100,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionText: { fontSize: 16, color: '#94a3b8' },
  optionTextSelected: { color: Colors.primary, fontWeight: '600' },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
