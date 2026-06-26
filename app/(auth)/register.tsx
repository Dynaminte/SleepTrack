import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/lib/firebase';
import { Colors } from '@/constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert('Validasi', 'Semua field wajib diisi.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validasi', 'Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Validasi', 'Password minimal 6 karakter.');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      // Setelah register, arahkan ke set target tidur
      router.replace('/(auth)/set-sleep-target');
    } catch (e: any) {
      const code: string = e?.code ?? '';
      if (code === 'auth/email-already-in-use') {
        Alert.alert('Registrasi Gagal', 'Email sudah terdaftar.');
      } else if (code === 'auth/invalid-email') {
        Alert.alert('Registrasi Gagal', 'Format email tidak valid.');
      } else {
        Alert.alert('Registrasi Gagal', e?.message ?? 'Terjadi kesalahan.');
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
          <ThemedText type="title" style={styles.title}>Buat Akun</ThemedText>
          <ThemedText style={styles.subtitle}>Daftar untuk mulai melacak tidurmu</ThemedText>

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
            placeholder="minimal 6 karakter"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <ThemedText style={styles.label}>Konfirmasi Password</ThemedText>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="ulangi password"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onRegister}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Mendaftar...' : 'Daftar'}
            </ThemedText>
          </Pressable>

          <Link href="/(auth)/login" style={styles.link}>
            <ThemedText type="link">Sudah punya akun? Masuk</ThemedText>
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
  title: { textAlign: 'center', marginBottom: 4 },
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
