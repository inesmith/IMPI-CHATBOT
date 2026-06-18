import {
  Animated,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useFonts } from 'expo-font';

type Props = {
  setCurrentScreen: (screen: string) => void;
  initialChatMessage: string;
};

type ChatMessage = {
  role: 'user' | 'impi';
  content: string;
};

export default function TalkWithImpiScreen({
  setCurrentScreen,
  initialChatMessage,
}: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (initialChatMessage) {
      setMessages([
        { role: 'user', content: initialChatMessage },
        {
          role: 'impi',
          content: 'Tell me a conservation question and I’ll help you learn like a ranger.',
        },
      ]);
    } else {
      setMessages([
        {
          role: 'impi',
          content: 'Tell me a conservation question and I’ll help you learn like a ranger.',
        },
      ]);
    }
  }, [initialChatMessage]);


  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage = message.trim();

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: userMessage },
    ]);

    setMessage('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'impi',
          content: 'IMPI will answer this properly once OpenAI is connected.',
        },
      ]);

      setIsTyping(false);
    }, 900);
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-28}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.screenContent}>
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

          <ScrollView
            keyboardShouldPersistTaps="handled"
            ref={scrollRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((chatMessage, index) => (
              <View
                key={index}
                style={
                  chatMessage.role === 'user'
                    ? styles.userBubble
                    : styles.impiBubble
                }
              >
                <Text style={styles.bubbleText}>{chatMessage.content}</Text>
              </View>
            ))}

            {isTyping ? (
              <View style={styles.impiBubble}>
                <Text style={styles.bubbleText}>IMPI is thinking...</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.bottomRow}>
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

              <TouchableOpacity
                onPress={() => {
                    if (message.trim()) {
                    handleSendMessage();
                    } else {
                    setCurrentScreen('voiceInput');
                    }
                }}
                >
                <BlurView intensity={25} tint="light" style={styles.micCircle}>
                  <MaterialIcons name="arrow-upward" size={25} color="#F5F5F5" />
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#605737' },

  screenContent: {
    flex: 1,
  },

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

  chatContent: {
    paddingBottom: 20,
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
    marginBottom: 28,
  },

  bubbleText: {
    color: '#F5F5F5',
    fontSize: 12,
    fontFamily: 'Aldrich',
    lineHeight: 16,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 34,
    paddingBottom: 48,
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