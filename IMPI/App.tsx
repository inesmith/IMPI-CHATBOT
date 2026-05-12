import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './src/services/firebaseConfig';

import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(
    'Connecting to field network…'
  );

  useEffect(() => {
    async function loadAssets() {
      await Asset.loadAsync([
        require('./assets/images/dust.png'),
        require('./assets/images/logo.png'),
      ]);

      setAssetsLoaded(true);
    }

    loadAssets();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setNetworkStatus('Connected to field network...');

      setTimeout(() => {
        if (user) {
          setCurrentScreen('home');
        } else {
          setCurrentScreen('login');
        }
      }, 2500);
    });

    return unsubscribe;
  }, []);

  if (!assetsLoaded) {
    return null;
  }

  if (currentScreen === 'signup') {
    return <SignupScreen setCurrentScreen={setCurrentScreen} />;
  }

  if (currentScreen === 'home') {
    return <HomeScreen />;
  }

  if (currentScreen === 'login') {
    return <LoginScreen setCurrentScreen={setCurrentScreen} />;
  }

  return <LandingScreen networkStatus={networkStatus} />;
}