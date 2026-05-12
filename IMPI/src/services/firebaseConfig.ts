import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
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

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);