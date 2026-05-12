import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFonts } from 'expo-font';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

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

  const handleSignup = async () => {
    setMessage('');

    if (!username || !email || !phoneNumber || !password || !confirmPassword) {
      setMessage('PLEASE FILL IN ALL FIELDS.');
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
        phoneNumber: phoneNumber.trim(),
        createdAt: new Date(),
      });

      setCurrentScreen('home');
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>

      <Image
        source={require('../../assets/images/dust.png')}
        style={styles.dust}
        resizeMode="cover"
      />

      <View style={styles.card}>
        <View style={styles.cardBackground} />

        <View style={styles.content}>
          <Text style={styles.title}>SIGN UP WITH IMPI</Text>

          <Text style={styles.subtitle}>
            PLEASE FILL IN ALL THE{'\n'}NECESSARY DETAILS.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="USERNAME"
            placeholderTextColor="#CFC4B2"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="EMAIL ADDRESS"
            placeholderTextColor="#CFC4B2"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="PHONE NUMBER"
            placeholderTextColor="#CFC4B2"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="PASSWORD"
            placeholderTextColor="#CFC4B2"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="CONFIRM PASSWORD"
            placeholderTextColor="#CFC4B2"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {message ? (
            <Text style={styles.messageText}>{message}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.signupButtonText}>
              {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.loginText}>
            ALREADY HAVE AN ACCOUNT?{'\n'}
            <Text
              style={styles.underline}
              onPress={() => setCurrentScreen('login')}
            >
              LOG IN
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191818',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '85%',
    height: 630,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
  },

  cardBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#676127',
    opacity: 0.32,
  },

  dust: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 40,
  },

  title: {
    fontFamily: 'Aldrich',
    color: '#CFC4B2',
    fontSize: 22,
    letterSpacing: 2,
    marginTop: 2,
  },

  subtitle: {
    color: '#CFC4B2',
    fontSize: 12,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 22,
    marginBottom: 36,
    lineHeight: 18,
  },

  input: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(103, 97, 39, 0.32)',
    color: '#CFC4B2',
    fontFamily: 'Aldrich',
    fontSize: 12,
    paddingHorizontal: 18,
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 6,
  },

  messageText: {
    color: '#CFC4B2',
    fontSize: 9,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    marginTop: 4,
  },

  signupButton: {
    width: 150,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(103, 97, 39, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.40,
    shadowRadius: 8,

    elevation: 6,
  },

  signupButtonText: {
    color: '#CFC4B2',
    fontSize: 12,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
  },

  loginText: {
    color: '#CFC4B2',
    fontSize: 10,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 16,
  },

  underline: {
    textDecorationLine: 'underline',
  },
});