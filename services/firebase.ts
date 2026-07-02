import { initializeApp, getApps, getApp } from 'firebase/app';
import { Platform } from 'react-native';

import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
} from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  const ReactNativeAsyncStorage =
    require('@react-native-async-storage/async-storage').default;

  const { getReactNativePersistence } = require('firebase/auth');

  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch (error) {
    auth = getAuth(app);
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };