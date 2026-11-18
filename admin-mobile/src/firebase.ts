import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { FirebaseError, getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = Constants.expoConfig?.extra?.firebaseConfig;
if (!firebaseConfig?.projectId || !firebaseConfig?.apiKey) {
  throw new Error('Firebase app configuration is missing. Check the root firebase-applet-config.json.');
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
}

export const auth = createAuth();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
