import { Image, StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';

type Props = {
  networkStatus: string;
};

export default function LandingScreen({ networkStatus }: Props) {

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

      <View style={styles.content}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>IMPI</Text>

        <Text style={styles.subtitle}>
          THE RANGER CHATBOT
        </Text>

        <Text style={styles.networkText}>
        {networkStatus}
        </Text>

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

  dust: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  logo: {
    width: 350,
    height: 350,
    marginBottom: 10,
    marginTop: -120,
    marginLeft: 20,
  },

  title: {
    color: '#F4F1EA',
    fontSize: 68,
    fontFamily: 'Aldrich',
    fontWeight: '800',
  },

  subtitle: {
    color: '#F4F1EA',
    fontSize: 23,
    letterSpacing: 2,
    marginTop: 2,
  },

  networkText: {
  position: 'absolute',
  bottom: -200,
  color: '#676127',
  fontSize: 13,
  letterSpacing: 1,
  fontFamily: 'Aldrich',
},
});