import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Vibration,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { useAlarmPopupStore } from '@/store/alarmPopupStore';
import { stopAlarmSound } from '@/hooks/useForegroundAlarm';
import {
  loadAlarms,
  saveAlarms,
  cancelAllAlarms,
  scheduleAlarm,
} from '@/services/alarm.service';

const SNOOZE_OPTIONS = [
  { label: '5 menit', minutes: 5 },
  { label: '10 menit', minutes: 10 },
  { label: '15 menit', minutes: 15 },
];

type Props = {
  onDismiss?: () => void;
  onSnooze?: (minutes: number) => void;
};

export function AlarmPopup({ onDismiss, onSnooze }: Props) {
  const { visible, alarm, hideAlarm } = useAlarmPopupStore();

  // Animasi pulse untuk ikon alarm
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide-in + fade
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse loop untuk ikon
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();

      // Glow loop
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
        ])
      );
      glowLoop.start();

      // Vibrasi berulang saat alarm muncul
      Vibration.vibrate([0, 400, 200, 400, 200, 400], true);

      return () => {
        pulseLoop.stop();
        glowLoop.stop();
        Vibration.cancel();
        // Reset untuk animasi berikutnya
        slideAnim.setValue(80);
        opacityAnim.setValue(0);
      };
    }
  }, [visible]);

  const handleDismiss = async () => {
    Vibration.cancel();
    await stopAlarmSound();  // Hentikan audio alarm
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Matikan alarm di storage
    if (alarm) {
      try {
        const loaded = await loadAlarms();
        const updated = loaded.map((a) =>
          a.id === alarm.id ? { ...a, enabled: false } : a
        );
        await saveAlarms(updated);
        await cancelAllAlarms();
        for (const a of updated.filter((a) => a.enabled)) {
          await scheduleAlarm(a);
        }
      } catch (e) {
        console.error('Failed to disable alarm:', e);
      }
    }

    hideAlarm();
    onDismiss?.();
  };

  const handleSnooze = async (minutes: number) => {
    Vibration.cancel();
    await stopAlarmSound();  // Hentikan audio alarm
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (alarm) {
      try {
        // Hitung waktu snooze
        const snoozeTime = new Date(Date.now() + minutes * 60 * 1000);
        const snoozeHour = snoozeTime.getHours().toString().padStart(2, '0');
        const snoozeMinute = snoozeTime.getMinutes().toString().padStart(2, '0');
        const snoozeTimeStr = `${snoozeHour}:${snoozeMinute}`;

        // Buat alarm sementara dengan waktu snooze
        const snoozeAlarm = {
          ...alarm,
          id: `snooze_${alarm.id}_${Date.now()}`,
          time: snoozeTimeStr,
          label: `${alarm.label} (Tunda ${minutes}m)`,
          enabled: true,
        };

        // Jadwalkan alarm snooze
        const loaded = await loadAlarms();
        await saveAlarms([snoozeAlarm, ...loaded]);
        await cancelAllAlarms();
        const allAlarms = await loadAlarms();
        for (const a of allAlarms.filter((a) => a.enabled)) {
          await scheduleAlarm(a);
        }
      } catch (e) {
        console.error('Failed to snooze alarm:', e);
      }
    }

    hideAlarm();
    onSnooze?.(minutes);
  };

  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!visible || !alarm) return null;

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(181, 196, 255, 0.0)', 'rgba(181, 196, 255, 0.25)'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      {/* Overlay gelap */}
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Glow effect di background card */}
          <Animated.View style={[styles.glowBg, { backgroundColor: glowColor }]} />

          {/* Icon alarm */}
          <Animated.View style={[styles.iconRing, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.iconInner}>
              <MaterialIcons name="alarm" size={42} color="#b5c4ff" />
            </View>
          </Animated.View>

          {/* Label & waktu */}
          <Text style={styles.wakeUpText}>Waktunya Bangun!</Text>
          <Text style={styles.alarmLabel}>{alarm.label}</Text>
          <Text style={styles.currentTime}>{currentTime}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Snooze options */}
          <Text style={styles.snoozeTitle}>Tunda Alarm</Text>
          <View style={styles.snoozeRow}>
            {SNOOZE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.minutes}
                style={({ pressed }) => [
                  styles.snoozeBtn,
                  pressed && styles.snoozeBtnPressed,
                ]}
                onPress={() => handleSnooze(opt.minutes)}
              >
                <MaterialIcons name="snooze" size={16} color="#b5c4ff" />
                <Text style={styles.snoozeBtnText}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Tombol Matikan */}
          <Pressable
            style={({ pressed }) => [
              styles.dismissBtn,
              pressed && styles.dismissBtnPressed,
            ]}
            onPress={handleDismiss}
          >
            <MaterialIcons name="alarm-off" size={20} color="#11131a" />
            <Text style={styles.dismissBtnText}>Matikan Alarm</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 15, 0.85)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#13141d',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    gap: 0,
    borderWidth: 1,
    borderColor: 'rgba(181, 196, 255, 0.15)',
    overflow: 'hidden',
    // Shadow
    shadowColor: '#b5c4ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 20,
  },
  glowBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    borderRadius: 32,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(181, 196, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(181, 196, 255, 0.3)',
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(181, 196, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wakeUpText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e2e1ec',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  alarmLabel: {
    fontSize: 14,
    color: '#8a8fa8',
    marginBottom: 10,
    fontWeight: '500',
  },
  currentTime: {
    fontSize: 52,
    lineHeight: 62,
    fontWeight: '700',
    color: '#b5c4ff',
    letterSpacing: 2,
    marginBottom: 24,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(181, 196, 255, 0.1)',
    marginBottom: 20,
  },
  snoozeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a8fa8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  snoozeRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 16,
  },
  snoozeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(181, 196, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(181, 196, 255, 0.2)',
  },
  snoozeBtnPressed: {
    backgroundColor: 'rgba(181, 196, 255, 0.2)',
    transform: [{ scale: 0.97 }],
  },
  snoozeBtnText: {
    color: '#b5c4ff',
    fontSize: 12,
    fontWeight: '600',
  },
  dismissBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: '#b5c4ff',
  },
  dismissBtnPressed: {
    backgroundColor: '#8fa8ff',
    transform: [{ scale: 0.98 }],
  },
  dismissBtnText: {
    color: '#11131a',
    fontSize: 16,
    fontWeight: '700',
  },
});
