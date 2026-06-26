import { getApps, initializeApp, getApp } from 'firebase/app';
import { Auth, initializeAuth, getAuth, Persistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * getReactNativePersistence hanya ada di bundle React Native:
 *   @firebase/auth/dist/rn/index.js
 * Di platform Web bundle tidak mengekspornya, sehingga kita coba
 * dengan try/catch agar aman di kedua platform (native & web).
 */
let auth: Auth;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rnAuth = require('@firebase/auth') as {
    getReactNativePersistence: (storage: AsyncStorageStatic) => Persistence;
  };
  auth = initializeAuth(app, {
    persistence: rnAuth.getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Web platform atau getReactNativePersistence tidak tersedia
  auth = getAuth(app);
}

// Tipe AsyncStorage static untuk cast di atas
type AsyncStorageStatic = typeof AsyncStorage;

export { auth };
export const db = getFirestore(app);
export default app;
