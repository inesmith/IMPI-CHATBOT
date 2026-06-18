import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFonts } from 'expo-font';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';

import GoogleIcon from '../../assets/images/Google-icon.svg';
import AppleIcon from '../../assets/images/apple-icon.svg';

type Props = {
  setCurrentScreen: (screen: string) => void;
};

export default function SignupScreen({ setCurrentScreen }: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSignupReady =
    username.trim() !== '' &&
    email.trim() !== '' &&
    phoneNumber.trim() !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '';

  const handleSignup = async () => {
    setMessage('');

    if (!username || !email || !phoneNumber || !password || !confirmPassword) {
      setMessage('PLEASE FILL IN ALL FIELDS.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(email.trim())) {
      setMessage('INVALID EMAIL ADDRESS.');
      return;
    }

    if (!phoneRegex.test(cleanedPhoneNumber)) {
      setMessage('PHONE NUMBER MUST BE 10 DIGITS.');
      return;
    }

    if (password.length < 6) {
      setMessage('PASSWORD MUST BE AT LEAST 6 CHARACTERS.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('PASSWORDS DO NOT MATCH.');
      return;
    }

    try {
      setIsLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        username: username.trim(),
        email: email.trim(),
        phoneNumber: cleanedPhoneNumber,
        createdAt: new Date(),
      });

      setCurrentScreen('home');
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        setMessage('INVALID EMAIL ADDRESS.');
      } else if (error.code === 'auth/email-already-in-use') {
        setMessage('PROFILE ALREADY EXISTS.');
      } else if (error.code === 'auth/weak-password') {
        setMessage('PASSWORD MUST BE AT LEAST 6 CHARACTERS.');
      } else {
        setMessage('SIGN UP FAILED. PLEASE TRY AGAIN.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/fieldwallpaper3.png')}
        style={styles.wallpaper}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('welcome')}
        >
          <MaterialIcons name="arrow-back" size={28} color="#F5F5F5" />
        </TouchableOpacity>

        <Text style={styles.title}>
          Begin your{'\n'}conservation journey
        </Text>

        <Text style={styles.subtitle}>
          Create your account to start exploring
        </Text>

        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={styles.inactiveTab}
            onPress={() => setCurrentScreen('login')}
          >
            <Text style={styles.tabText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.tabText}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <BlurView intensity={24} tint="light" style={styles.inputIconCircle}>
            <MaterialIcons name="person-outline" size={25} color="#F5F5F5" />
          </BlurView>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#F5F5F5"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputWrapper}>
          <BlurView intensity={24} tint="light" style={styles.inputIconCircle}>
            <MaterialIcons name="mail-outline" size={25} color="#F5F5F5" />
          </BlurView>

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#F5F5F5"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <BlurView intensity={24} tint="light" style={styles.inputIconCircle}>
            <MaterialIcons name="phone" size={25} color="#F5F5F5" />
          </BlurView>

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#F5F5F5"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputWrapper}>
          <BlurView intensity={24} tint="light" style={styles.inputIconCircle}>
            <MaterialIcons name="lock-outline" size={25} color="#F5F5F5" />
          </BlurView>

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#F5F5F5"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.inputWrapper}>
          <BlurView intensity={24} tint="light" style={styles.inputIconCircle}>
            <MaterialIcons name="lock-outline" size={25} color="#F5F5F5" />
          </BlurView>

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#F5F5F5"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        <TouchableOpacity
          style={[
            styles.signupButton,
            !isSignupReady && styles.signupButtonInactive,
          ]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={styles.signupButtonText}>
            {isLoading ? 'Signing up...' : 'Register'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191818',
  },

  wallpaper: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 78,
  },

  backButton: {
    width: 49,
    height: 49,
    borderRadius: 28,
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    backgroundColor: 'rgba(217,217,217,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 10,

    elevation: 18,
  },

  backText: {
    color: '#F5F5F5',
    fontSize: 42,
    marginTop: -6,
  },

  title: {
    fontFamily: 'Aldrich',
    color: '#F5F5F5',
    fontSize: 26,
    lineHeight: 27,
  },

  subtitle: {
    color: '#F5F5F5',
    fontSize: 14,
    fontFamily: 'Aldrich',
    marginTop: 15,
    marginBottom: 30,
  },

  switchContainer: {
    height: 67,
    borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 33,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  activeTab: {
    flex: 1,
    height: 49,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 18,
  },

  inactiveTab: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabText: {
    color: '#F5F5F5',
    fontFamily: 'Aldrich',
    fontSize: 16,
    marginTop: 5,
  },

  inputWrapper: {
    width: '100%',
    height: 55,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
    marginBottom: 10,
    overflow: 'hidden',
  },

  inputIconCircle: {
    width: 37,
    height: 37,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(217,217,217,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 18,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#F5F5F5',
    fontFamily: 'Aldrich',
    fontSize: 16,
    paddingRight: 20,
    marginTop: 5,
  },

  messageText: {
    color: '#F5F5F5',
    fontSize: 10,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  signupButton: {
    height: 68,
    borderRadius: 38,
    backgroundColor: 'rgba(9, 42, 255, 0.61)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 18,
    marginTop: 10,
    marginBottom: 32,
  },

  signupButtonInactive: {
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  signupButtonText: {
    color: '#F5F5F5',
    fontSize: 22,
    fontFamily: 'Aldrich',
    marginTop: 5,
  },
  
});