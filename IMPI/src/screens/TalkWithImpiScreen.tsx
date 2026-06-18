import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useFonts } from 'expo-font';
import {
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  collection,
} from 'firebase/firestore';

import { auth, db } from '../services/firebaseConfig';

type Props = {
  setCurrentScreen: (screen: string) => void;
  initialChatMessage: string;
  selectedChatId: string | null;
  setSelectedChatId: (chatId: string | null) => void;
  chatMode: 'general' | 'stories' | 'scenarios';
};

type ChatMessage = {
  role: 'user' | 'impi';
  content: string;
};

export default function TalkWithImpiScreen({
  setCurrentScreen,
  initialChatMessage,
  selectedChatId,
  setSelectedChatId,
  chatMode,
}: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const hasCreatedInitialChat = useRef(false);

  const headerTitle =
  chatMode === 'stories'
    ? 'Impi'
    : chatMode === 'scenarios'
      ? 'Impi'
      : 'Impi';

    const headerSubtitle =
    chatMode === 'stories'
        ? 'Ranger Stories'
        : chatMode === 'scenarios'
        ? 'Decision Scenarios'
        : 'Conservation Mentor';

        const impiIntro =
        chatMode === 'stories'
            ? 'Ask me for a ranger story and I’ll explain what it teaches about conservation.'
            : chatMode === 'scenarios'
            ? 'I’ll give you a conservation scenario. Choose what you would do, then I’ll explain if your answer is correct or incorrect.'
            : 'Tell me a conservation question and I’ll help you learn like a ranger.';

  const generateChatTitle = (text: string) => {
    const cleanText = text.trim();

    if (cleanText.length <= 32) return cleanText;

    return `${cleanText.slice(0, 32)}...`;
  };

  const saveNewChat = async (chatMessages: ChatMessage[]) => {
    try {
      if (!auth.currentUser) {
        console.log('NO CURRENT USER');
        return;
      }

      const firstUserMessage =
        chatMessages.find((item) => item.role === 'user')?.content ||
        'New IMPI Chat';

      const lastMessage =
        chatMessages[chatMessages.length - 1]?.content || firstUserMessage;

      const chatDoc = await addDoc(collection(db, 'chatHistory'), {
        userId: auth.currentUser.uid,
        title: generateChatTitle(firstUserMessage),
        lastMessage,
        messages: chatMessages,
        chatMode,
        pinned: false,
        archived: false,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      console.log('CHAT SAVED:', chatDoc.id);
      setSelectedChatId(chatDoc.id);
    } catch (error) {
      console.log('SAVE CHAT ERROR:', error);
    }
  };

  const updateExistingChat = async (chatMessages: ChatMessage[]) => {
    if (!auth.currentUser || !selectedChatId) return;

    const firstUserMessage =
      chatMessages.find((item) => item.role === 'user')?.content || 'IMPI Chat';

    const lastMessage =
      chatMessages[chatMessages.length - 1]?.content || firstUserMessage;

    await updateDoc(doc(db, 'chatHistory', selectedChatId), {
      title: generateChatTitle(firstUserMessage),
      lastMessage,
      messages: chatMessages,
      chatMode,
      updatedAt: serverTimestamp(),
    });
  };

  useEffect(() => {
    hasCreatedInitialChat.current = false;

    async function loadChat() {
      if (selectedChatId) {
        const chatDoc = await getDoc(doc(db, 'chatHistory', selectedChatId));

        if (chatDoc.exists()) {
          const data = chatDoc.data();
          setMessages(data.messages || []);
        }

        return;
      }

      if (initialChatMessage) {
        const newMessages: ChatMessage[] = [
          { role: 'user', content: initialChatMessage },
          { role: 'impi', content: impiIntro },
        ];

        setMessages(newMessages);

        if (!hasCreatedInitialChat.current) {
          hasCreatedInitialChat.current = true;
          await saveNewChat(newMessages);
        }
      } else {
        setMessages([{ role: 'impi', content: impiIntro }]);
      }
    }

    loadChat();
  }, [initialChatMessage, selectedChatId, chatMode]);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    const impiResponse =
      'IMPI will answer this properly once OpenAI is connected.';

    const userUpdatedMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];

    setMessages(userUpdatedMessages);
    setMessage('');
    setIsTyping(true);

    setTimeout(async () => {
      const finalMessages: ChatMessage[] = [
        ...userUpdatedMessages,
        { role: 'impi', content: impiResponse },
      ];

      setMessages(finalMessages);
      setIsTyping(false);

      if (selectedChatId) {
        await updateExistingChat(finalMessages);
      } else {
        await saveNewChat(finalMessages);
      }
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
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
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

              <TouchableOpacity onPress={handleSendMessage}>
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
});