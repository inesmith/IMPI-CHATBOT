import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';

import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [assetsLoaded, setAssetsLoaded] = useState(false);

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
    const timer = setTimeout(() => {
      setCurrentScreen('login');
    }, 3500);

    return () => clearTimeout(timer);
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

  return <LandingScreen />;
}