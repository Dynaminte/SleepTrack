import { useEffect, useState, useMemo } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
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
  const [editingId, setEditingId] = useState<string | null>(null);

  const [draftLabel, setDraftLabel] = useState('Alarm');
  const [draftDate, setDraftDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [selectedSound, setSelectedSound] = useState('default');
  const [selectedSoundLabel, setSelectedSoundLabel] = useState('Default');
  const [selectedSoundUri, setSelectedSoundUri] = useState<string | undefined>();
  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
  const [previewStatus, setPreviewStatus] = useState('Belum diputar');

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const styles = useMemo(() => getStyles(theme), [theme]);

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

  const openAddModal = () => {
    setEditingId(null);
    setDraftLabel('Alarm');
    const now = new Date();
    // Default jam 6 pagi
    now.setHours(6, 0, 0, 0);
    setDraftDate(now);
    setSelectedSound('default');
    setSelectedSoundLabel('Default');
    setSelectedSoundUri(undefined);
    setShowModal(true);
  };

  const openEditModal = (alarm: AlarmItem) => {
    setEditingId(alarm.id);
    setDraftLabel(alarm.label);
    
    // Parse time string back to Date
    const [h, m] = alarm.time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    setDraftDate(date);

    // Set sound selection
    if (alarm.soundUri) {
      setSelectedSound('custom');
    } else {
      const isBuiltin = SOUND_OPTIONS.some(o => o.value === alarm.soundLabel.toLowerCase());
      setSelectedSound(isBuiltin ? alarm.soundLabel.toLowerCase() : 'default');
    }
    
    setSelectedSoundLabel(alarm.soundLabel);
    setSelectedSoundUri(alarm.soundUri);
    setShowModal(true);
  };

  const saveAlarm = async () => {
    if (!draftLabel.trim()) {
      Alert.alert('Validasi', 'Nama alarm wajib diisi.');
      return;
    }

    const timeString = `${draftDate.getHours().toString().padStart(2, '0')}:${draftDate.getMinutes().toString().padStart(2, '0')}`;

    if (editingId) {
      // Update existing alarm
      const next = alarms.map((a) => {
        if (a.id === editingId) {
          return {
            ...a,
            time: timeString,
            label: draftLabel.trim(),
            soundLabel: selectedSoundLabel,
            soundUri: selectedSoundUri,
            enabled: true, // Auto enable when edited
          };
        }
        return a;
      });
      await saveAndSync(next);
    } else {
      // Add new alarm
      const newAlarm: AlarmItem = {
        id: Date.now().toString(),
        time: timeString,
        label: draftLabel.trim(),
        enabled: true,
        days: ['Setiap hari'],
        soundEnabled: true,
        soundLabel: selectedSoundLabel,
        soundUri: selectedSoundUri,
      };
      const next = [newAlarm, ...alarms];
      await saveAndSync(next);
    }

    setShowModal(false);
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

  const formattedTime = `${draftDate.getHours().toString().padStart(2, '0')}:${draftDate.getMinutes().toString().padStart(2, '0')}`;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ThemedText type="title">Alarm</ThemedText>
          <Pressable style={styles.addBtn} onPress={openAddModal}>
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
              onPress={() => openEditModal(item)}
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
                trackColor={{ false: theme.switchTrack, true: theme.primary }}
                thumbColor={item.enabled ? theme.primary : theme.switchThumb}
              />
            </Pressable>
          )}
        />

        <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                  {editingId ? 'Edit Alarm' : 'Atur Alarm Baru'}
                </ThemedText>
                {editingId && (
                  <Pressable onPress={() => { setShowModal(false); deleteAlarm(editingId); }}>
                    <ThemedText style={{color: '#ef4444'}}>Hapus</ThemedText>
                  </Pressable>
                )}
              </View>

              {/* Time Picker Trigger */}
              <ThemedText style={styles.sectionLabel}>Waktu Alarm</ThemedText>
              <Pressable 
                style={styles.timePickerButton} 
                onPress={() => setShowTimePicker(true)}
              >
                <ThemedText style={styles.timePickerText}>{formattedTime}</ThemedText>
              </Pressable>

              {(showTimePicker || Platform.OS === 'ios') && (
                <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : undefined}>
                  <DateTimePicker
                    value={draftDate}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS !== 'ios') setShowTimePicker(false);
                      if (selectedDate) setDraftDate(selectedDate);
                    }}
                    textColor="#fff"
                  />
                </View>
              )}

              <ThemedText style={styles.sectionLabel}>Nama Alarm</ThemedText>
              <TextInput
                value={draftLabel}
                onChangeText={setDraftLabel}
                placeholder="Nama alarm"
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
                <Pressable style={styles.saveBtn} onPress={saveAlarm}>
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

const getStyles = (theme: typeof Colors.light | typeof Colors.dark) => StyleSheet.create({
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
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { color: theme.onPrimary, fontWeight: '600' },
  list: { padding: 20, gap: 12, paddingBottom: 40 },
  alarmCard: {
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
  },
  alarmLeft: { gap: 2, flex: 1 },
  alarmTime: { fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: 1, color: theme.text },
  alarmLabel: { color: theme.textSecondary, fontSize: 14 },
  alarmDays: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  alarmSound: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
  },
  modalCard: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: { fontSize: 18, color: theme.text },
  sectionLabel: { color: theme.textSecondary, marginTop: 4, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  timePickerButton: {
    backgroundColor: theme.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  timePickerText: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: 2,
  },
  iosPickerContainer: {
    backgroundColor: theme.background,
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.text,
    backgroundColor: theme.background,
  },
  soundOption: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.background,
  },
  soundOptionActive: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryCard,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  previewBtn: {
    flex: 1,
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  previewBtnText: { color: theme.onPrimary, fontWeight: '600' },
  previewStatus: {
    color: theme.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  stopBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: theme.border,
  },
  stopBtnText: { color: theme.text, fontWeight: '600' },
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
    backgroundColor: theme.border,
  },
  cancelBtnText: { color: theme.text },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: theme.primary,
  },
  saveBtnText: { color: theme.onPrimary, fontWeight: '600' },
});
