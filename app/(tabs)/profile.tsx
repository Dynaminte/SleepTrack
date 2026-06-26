import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/colors';
import { auth } from '@/lib/firebase';
import { useSleepStore } from '@/store/sleepStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { sleepTarget, notificationsEnabled, darkMode, setNotifications, setDarkMode } =
    useSleepStore();

  const user = auth.currentUser;

  const onLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Profil header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.email}>
              {user?.email ?? '-'}
            </ThemedText>
          </View>

          {/* Pengaturan */}
          <ThemedText style={styles.sectionTitle}>Pengaturan</ThemedText>

          <View style={styles.settingsGroup}>
            <Pressable style={styles.settingsRow} onPress={() => router.push('/(auth)/set-sleep-target')}>
              <ThemedText>🎯 Target Tidur</ThemedText>
              <ThemedText style={styles.settingsValue}>{sleepTarget} jam</ThemedText>
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.settingsRow}>
              <ThemedText>🔔 Notifikasi</ThemedText>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotifications}
                trackColor={{ false: '#334155', true: Colors.primaryLight }}
                thumbColor={notificationsEnabled ? Colors.primary : '#64748b'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingsRow}>
              <ThemedText>🌙 Mode Gelap</ThemedText>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#334155', true: Colors.primaryLight }}
                thumbColor={darkMode ? Colors.primary : '#64748b'}
              />
            </View>
          </View>

          {/* Riwayat & Saran */}
          <ThemedText style={styles.sectionTitle}>Lainnya</ThemedText>
          <View style={styles.settingsGroup}>
            <Pressable style={styles.settingsRow} onPress={() => router.push('/(tabs)/statistics')}>
              <ThemedText>📊 Riwayat Tidur</ThemedText>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.settingsRow} onPress={() => router.push('/(tabs)/advice')}>
              <ThemedText>💡 Saran Tidur</ThemedText>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </Pressable>
          </View>

          {/* Tombol logout */}
          <Pressable style={styles.logoutBtn} onPress={onLogout}>
            <ThemedText style={styles.logoutText}>Keluar Akun</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 16 },
  profileHeader: { alignItems: 'center', gap: 10, paddingVertical: 12 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: '700' },
  email: { color: '#94a3b8' },
  sectionTitle: { fontWeight: '600', fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  settingsGroup: { backgroundColor: '#1e293b', borderRadius: 14, overflow: 'hidden' },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingsValue: { color: Colors.primary, fontWeight: '500' },
  chevron: { fontSize: 22, color: '#64748b' },
  divider: { height: 1, backgroundColor: '#334155', marginHorizontal: 16 },
  logoutBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  logoutText: { color: '#ef4444', fontWeight: '600' },
});
