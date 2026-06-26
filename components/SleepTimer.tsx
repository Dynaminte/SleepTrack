import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';

import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/colors';

type Props = {
  isTracking: boolean;
  onStart: () => void;
  onStop: () => void;
};

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function SleepTimer({ isTracking, onStart, onStop }: Props) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isTracking) {
      pulse.value = withRepeat(withTiming(1.08, { duration: 1500 }), -1, true);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      pulse.value = withTiming(1);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSeconds(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTracking]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.circle, isTracking && styles.circleActive, animStyle]}>
        <ThemedText style={styles.timer}>
          {pad(h)}:{pad(m)}:{pad(s)}
        </ThemedText>
        <ThemedText style={styles.timerLabel}>
          {isTracking ? 'Sedang Tidur...' : 'Timer Tidur'}
        </ThemedText>
      </Animated.View>

      <Pressable
        style={[styles.btn, isTracking && styles.btnStop]}
        onPress={isTracking ? onStop : onStart}
      >
        <ThemedText style={styles.btnText}>
          {isTracking ? '⏹ Bangun' : '▶ Mulai Tidur'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 20 },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1e293b',
    borderWidth: 3,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  circleActive: { borderColor: Colors.primary },
  timer: { fontSize: 28, fontWeight: '700', letterSpacing: 2 },
  timerLabel: { fontSize: 13, color: '#64748b' },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  btnStop: { backgroundColor: '#7f1d1d' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
