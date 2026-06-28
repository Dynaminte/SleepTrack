import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

import { useSleepStore } from '@/store/sleepStore';
import { useSleepSession } from '@/hooks/useSleepSession';
import { loadAlarms, saveAlarms, cancelAllAlarms, scheduleAlarm, type AlarmItem } from '@/services/alarm.service';

const theme = {
  background: "#11131a",
  onBackground: "#e2e1ec",
  surfaceContainerLow: "#1a1b22",
  surfaceContainer: "#1e1f27",
  surfaceContainerHighest: "#33343c",
  primary: "#b5c4ff",
  onPrimary: "#00287b",
  secondary: "#4ae183",
  onSurfaceVariant: "#c4c5d6",
  white5: "rgba(255, 255, 255, 0.05)",
  secondary15: "rgba(74, 225, 131, 0.15)",
  secondary20: "rgba(74, 225, 131, 0.20)",
};

export default function DashboardScreen() {
  const { lastSession } = useSleepStore();
  const { isTracking, startSleep, stopSleep } = useSleepSession();
  const [nextAlarm, setNextAlarm] = useState<AlarmItem | null>(null);

  // Load next active alarm dynamically on screen focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      loadAlarms().then((loaded) => {
        if (!isMounted) return;
        const activeAlarms = loaded.filter((a) => a.enabled);
        if (activeAlarms.length === 0) {
          setNextAlarm(null);
          return;
        }

        // Find the closest upcoming alarm in the next 24 hours
        const sorted = [...activeAlarms].sort((a, b) => {
          const [aH, aM] = a.time.split(':').map(Number);
          const [bH, bM] = b.time.split(':').map(Number);
          const now = new Date();
          const nowMins = now.getHours() * 60 + now.getMinutes();
          const aMins = aH * 60 + aM;
          const bMins = bH * 60 + bM;

          const diffA = aMins >= nowMins ? aMins - nowMins : (24 * 60 - nowMins) + aMins;
          const diffB = bMins >= nowMins ? bMins - nowMins : (24 * 60 - nowMins) + bMins;

          return diffA - diffB;
        });

        setNextAlarm(sorted[0]);
      });
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const toggleAlarm = async () => {
    if (!nextAlarm) return;
    const loaded = await loadAlarms();
    const updated = loaded.map((item) => 
      item.id === nextAlarm.id ? { ...item, enabled: !item.enabled } : item
    );
    await saveAlarms(updated);
    await cancelAllAlarms();
    for (const alarm of updated.filter((item) => item.enabled)) {
      await scheduleAlarm(alarm);
    }
    // Refresh local state to reflect change immediately (it will turn off and next focus hook will run if needed)
    setNextAlarm({ ...nextAlarm, enabled: !nextAlarm.enabled });
  };

  // Parse session stats if available, otherwise use mock
  const score = lastSession?.score ?? 78;
  const startTime = lastSession?.startTime ? new Date(lastSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '23:05';
  const endTime = lastSession?.endTime ? new Date(lastSession.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '06:20';
  const duration = lastSession?.durationHours 
    ? `${Math.floor(lastSession.durationHours)}j ${Math.round((lastSession.durationHours % 1) * 60)}m` 
    : '7j 15m';

  // Circular progress math
  const radius = 72;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingText}>Selamat malam</Text>
              <Text style={styles.nameText}>Adrian</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AD</Text>
            </View>
          </View>

          {/* Hero / Score Section */}
          <View style={styles.heroCard}>
            <View style={styles.progressContainer}>
              <View style={styles.svgWrapper}>
                <Svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: [{ rotate: '-90deg' }] }}>
                  <Circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={theme.surfaceContainerHighest}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  <Circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={theme.primary}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
              
              <View style={styles.progressContent}>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreValue}>{score}</Text>
                  <Text style={styles.scoreMax}> / 100</Text>
                </View>
              </View>
            </View>

            <Text style={styles.heroTitle}>Kualitas tidur semalam</Text>
            
            <View style={styles.badge}>
              <MaterialIcons name="stars" size={16} color={theme.secondary} />
              <Text style={styles.badgeText}>Baik</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialIcons name="bedtime" size={20} color={theme.onSurfaceVariant} style={styles.statIcon} />
              <Text style={styles.statLabel}>Mulai tidur</Text>
              <Text style={styles.statValue}>{startTime}</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="light-mode" size={20} color={theme.onSurfaceVariant} style={styles.statIcon} />
              <Text style={styles.statLabel}>Jam bangun</Text>
              <Text style={styles.statValue}>{endTime}</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="timer" size={20} color={theme.onSurfaceVariant} style={styles.statIcon} />
              <Text style={styles.statLabel}>Durasi</Text>
              <Text style={styles.statValue}>{duration}</Text>
            </View>
          </View>

          {/* Alarm Card */}
          <View style={styles.alarmCard}>
            <View>
              <View style={styles.alarmHeaderRow}>
                <MaterialIcons name="alarm" size={18} color={theme.onSurfaceVariant} />
                <Text style={styles.alarmSubtext}>
                  {nextAlarm ? `Alarm aktif — ${nextAlarm.label}` : 'Tidak ada alarm aktif'}
                </Text>
              </View>
              <Text style={styles.alarmTime}>{nextAlarm ? nextAlarm.time : '--:--'}</Text>
            </View>
            <Switch 
              value={nextAlarm ? nextAlarm.enabled : false} 
              disabled={!nextAlarm}
              onValueChange={toggleAlarm}
              trackColor={{ false: theme.surfaceContainerHighest, true: theme.secondary }}
              thumbColor={(nextAlarm && nextAlarm.enabled) ? '#fff' : '#fff'}
            />
          </View>

          {/* Main Action Section */}
          <View style={styles.actionSection}>
            <Pressable 
              style={[styles.mainButton, isTracking && styles.mainButtonActive]} 
              onPress={isTracking ? stopSleep : startSleep}
            >
              <MaterialIcons 
                name={isTracking ? "stop" : "bedtime"} 
                size={32} 
                color={theme.onPrimary} 
                style={styles.mainButtonIcon} 
              />
              <Text style={styles.mainButtonText}>{isTracking ? "Bangun" : "Mulai Tidur"}</Text>
            </Pressable>
            <Text style={styles.actionSubtext}>Atau atur alarm untuk otomatis</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 14,
    color: theme.onSurfaceVariant,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.onBackground,
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.onPrimary,
  },
  heroCard: {
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.white5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  progressContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  svgWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressContent: {
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.primary,
  },
  scoreMax: {
    fontSize: 12,
    color: theme.onSurfaceVariant,
    marginLeft: 4,
  },
  heroTitle: {
    fontSize: 18,
    color: theme.onBackground,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.secondary15,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.secondary20,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surfaceContainer,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.white5,
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.onSurfaceVariant,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.onBackground,
  },
  alarmCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.white5,
  },
  alarmHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  alarmSubtext: {
    fontSize: 14,
    color: theme.onSurfaceVariant,
  },
  alarmTime: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.onBackground,
  },
  actionSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  mainButton: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.background,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 12,
  },
  mainButtonActive: {
    backgroundColor: '#ffb4ab', // Error/stop color based on html scheme (roughly)
    shadowColor: '#ffb4ab',
  },
  mainButtonIcon: {
    marginBottom: 4,
  },
  mainButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.onPrimary,
  },
  actionSubtext: {
    fontSize: 14,
    color: theme.onSurfaceVariant,
    marginTop: 16,
    opacity: 0.8,
  }
});
