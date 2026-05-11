import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFonts } from 'expo-font';


type Props = {
  setCurrentScreen: (screen: string) => void;
};

export default function SignupScreen({ setCurrentScreen }: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

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
          />

          <TextInput
            style={styles.input}
            placeholder="EMAIL ADDRESS"
            placeholderTextColor="#CFC4B2"
          />

          <TextInput
            style={styles.input}
            placeholder="PHONE NUMBER"
            placeholderTextColor="#CFC4B2"
          />

          <TextInput
            style={styles.input}
            placeholder="PASSWORD"
            placeholderTextColor="#CFC4B2"
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="CONFIRM PASSWORD"
            placeholderTextColor="#CFC4B2"
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={styles.signupButtonText}>SIGN UP</Text>
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
    backgroundColor: 'rgba(103, 97, 39, 0.32)',
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
    color: '#F4F1EA',
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
    fontSize: 10,
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
  color: '#F4F1EA',
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