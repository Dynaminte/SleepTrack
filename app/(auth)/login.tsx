import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/lib/firebase';
import { Colors } from '@/constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/(tabs)');
    });
    return unsubscribe;
  }, []);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Validasi', 'Email dan password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      const code: string = e?.code ?? '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        Alert.alert('Gagal Login', 'Email atau password salah.');
      } else if (code === 'auth/user-not-found') {
        Alert.alert('Akun Tidak Ada', 'Silakan register terlebih dulu.');
      } else {
        Alert.alert('Gagal Login', e?.message ?? 'Terjadi kesalahan.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo / judul */}
          <ThemedText type="title" style={styles.appName}>🌙 SleepTrack</ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>Masuk ke akun kamu</ThemedText>

          {/* Form */}
          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="email@contoh.com"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <ThemedText style={styles.label}>Password</ThemedText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="password"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onLogin}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Masuk...' : 'Masuk'}
            </ThemedText>
          </Pressable>

          <Link href="/(auth)/register" style={styles.link}>
            <ThemedText type="link">Belum punya akun? Daftar</ThemedText>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 12 },
  appName: { textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', marginBottom: 20, color: '#64748b' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#e2e8f0',
    backgroundColor: '#1e293b',
    marginBottom: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16 },
});
