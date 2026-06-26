# SleepTrack

Aplikasi pelacak kualitas tidur berbasis Expo + Firebase.

## Fitur
- Login & Register dengan Firebase Auth
- Timer tidur dengan animasi
- Skor kualitas tidur otomatis
- Grafik statistik 7 hari
- Alarm & notifikasi lokal
- Halaman saran tidur
- Profil & pengaturan

## Setup

### 1. Install dependencies
```bash
npx expo install
```

### 2. Konfigurasi Firebase
Edit `lib/firebase.ts` dan isi config dari Firebase Console:
- Buka https://console.firebase.google.com
- Project Settings → Your apps → Add app (Android/iOS)
- Salin `firebaseConfig` ke `lib/firebase.ts`
- Aktifkan **Authentication** (Email/Password) di Firebase Console
- Aktifkan **Firestore Database**

### 3. Jalankan di Expo Go
```bash
npx expo start
```
Scan QR dengan aplikasi Expo Go di HP.

## Struktur Folder
```
sleeptrack/
├── app/
│   ├── _layout.tsx          # root layout
│   ├── index.tsx            # redirect berdasarkan auth
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── set-sleep-target.tsx
│   └── (tabs)/
│       ├── _layout.tsx      # bottom tab navigator
│       ├── index.tsx        # Dashboard
│       ├── alarm.tsx
│       ├── statistics.tsx
│       ├── advice.tsx
│       └── profile.tsx
├── components/
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   ├── SleepTimer.tsx
│   ├── SleepScoreCard.tsx
│   └── SleepChart.tsx
├── lib/
│   └── firebase.ts
├── services/
│   └── sleep.service.ts
├── store/
│   └── sleepStore.ts        # Zustand global state
├── hooks/
│   ├── useColorScheme.ts
│   ├── useThemeColor.ts
│   └── useSleepSession.ts
├── types/
│   └── sleep.types.ts
└── constants/
    └── colors.ts
```

## Library Utama
| Library | Kegunaan |
|---|---|
| `expo-router` | File-based routing |
| `firebase` | Auth + Firestore |
| `zustand` | Global state management |
| `react-native-gifted-charts` | Grafik statistik tidur |
| `expo-notifications` | Alarm & notifikasi lokal |
| `react-native-reanimated` | Animasi timer |
| `date-fns` | Format tanggal/waktu |
