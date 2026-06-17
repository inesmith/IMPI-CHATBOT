import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD4NdysmETeVLISJ-WckqsLXrjC4Y0gVtI",
  authDomain: "impi-ranger.firebaseapp.com",
  projectId: "impi-ranger",
  storageBucket: "impi-ranger.firebasestorage.app",
  messagingSenderId: "345339346543",
  appId: "1:345339346543:web:5d75d216ec854b4b24579a",
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

export { auth };

export const db = getFirestore(app);