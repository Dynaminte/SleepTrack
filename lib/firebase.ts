import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;