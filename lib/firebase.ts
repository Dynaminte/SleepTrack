import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBCmpsehNVYF4tiSCc3doAyqTYsNusH9iA',
  authDomain: 'sleeptrack-8caaf.firebaseapp.com',
  databaseURL: 'https://sleeptrack-8caaf-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'sleeptrack-8caaf',
  storageBucket: 'sleeptrack-8caaf.firebasestorage.app',
  messagingSenderId: '346304438863',
  appId: '1:346304438863:web:fd9124f4ba24c9d2b1403a',
  measurementId: 'G-MCHE0WC0H0',
};

// Hindari inisialisasi ulang saat hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Selalu gunakan initializeAuth dengan persistence — getAuth() sebagai fallback
// jika auth sudah pernah dibuat di instance yang sama (mencegah "already initialized" error)
let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Auth sudah diinisialisasi sebelumnya (misalnya saat hot-reload)
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
export default app;