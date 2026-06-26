import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/colors';

type Alarm = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
};

const DUMMY_ALARMS: Alarm[] = [
  { id: '1', time: '06:00', label: 'Bangun Pagi', enabled: true, days: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'] },
  { id: '2', time: '07:00', label: 'Akhir Pekan', enabled: false, days: ['Sab', 'Min'] },
];

export default function AlarmScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>(DUMMY_ALARMS);

  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ThemedText type="title">Alarm</ThemedText>
          <Pressable style={styles.addBtn}>
            <ThemedText style={styles.addBtnText}>+ Tambah</ThemedText>
          </Pressable>
        </View>

        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.alarmCard}>
              <View style={styles.alarmLeft}>
                <ThemedText style={styles.alarmTime}>{item.time}</ThemedText>
                <ThemedText style={styles.alarmLabel}>{item.label}</ThemedText>
                <ThemedText style={styles.alarmDays}>{item.days.join(' · ')}</ThemedText>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={() => toggleAlarm(item.id)}
                trackColor={{ false: '#334155', true: Colors.primaryLight }}
                thumbColor={item.enabled ? Colors.primary : '#64748b'}
              />
            </View>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 8,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '600' },
  list: { padding: 20, gap: 12 },
  alarmCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alarmLeft: { gap: 2 },
  alarmTime: { fontSize: 32, fontWeight: '700', letterSpacing: 1 },
  alarmLabel: { color: '#94a3b8', fontSize: 14 },
  alarmDays: { color: '#64748b', fontSize: 12, marginTop: 2 },
});
