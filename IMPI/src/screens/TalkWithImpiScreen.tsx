import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

type Props = {
  setCurrentScreen: (screen: string) => void;
  initialChatMessage: string;
};


export default function TalkWithImpiScreen({ setCurrentScreen, initialChatMessage }: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/wallpaper.png')}
        style={styles.wallpaper}
        resizeMode="cover"
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentScreen('impiChatMenu')}
      >
        <MaterialIcons name="arrow-back" size={30} color="#F5F5F5" />
      </TouchableOpacity>

      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>Impi</Text>
        <Text style={styles.headerSubtitle}>Conservation Mentor</Text>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setCurrentScreen('home')}
      >
        <MaterialIcons name="close" size={30} color="#F5F5F5" />
      </TouchableOpacity>

      <View style={styles.chatArea}>
        {initialChatMessage ? (
            <View style={styles.userBubble}>
            <Text style={styles.bubbleText}>{initialChatMessage}</Text>
            </View>
        ) : null}

        <View style={styles.impiBubble}>
            <Text style={styles.bubbleText}>
            Tell me a conservation question and I’ll help you learn like a ranger.
            </Text>
        </View>
        </View>

      <View style={styles.bottomRow}>
        <View style={styles.askBar}>
          <TextInput
            style={styles.askInput}
            placeholder="Ask me anything..."
            placeholderTextColor="#F5F5F5"
          />

          <BlurView intensity={25} tint="light" style={styles.micCircle}>
            <MaterialIcons name="mic" size={28} color="#F5F5F5" />
          </BlurView>
        </View>

        <TouchableOpacity style={styles.voiceButton}>
          <MaterialIcons name="graphic-eq" size={34} color="#F5F5F5" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191818' },

  wallpaper: {
    ...StyleSheet.absoluteFillObject,
    width: '110%',
    height: '110%',
    top: -10,
    left: -10,
  },

  backButton: {
    position: 'absolute',
    top: 90,
    left: 34,
    width: 49,
    height: 49,
    borderRadius: 28,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButton: {
    position: 'absolute',
    top: 90,
    right: 34,
    width: 49,
    height: 49,
    borderRadius: 28,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerText: {
    alignItems: 'center',
    marginTop: 100,
  },

  headerTitle: {
    color: '#F5F5F5',
    fontSize: 26,
    fontFamily: 'Aldrich',
  },

  headerSubtitle: {
    color: '#F5F5F5',
    fontSize: 15,
    fontFamily: 'Aldrich',
    marginTop: 4,
  },

  chatArea: {
    flex: 1,
    paddingHorizontal: 34,
    marginTop: 50,
  },

  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '78%',
    borderRadius: 25,
    borderBottomRightRadius: 0,
    backgroundColor: 'rgba(158,154,81,0.75)',
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginBottom: 28,
  },

  impiBubble: {
    alignSelf: 'flex-start',
    maxWidth: '78%',
    borderRadius: 25,
    backgroundColor: 'rgba(217,217,217,0.20)',
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomLeftRadius: 0,
  },

  bubbleText: {
    color: '#F5F5F5',
    fontSize: 12,
    fontFamily: 'Aldrich',
    lineHeight: 16,
  },

  bottomRow: {
    position: 'absolute',
    left: 34,
    right: 34,
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  askBar: {
    width: '78%',
    height: 72,
    borderRadius: 39,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingLeft: 32,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  askInput: {
    flex: 1,
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Aldrich',
    marginTop: 5,
  },

  micCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(217,217,217,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  voiceButton: {
    width: 72,
    height: 72,
    borderRadius: 39,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});