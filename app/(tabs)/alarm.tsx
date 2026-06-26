import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/colors';
import {
  cancelAllAlarms,
  loadAlarms,
  saveAlarms,
  scheduleAlarm,
  type AlarmItem,
} from '@/services/alarm.service';

const SOUND_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Chime', value: 'chime' },
  { label: 'Digital', value: 'digital' },
  { label: 'Pilih file dari perangkat', value: 'custom' },
];

const PREVIEW_SOURCES = {
  default: require('@/assets/audio/default.wav'),
  chime: require('@/assets/audio/chime.wav'),
  digital: require('@/assets/audio/digital.wav'),
} as const;

export default function AlarmScreen() {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [draftLabel, setDraftLabel] = useState('Alarm');
  const [draftTime, setDraftTime] = useState('06:00');
  const [selectedSound, setSelectedSound] = useState('default');
  const [selectedSoundLabel, setSelectedSoundLabel] = useState('Default');
  const [selectedSoundUri, setSelectedSoundUri] = useState<string | undefined>();
  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
  const [previewStatus, setPreviewStatus] = useState('Belum diputar');

  useEffect(() => {
    loadAlarms().then((loaded) => setAlarms(loaded));
  }, []);

  useEffect(() => {
    return () => {
      previewSound?.unloadAsync().catch(() => undefined);
    };
  }, [previewSound]);

  const saveAndSync = async (next: AlarmItem[]) => {
    setAlarms(next);
    await saveAlarms(next);
    await cancelAllAlarms();
    for (const alarm of next.filter((item) => item.enabled)) {
      await scheduleAlarm(alarm);
    }
  };

  const toggleAlarm = async (id: string) => {
    const next = alarms.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item));
    await saveAndSync(next);
  };

  const pickSoundFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedSound('custom');
        setSelectedSoundLabel(result.assets[0].name || 'File audio');
        setSelectedSoundUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Gagal', 'Tidak bisa membuka pemilih file audio.');
    }
  };

  const addAlarm = async () => {
    if (!draftLabel.trim()) {
      Alert.alert('Validasi', 'Nama alarm wajib diisi.');
      return;
    }

    const newAlarm: AlarmItem = {
      id: Date.now().toString(),
      time: draftTime,
      label: draftLabel.trim(),
      enabled: true,
      days: ['Setiap hari'],
      soundEnabled: true,
      soundLabel: selectedSoundLabel,
      soundUri: selectedSoundUri,
    };

    const next = [newAlarm, ...alarms];
    await saveAndSync(next);
    setShowModal(false);
    setDraftLabel('Alarm');
    setDraftTime('06:00');
    setSelectedSound('default');
    setSelectedSoundLabel('Default');
    setSelectedSoundUri(undefined);
  };

  const deleteAlarm = async (id: string) => {
    Alert.alert('Hapus alarm', 'Yakin ingin menghapus alarm ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const next = alarms.filter((item) => item.id !== id);
          await saveAndSync(next);
        },
      },
    ]);
  };

  const stopPreviewSound = async () => {
    if (previewSound) {
      try {
        await previewSound.stopAsync();
        await previewSound.unloadAsync();
      } catch {
        // ignore
      }
      setPreviewSound(null);
    }
    setPreviewStatus('Dihentikan');
  };

  const playPreviewSound = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await stopPreviewSound();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });

      const source =
        selectedSound === 'custom' && selectedSoundUri
          ? { uri: selectedSoundUri }
          : (PREVIEW_SOURCES[selectedSound as keyof typeof PREVIEW_SOURCES] ?? PREVIEW_SOURCES.default);

      const { sound } = await Audio.Sound.createAsync(source as any, {
        shouldPlay: true,
        volume: 1,
      });
      setPreviewSound(sound);
      setPreviewStatus('Memutar preview...');
    } catch {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      } catch {
        // ignore
      }
      setPreviewSound(null);
      setPreviewStatus('Preview tidak bisa diputar di perangkat ini');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ThemedText type="title">Alarm</ThemedText>
          <Pressable style={styles.addBtn} onPress={() => setShowModal(true)}>
            <ThemedText style={styles.addBtnText}>+ Tambah</ThemedText>
          </Pressable>
        </View>

        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.alarmCard}
              onLongPress={() => deleteAlarm(item.id)}
              delayLongPress={450}
            >
              <View style={styles.alarmLeft}>
                <ThemedText style={styles.alarmTime}>{item.time}</ThemedText>
                <ThemedText style={styles.alarmLabel}>{item.label}</ThemedText>
                <ThemedText style={styles.alarmDays}>{item.days.join(' · ')}</ThemedText>
                <ThemedText style={styles.alarmSound}>Suara: {item.soundLabel}</ThemedText>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={() => toggleAlarm(item.id)}
                trackColor={{ false: '#334155', true: Colors.primaryLight }}
                thumbColor={item.enabled ? Colors.primary : '#64748b'}
              />
            </Pressable>
          )}
        />

        <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle}>Atur Alarm</ThemedText>

              <TextInput
                value={draftLabel}
                onChangeText={setDraftLabel}
                placeholder="Nama alarm"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />

              <TextInput
                value={draftTime}
                onChangeText={setDraftTime}
                placeholder="HH:MM"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />

              <ThemedText style={styles.sectionLabel}>Pilih suara alarm</ThemedText>
              {SOUND_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[styles.soundOption, selectedSound === option.value && styles.soundOptionActive]}
                  onPress={() => {
                    if (option.value === 'custom') {
                      pickSoundFile();
                    } else {
                      setSelectedSound(option.value);
                      setSelectedSoundLabel(option.label);
                      setSelectedSoundUri(undefined);
                    }
                  }}
                >
                  <ThemedText>{option.label}</ThemedText>
                </Pressable>
              ))}

              <View style={styles.previewRow}>
                <Pressable style={styles.previewBtn} onPress={playPreviewSound}>
                  <ThemedText style={styles.previewBtnText}>▶ Coba suara</ThemedText>
                </Pressable>
                <Pressable style={styles.stopBtn} onPress={stopPreviewSound}>
                  <ThemedText style={styles.stopBtnText}>■ Stop</ThemedText>
                </Pressable>
              </View>
              <ThemedText style={styles.previewStatus}>{previewStatus}</ThemedText>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <ThemedText style={styles.cancelBtnText}>Batal</ThemedText>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={addAlarm}>
                  <ThemedText style={styles.saveBtnText}>Simpan</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  alarmLeft: { gap: 2, flex: 1 },
  alarmTime: { fontSize: 32, fontWeight: '700', letterSpacing: 1 },
  alarmLabel: { color: '#94a3b8', fontSize: 14 },
  alarmDays: { color: '#64748b', fontSize: 12, marginTop: 2 },
  alarmSound: { color: '#64748b', fontSize: 12, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
  },
  modalCard: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 10,
  },
  modalTitle: { fontSize: 18, marginBottom: 6 },
  sectionLabel: { color: '#94a3b8', marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e2e8f0',
  },
  soundOption: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  soundOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: '#1e293b',
  },
  previewRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  previewBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  previewBtnText: { color: '#fff', fontWeight: '600' },
  previewStatus: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  stopBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#334155',
  },
  stopBtnText: { color: '#fff', fontWeight: '600' },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#334155',
  },
  cancelBtnText: { color: '#fff' },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  saveBtnText: { color: '#fff', fontWeight: '600' },
});
