import { Image, StyleSheet, Text, TouchableOpacity, View, PanResponder, } from 'react-native';
import { useFonts } from 'expo-font';

import Arrow from '../../assets/images/arrow.svg';

type Props = {
  setCurrentScreen: (screen: string) => void;
};

export default function ImpiChatMenuScreen({ setCurrentScreen }: Props) {
  const [fontsLoaded] = useFonts({
        Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
    });

    const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dx > 20;
    },

    onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
        setCurrentScreen('home');
        }
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.outerContainer}>
        <Image
            source={require('../../assets/images/dust.png')}
            style={styles.dust}
            resizeMode="cover"
        />

        <View
            style={styles.container}
            {...panResponder.panHandlers}
        >

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      <Text style={styles.topPillText}>IMPI</Text>

      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>
        HOW MAY I GUIDE{'\n'}YOU TODAY?
      </Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() => setCurrentScreen('talkWithImpi')}
        >
          <Text style={styles.buttonText}>ARMED & UNARMED LAW ENFORCEMENT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() => setCurrentScreen('talkWithImpi')}
        >
          <Text style={styles.buttonText}>ANTI-POACHING OPERATIONS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.orangeButton}
          onPress={() => setCurrentScreen('talkWithImpi')}
        >
          <Text style={styles.buttonText}>CONSERVATION </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.greenButton}
          onPress={() => setCurrentScreen('talkWithImpi')}
        >
          <Text style={styles.buttonText}>START MY OWN CHAT</Text>
          <Arrow width={24} height={24} />
        </TouchableOpacity>
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#191818',
  },

  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 75,
  },

  dust: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  backButton: {
    position: 'absolute',
    top: 70,
    left: 22,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  backArrow: {
    color: '#CFC4B2',
    fontSize: 34,
    fontFamily: 'Aldrich',
    marginTop: -13,
    marginLeft: -2,
  },

  topPillText: {
    color: '#CFC4B2',
    fontSize: 20,
    fontFamily: 'Aldrich',
    letterSpacing: 2,
    marginTop: 2,
  },

  logo: {
    width: 350,
    height: 350,
    marginBottom: 20,
    marginLeft: 20,
  },

  title: {
    color: '#CFC4B2',
    fontSize: 23,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    lineHeight: 31,
    letterSpacing: 2,
    marginBottom: 52,
  },

  buttonGroup: {
    width: '100%',
  },

  orangeButton: {
    height: 58,
    width: '95%',
    alignSelf: 'center',
    borderRadius: 18,
    backgroundColor: '#8033077c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 24,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  greenButton: {
    height: 58,
    width: '95%',
    alignSelf: 'center',
    borderRadius: 18,
    backgroundColor: '#676127a3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  buttonText: {
    color: '#CFC4B2',
    fontSize: 12,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
  },
});