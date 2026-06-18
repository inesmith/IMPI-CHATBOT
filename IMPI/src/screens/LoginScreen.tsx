import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import { useFonts } from 'expo-font';
import { signInWithEmailAndPassword, sendPasswordResetEmail, } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GoogleIcon from '../../assets/images/Google-icon.svg';
import AppleIcon from '../../assets/images/apple-icon.svg';

type Props = {
  setCurrentScreen: (screen: string) => void;
};

export default function LoginScreen({ setCurrentScreen }: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const isLoginReady = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async () => {
    setMessage('');

    if (!email || !password) {
      setMessage('PLEASE FILL IN ALL FIELDS.');
      return;
    }

    try {
      setIsLoading(true);

      await AsyncStorage.setItem(
        'rememberMe',
        rememberMe ? 'true' : 'false'
      );

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      setCurrentScreen('home');
    } catch (error: any) {
      setMessage('ACCOUNT NOT FOUND OR PASSWORD INCORRECT.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setMessage('');

    if (!email) {
      setMessage('PLEASE ENTER YOUR EMAIL FIRST.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage('PASSWORD RESET EMAIL SENT.');
    } catch (error: any) {
      setMessage('COULD NOT SEND RESET EMAIL.');
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
          <MaterialIcons
            name="arrow-back"
            size={28}
            color="#F5F5F5"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Go ahead and set up{'\n'}your account
        </Text>

        <Text style={styles.subtitle}>
          Sign in-up to start learning conservation
        </Text>

        <View style={styles.switchContainer}>
          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.tabText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inactiveTab}
            onPress={() => setCurrentScreen('signup')}
          >
            <Text style={styles.tabText}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
  <BlurView intensity={24} tint="light" style={styles.inputIconCircle}>
    <MaterialIcons
      name="mail-outline"
      size={25}
      color="#F5F5F5"
    />
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
        <MaterialIcons
          name="lock-outline"
          size={25}
          color="#F5F5F5"
        />
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

        <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.rememberButton}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View
            style={[
              styles.rememberBox,
              rememberMe && styles.rememberBoxSelected,
            ]}
          />

          <Text style={styles.smallText}>Remember me</Text>
        </TouchableOpacity>

        <Text style={styles.smallText} onPress={handleForgotPassword}>
          Forgot Password?
        </Text>
      </View>

        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        <TouchableOpacity
          style={[
            styles.loginButton,
            !isLoginReady && styles.loginButtonInactive,
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>Or login with</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}>
            <GoogleIcon
              width={22}
              height={22}
            />

            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <AppleIcon
              width={22}
              height={22}
            />

            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#605737',
  },

  wallpaper: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 98,
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
    marginTop: -20,
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
    marginBottom: 38,
  },

  switchContainer: {
    height: 67,
    borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 25,
    marginBottom: 42,
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
    shadowOffset: {
      width: 0,
      height: 10,
    },
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
    marginTop:5,
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

  inputWrapper: {
    width: '100%',
    height: 55,
    borderRadius: 31,

    backgroundColor: 'rgba(255,255,255,0.12)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 20,

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

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 34,
  },

  smallText: {
    color: '#F5F5F5',
    fontSize: 13,
    fontFamily: 'Aldrich',
  },

  messageText: {
    color: '#F5F5F5',
    fontSize: 10,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    marginBottom: 25,
  },

  loginButton: {
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
    marginBottom: 42,
  },

  loginButtonInactive: {
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  loginButtonText: {
    color: '#F5F5F5',
    fontSize: 22,
    fontFamily: 'Aldrich',
    marginTop: 5,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 34,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },

  orText: {
    marginHorizontal: 20,
    color: '#F5F5F5',
    fontSize: 13,
    fontFamily: 'Aldrich',
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  socialButton: {
    width: '47%',
    height: 55,
    borderRadius: 31,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',  
    gap: 8,                 

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 10,

    elevation: 18,
  },

  socialText: {
    color: '#F5F5F5',
    fontSize: 15,
    fontFamily: 'Aldrich',
    marginTop: 5,
  },

  rememberButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rememberBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    borderRadius: 2,
    marginRight: 7,
    marginTop: -3,
  },

  rememberBoxSelected: {
    backgroundColor: '#F5F5F5',
  },
});