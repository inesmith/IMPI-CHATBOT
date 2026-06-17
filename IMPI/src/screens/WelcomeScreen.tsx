import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useFonts } from 'expo-font';

import FootprintIcon from '../../assets/images/footprint.svg';
import NestEcoLeafIcon from '../../assets/images/nest_eco_leaf.svg';
import ImportContactsIcon from '../../assets/images/import_contacts.svg';
import ImpiLogo from '../../assets/images/ImpiLogo.svg';

type Props = {
  setCurrentScreen: (screen: string) => void;
};

export default function WelcomeScreen({ setCurrentScreen }: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/fieldwallpaper2.png')}
        style={styles.wallpaper}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <BlurView intensity={30} tint="light" style={styles.logoGlass}>
          <ImpiLogo width={58} height={58} />
        </BlurView>

        <Text style={styles.title}>Hello, I’m Impi</Text>
        <Text style={styles.subtitle}>What would you like to discover today?</Text>

        <View style={styles.lowerContent}>
          <BlurView intensity={25} tint="light" style={styles.card}>
            <BlurView intensity={24} tint="light" style={styles.iconCircle}>
            <FootprintIcon
                width={34}
                height={34}
            />
            </BlurView>

            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Ranger Realities</Text>
              <Text style={styles.cardText}>Discover what life in the field is really like.</Text>
            </View>
          </BlurView>

          <BlurView intensity={25} tint="light" style={styles.card}>
            <BlurView intensity={24} tint="light" style={styles.iconCircle}>
            <NestEcoLeafIcon
                width={34}
                height={34}
            />
            </BlurView>

            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Conservation Explained</Text>
              <Text style={styles.cardText}>Learn how ecosystems are protected and managed.</Text>
            </View>
          </BlurView>

          <BlurView intensity={25} tint="light" style={styles.card}>
            <BlurView intensity={24} tint="light" style={styles.iconCircle}>
            <ImportContactsIcon
                width={34}
                height={34}
            />
            </BlurView>

            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Stories From The Field</Text>
              <Text style={styles.cardText}>Explore real conservation challenges and experiences.</Text>
            </View>
          </BlurView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setCurrentScreen('login')}
            >
            <BlurView
                intensity={20}
                tint="light"
                style={styles.buttonBlur}
            >
                <Text style={styles.buttonText}>Login</Text>
            </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => setCurrentScreen('signup')}
            >
              <Text style={styles.buttonText}>Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191818' },

  wallpaper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },

  logoGlass: {
    width: 88,
    height: 88,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 105,
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 241, 234, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(244, 241, 234, 0.35)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: -6, height: -6 },
  },

  title: {
    color: '#F5F5F5',
    fontSize: 40,
    fontFamily: 'Aldrich',
    marginBottom: 10,
  },

  subtitle: {
    color: '#F5F5F5',
    fontSize: 20,
    fontFamily: 'Aldrich',
  },

  lowerContent: {
    marginTop: 210,
  },

  card: {
    height: 82,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 18,
    shadowColor: '#F5F5F5',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {
      width: -4,
      height: -4,
    },
  },

  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(217, 217, 217, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -9,
    marginRight: 22,
  },

  cardTextWrap: {
    flex: 1,
  },

  cardTitle: {
    color: '#F5F5F5',
    fontSize: 15,
    fontFamily: 'Aldrich',
  },

  cardText: {
    color: '#F5F5F5',
    fontSize: 11,
    fontFamily: 'Aldrich',
    marginTop: 8,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  loginButton: {
    width: '48%',
    height: 53,
    borderRadius: 30,

    backgroundColor: 'rgba(9, 42, 255, 0.61)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 8,

    overflow: 'hidden',
    },

  signupButton: {
    width: '48%',
    height: 53,
    borderRadius: 30,
    backgroundColor: 'rgba(217,217,217,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 8,
  },

  buttonText: {
    color: '#F5F5F5',
    fontSize: 18,
    fontFamily: 'Aldrich',
    marginTop: 3,
  },

  buttonBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    },
});