import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth } from './src/services/firebaseConfig';

import LandingScreen from './src/screens/LandingScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import ImpiChatMenuScreen from './src/screens/ImpiChatMenuScreen';
import TalkWithImpiScreen from './src/screens/TalkWithImpiScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState('');
  const hasCheckedInitialAuth = useRef(false);

  const [networkStatus, setNetworkStatus] = useState(
    'Connecting to field network…'
  );

  useEffect(() => {
    setAssetsLoaded(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setNetworkStatus('IN FIELD NETWORK…');

      setTimeout(async () => {
        if (user) {
          if (!hasCheckedInitialAuth.current) {
            hasCheckedInitialAuth.current = true;

            const rememberMe = await AsyncStorage.getItem('rememberMe');

            if (rememberMe === 'true') {
              setCurrentScreen('home');
            } else {
              await signOut(auth);
              setCurrentScreen('welcome');
            }
          } else {
            setCurrentScreen('home');
          }
        } else {
          hasCheckedInitialAuth.current = true;
          setCurrentScreen('welcome');
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

  if (currentScreen === 'welcome') {
    return <WelcomeScreen setCurrentScreen={setCurrentScreen} />;
  }

  if (currentScreen === 'login') {
    return <LoginScreen setCurrentScreen={setCurrentScreen} />;
  }

  if (currentScreen === 'home') {
    return (
      <HomeScreen
        setCurrentScreen={setCurrentScreen}
        setInitialChatMessage={setInitialChatMessage}
      />
    );
  }

  if (currentScreen === 'impiChatMenu') {
    return (
      <ImpiChatMenuScreen
        setCurrentScreen={setCurrentScreen}
        setInitialChatMessage={setInitialChatMessage}
      />
    );
  }

  if (currentScreen === 'talkWithImpi') {
    return (
      <TalkWithImpiScreen
        setCurrentScreen={setCurrentScreen}
        initialChatMessage={initialChatMessage}
      />
    );
  }

  return <LandingScreen networkStatus={networkStatus} />;
}