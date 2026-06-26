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
      <View style={styles.panel}>
        <Animated.View style={[styles.buttonShell, isTracking && styles.buttonShellActive, animStyle]}>
          <Pressable
            style={[styles.btn, isTracking && styles.btnStop]}
            onPress={isTracking ? onStop : onStart}
          >
            <ThemedText style={styles.icon}>{isTracking ? '☾' : '🌙'}</ThemedText>
            <ThemedText style={styles.btnText}>
              {isTracking ? 'Berhenti' : 'Mulai Tidur'}
            </ThemedText>
          </Pressable>
        </Animated.View>

        <View style={styles.timerBox}>
          <ThemedText style={styles.timerText}>
            {pad(h)}:{pad(m)}:{pad(s)}
          </ThemedText>
          <ThemedText style={styles.timerLabel}>
            {isTracking ? 'Sesi tidur sedang berjalan' : 'Atau atur alarm untuk otomatis'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', width: '100%', paddingVertical: 6 },
  panel: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#161b29',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  buttonShell: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 6,
    marginBottom: 14,
    shadowColor: '#8ba6ff',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonShellActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  btn: {
    flex: 1,
    borderRadius: 56,
    backgroundColor: '#b5c4ff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 4,
    borderColor: '#11131a',
  },
  btnStop: {
    backgroundColor: '#7aa2ff',
  },
  icon: {
    fontSize: 28,
    color: '#00287b',
  },
  btnText: {
    color: '#00287b',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  timerBox: {
    alignItems: 'center',
    gap: 3,
    paddingTop: 4,
  },
  timerText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.primaryText,
  },
  timerLabel: {
    fontSize: 12,
    color: '#8b95a9',
    textAlign: 'center',
  },
});
