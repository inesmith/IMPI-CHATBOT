import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';

import ImpiLogo from '../../assets/images/ImpiLogo.svg';

type Props = {
  setCurrentScreen: (screen: string) => void;
  setInitialChatMessage: (message: string) => void;
  setSelectedChatId: (chatId: string | null) => void;
};

export default function ImpiChatMenuScreen({
  setCurrentScreen,
  setInitialChatMessage,
  setSelectedChatId,
}: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [message, setMessage] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
        setSelectedChatId(null);
        setInitialChatMessage(message.trim());
        setMessage('');
        Keyboard.dismiss();
        setCurrentScreen('talkWithImpi');
    }
    };

  const handleSuggestionPress = (text: string) => {
    setSelectedChatId(null);
    setInitialChatMessage(text);
    setCurrentScreen('talkWithImpi');
    };

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardOpen(true);
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardOpen(false);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/wallpaper.png')}
          style={styles.wallpaper}
          resizeMode="cover"
        />

        <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('chatHistory')}
            >
            <MaterialIcons name="history" size={30} color="#F5F5F5" />
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

        <View style={styles.centerContent}>
          <ImpiLogo width={145} height={145} />

          <Text style={styles.title}>Learn with IMPI</Text>

          <Text style={styles.subtitle}>
            Ask questions, explore stories, and learn how{'\n'}
            rangers protect ecosystems.
          </Text>

          <View style={styles.suggestionGrid}>
            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => handleSuggestionPress('What happens during a patrol?')}
            >
              <Text style={styles.suggestionText}>What happens during a patrol?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => handleSuggestionPress('Test me with a scenario')}
            >
              <Text style={styles.suggestionText}>Test me with a scenario</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => handleSuggestionPress('Tell me a ranger story')}
            >
              <Text style={styles.suggestionText}>Tell me a ranger story</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => handleSuggestionPress('What does a ranger actually do?')}
            >
              <Text style={styles.suggestionText}>What does a ranger actually do?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.bottomRow, keyboardOpen && styles.bottomRowKeyboardOpen]}>
          <View style={styles.askBar}>
            <TextInput
              style={styles.askInput}
              placeholder="Ask me anything..."
              placeholderTextColor="#F5F5F5"
              value={message}
              onChangeText={setMessage}
              multiline
              returnKeyType="default"
              textAlignVertical="center"
            />

            <TouchableOpacity onPress={handleSendMessage}>
              <BlurView intensity={24} tint="light" style={styles.micCircle}>
                <MaterialIcons name="arrow-upward" size={25} color="#F5F5F5" />
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#605737',
  },

  wallpaper: {
    ...StyleSheet.absoluteFillObject,
    width: '110%',
    height: '110%',
    left: -10,
    top: -10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 18,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 18,
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

  centerContent: {
    alignItems: 'center',
    marginTop: 115,
  },

  title: {
    color: '#F5F5F5',
    fontSize: 32,
    fontFamily: 'Aldrich',
    marginTop: 19,
  },

  subtitle: {
    color: '#F5F5F5',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },

  suggestionGrid: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
    top: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 18,
  },

  suggestionButton: {
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },

  suggestionText: {
    color: '#F5F5F5',
    fontSize: 10,
    fontFamily: 'Aldrich',
    textAlign: 'center',
  },

  bottomRow: {
    position: 'absolute',
    left: 34,
    right: 34,
    bottom: 48,
  },

  bottomRowKeyboardOpen: {
    bottom: 360,
    backgroundColor: '#605737f0',
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 39,
  },

  askBar: {
    width: '100%',
    minHeight: 72,
    maxHeight: 120,
    borderRadius: 39,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingLeft: 32,
    paddingRight: 8,
    paddingVertical: 8,                                   
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  askInput: {
    flex: 1,
    maxHeight: 90,
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Aldrich',
    paddingRight: 14,
    paddingTop: 0,
    paddingBottom: 0,
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
});