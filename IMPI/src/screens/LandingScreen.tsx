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
        source={require('../../assets/images/fieldwallpaper1.png')}
        style={styles.wallpaper}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>IMPI</Text>

        <Text style={styles.subtitle}>
          Learn Conservation{'\n'}Through Conversation
        </Text>
      </View>

      <Text style={styles.networkText}>{networkStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#605737',
    justifyContent: 'center',
    alignItems: 'center',
  },

  wallpaper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  content: {
  width: '100%',
  alignItems: 'center',
  paddingHorizontal: 24,
  marginTop: -290,
},

title: {
  color: '#F4F1EA',
  fontSize: 68,
  fontFamily: 'Aldrich',
  fontWeight: '800',
  marginBottom: -80,
  paddingBottom: 80,
},

subtitle: {
  color: '#F4F1EA',
  fontSize: 15,
  letterSpacing: 2,
  fontFamily: 'Aldrich',
  textAlign: 'center',
  lineHeight: 20,
  marginBottom: 160,
},

  networkText: {
    position: 'absolute',
    bottom: 50,
    color: '#F5F5F5',
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: 'Aldrich',
  },
})