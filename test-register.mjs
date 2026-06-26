import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

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

const randomEmail = 'test' + Date.now() + '@test.com';

createUserWithEmailAndPassword(auth, randomEmail, '123456')
  .then((user) => console.log('Register success:', user.user.email))
  .catch((e) => console.log('Register error:', e.code, e.message));
