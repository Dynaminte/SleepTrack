import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, 'test@test.com', '123456')
  .then(() => console.log('Login success'))
  .catch((e) => console.log('Login error:', e.code, e.message));
