import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFonts } from 'expo-font';

type Props = {
  setCurrentScreen: (screen: string) => void;
};

export default function LoginScreen({ setCurrentScreen }: Props) {
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
          <Text style={styles.title}>LOG INTO IMPI</Text>

          <Text style={styles.subtitle}>
            PLEASE FILL IN ALL THE{'\n'}NECESSARY DETAILS.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="USERNAME OR EMAIL"
            placeholderTextColor="#CFC4B2"
          />

          <TextInput
            style={styles.input}
            placeholder="PASSWORD"
            placeholderTextColor="#CFC4B2"
            secureTextEntry
          />

          <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>
            DON’T HAVE AN ACCOUNT YET?{'\n'}
            <Text
            style={styles.underline}
            onPress={() => setCurrentScreen('signup')}
            >
            SIGN UP
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
    height: 500,
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
    paddingTop: 48,
  },

  title: {
    fontFamily: 'Aldrich',
    color: '#F4F1EA',
    fontSize: 23,
    letterSpacing: 2,
    marginTop: 2,
  },

  subtitle: {
    color: '#CFC4B2',
    fontSize: 12,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 46,
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
    marginBottom: 18,
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

  forgotText: {
    alignSelf: 'flex-end',
    color: '#CFC4B2',
    fontSize: 9,
    marginRight: 5,
    fontFamily: 'Aldrich',
    marginTop: 0,
  },

  loginButton: {
    width: 150,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(103, 97, 39, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 4,
    },
    shadowOpacity: 0.40,
    shadowRadius: 8,

    elevation: 6,
  },

  loginButtonText: {
    color: '#F4F1EA',
    fontSize: 12,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  signupText: {
    color: '#CFC4B2',
    fontSize: 11,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  underline: {
    textDecorationLine: 'underline',
  },
});