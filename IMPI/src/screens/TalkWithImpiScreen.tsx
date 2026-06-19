import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { PanResponder } from 'react-native';
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

type Scenario = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type ScenarioAttempt = {
  scenario: Scenario;
  selectedIndex: number;
};

const scenarios: Scenario[] = [
  {
    question:
      'You are on patrol and discover a damaged fence near a rhino breeding area. Fresh footprints are visible nearby. What should you do?',
    options: [
      'Follow the footprints alone immediately.',
      'Record the location, report the damage and request backup.',
      'Ignore it because animals often damage fences.',
    ],
    correctIndex: 1,
    explanation:
      'The safest decision is B. A ranger should record the location, report the fence damage and request backup before moving into a possible risk area.',
  },
  {
    question:
      'You notice a group of tourists getting too close to elephants near a waterhole. What should you do?',
    options: [
      'Warn them calmly and guide them to a safer distance.',
      'Shout loudly to scare the elephants away.',
      'Ignore it because tourists are responsible for themselves.',
    ],
    correctIndex: 0,
    explanation:
      'The best answer is A. Rangers help protect both people and wildlife by reducing stress and keeping a safe distance.',
  },
  {
    question:
      'You find an injured animal during patrol. What is the best first action?',
    options: [
      'Try to treat the animal yourself immediately.',
      'Record the location and report it to the correct wildlife team.',
      'Move the animal to a different area.',
    ],
    correctIndex: 1,
    explanation:
      'The correct answer is B. Rangers should report the location and situation so trained wildlife specialists can respond safely.',
  },
];

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

  const IMPI_API_URL =
    'https://us-central1-impi-ranger.cloudfunctions.net/askImpi';

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [scenarioAnswered, setScenarioAnswered] = useState(false);
  const [scenarioAttempts, setScenarioAttempts] = useState<ScenarioAttempt[]>([]);

  const scrollRef = useRef<ScrollView>(null);
  const hasCreatedInitialChat = useRef(false);
  const shouldAutoScroll = useRef(false);

  const headerTitle = 'Impi';

  const headerSubtitle =
    chatMode === 'stories'
      ? 'Ranger Stories'
      : chatMode === 'scenarios'
        ? 'Decision Scenarios'
        : 'Conservation Mentor';

  const generateChatTitle = (text: string) => {
    const cleanText = text.trim();
    if (cleanText.length <= 32) return cleanText;
    return `${cleanText.slice(0, 32)}...`;
  };

  const swipeBackResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dx > 25 && Math.abs(gesture.dy) < 20,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 90) {
          setCurrentScreen(chatMode === 'scenarios' ? 'home' : 'impiChatMenu');
        }
      },
    })
  ).current;

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
    shouldAutoScroll.current = false;

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
        setMessages([]);

        setTimeout(() => {
          setMessage('');
          handleSendInitialMessage(initialChatMessage);
        }, 100);
      } else {
        setMessages([]);
      }

      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }

    loadChat();
  }, [initialChatMessage, selectedChatId, chatMode]);

  useEffect(() => {
    if (!shouldAutoScroll.current) return;

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
      shouldAutoScroll.current = false;
    }, 100);
  }, [messages, isTyping, scenarioAttempts, scenarioIndex]);

  const handleScenarioAnswer = (optionIndex: number) => {
    const currentScenario = scenarios[scenarioIndex];

    shouldAutoScroll.current = true;

    setScenarioAttempts((previousAttempts) => [
      ...previousAttempts,
      {
        scenario: currentScenario,
        selectedIndex: optionIndex,
      },
    ]);

    setScenarioAnswered(true);
  };

  const handleNextScenario = () => {
    shouldAutoScroll.current = true;
    setScenarioAnswered(false);

    setScenarioIndex((previousIndex) =>
      previousIndex === scenarios.length - 1 ? 0 : previousIndex + 1
    );
  };

  const handleSendInitialMessage = async (initialMessage: string) => {
    const userUpdatedMessages: ChatMessage[] = [
      { role: 'user', content: initialMessage },
    ];

    setMessages(userUpdatedMessages);
    setIsTyping(true);
    shouldAutoScroll.current = true;

    try {
      const response = await fetch(IMPI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: initialMessage,
          conversation: [],
        }),
      });

      const data = await response.json();

      const finalMessages: ChatMessage[] = [
        ...userUpdatedMessages,
        {
          role: 'impi',
          content: data.reply || 'Sorry, I could not generate a response.',
        },
      ];

      setMessages(finalMessages);

      await saveNewChat(finalMessages);
    } catch (error) {
      console.log(error);

      const errorMessages: ChatMessage[] = [
        ...userUpdatedMessages,
        {
          role: 'impi',
          content: 'Sorry, IMPI could not connect right now.',
        },
      ];

      setMessages(errorMessages);
    } finally {
      setIsTyping(false);
      shouldAutoScroll.current = true;
      setMessage('');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();

    const userUpdatedMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];

    setMessages(userUpdatedMessages);
    setMessage('');
    setIsTyping(true);
    shouldAutoScroll.current = true;

    try {
      const response = await fetch(IMPI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversation: messages,
        }),
      });

      const data = await response.json();

      const finalMessages: ChatMessage[] = [
        ...userUpdatedMessages,
        {
          role: 'impi',
          content: data.reply || 'Sorry, I could not generate a response.',
        },
      ];

      setMessages(finalMessages);

      if (selectedChatId) {
        await updateExistingChat(finalMessages);
      } else {
        await saveNewChat(finalMessages);
      }
    } catch (error) {
      console.log(error);

      const errorMessages: ChatMessage[] = [
        ...userUpdatedMessages,
        {
          role: 'impi',
          content: 'Sorry, IMPI could not connect right now.',
        },
      ];

      setMessages(errorMessages);
    } finally {
      setIsTyping(false);
      shouldAutoScroll.current = true;
      setMessage('');
    }
  };

  const renderMessage = (content: string) => {
  const lines = content.split('\n');

  return lines.map((line, index) => {
    const headingMatch = line.match(/^(\d+\.\s*)?\*\*(.*?)\*\*:?\s*(.*)/);

    if (headingMatch) {
      const number = headingMatch[1] || '';
      const heading = headingMatch[2];
      const textAfterHeading = headingMatch[3];

      return (
        <View key={index} style={styles.messageSection}>
          <Text style={styles.messageHeading}>
            {number}{heading}
          </Text>

          {textAfterHeading ? (
            <Text style={styles.bubbleText}>{textAfterHeading}</Text>
          ) : null}
        </View>
      );
    }

    return (
      <Text key={index} style={styles.bubbleText}>
        {line.replace(/\*\*/g, '')}
      </Text>
    );
  });
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-28}
    >
      <View style={styles.screenContent} {...swipeBackResponder.panHandlers}>
        <Image
          source={require('../../assets/images/wallpaper.png')}
          style={styles.wallpaper}
          resizeMode="cover"
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            chatMode === 'scenarios'
              ? setCurrentScreen('home')
              : setCurrentScreen('impiChatMenu')
          }
        >
          <MaterialIcons name="arrow-back" size={30} color="#F5F5F5" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
        </View>

        {chatMode !== 'scenarios' ? (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCurrentScreen('home')}
          >
            <MaterialIcons name="close" size={30} color="#F5F5F5" />
          </TouchableOpacity>
        ) : null}

        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
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
              {chatMessage.role === 'impi' ? (
                renderMessage(chatMessage.content)
              ) : (
                <Text style={styles.bubbleText}>{chatMessage.content}</Text>
              )}
            </View>
          ))}

          {chatMode === 'scenarios' ? (
            <>
              {scenarioAttempts.map((attempt, attemptIndex) => {
                const wasCorrect =
                  attempt.selectedIndex === attempt.scenario.correctIndex;

                return (
                  <View key={attemptIndex} style={styles.scenarioCard}>
                    <Text style={styles.scenarioTitle}>Decision Scenario</Text>

                    <Text style={styles.scenarioQuestion}>
                      {attempt.scenario.question}
                    </Text>

                    {attempt.scenario.options.map((option, index) => {
                      const isSelected = attempt.selectedIndex === index;
                      const isCorrect = attempt.scenario.correctIndex === index;

                      return (
                        <View
                          key={index}
                          style={[
                            styles.optionButton,
                            isSelected && isCorrect && styles.correctOption,
                            isSelected && !isCorrect && styles.wrongOption,
                            !isSelected && isCorrect && styles.correctOption,
                          ]}
                        >
                          <Text style={styles.optionText}>
                            {String.fromCharCode(65 + index)}) {option}
                          </Text>
                        </View>
                      );
                    })}

                    <Text style={styles.explanationText}>
                      {wasCorrect ? 'Correct. ' : 'Not quite. '}
                      {attempt.scenario.explanation}
                    </Text>
                  </View>
                );
              })}

              {!scenarioAnswered ? (
                <View style={styles.scenarioCard}>
                  <Text style={styles.scenarioTitle}>Decision Scenario</Text>

                  <Text style={styles.scenarioQuestion}>
                    {scenarios[scenarioIndex].question}
                  </Text>

                  {scenarios[scenarioIndex].options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.optionButton}
                      onPress={() => handleScenarioAnswer(index)}
                    >
                      <Text style={styles.optionText}>
                        {String.fromCharCode(65 + index)}) {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.nextScenarioButton}
                  onPress={handleNextScenario}
                >
                  <Text style={styles.nextScenarioText}>Next Question</Text>
                </TouchableOpacity>
              )}
            </>
          ) : null}

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
    paddingBottom: 130,
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

  messageSection: {
    marginBottom: 10,
  },

  messageHeading: {
    color: '#F5F5F5',
    fontSize: 15,
    fontFamily: 'Aldrich',
    lineHeight: 20,
    marginBottom: 6,
  },

  scenarioCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 22,
    marginBottom: 28,
  },

  scenarioTitle: {
    color: '#F5F5F5',
    fontSize: 15,
    fontFamily: 'Aldrich',
    marginBottom: 16,
  },

  scenarioQuestion: {
    color: '#F5F5F5',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Aldrich',
    marginBottom: 18,
  },

  optionButton: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(217,217,217,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginBottom: 12,
  },

  correctOption: {
    backgroundColor: 'rgba(80,150,90,0.45)',
    borderColor: 'rgba(170,255,180,0.55)',
  },

  wrongOption: {
    backgroundColor: 'rgba(160,60,60,0.45)',
    borderColor: 'rgba(255,130,130,0.65)',
  },

  optionText: {
    color: '#F5F5F5',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'Aldrich',
  },

  explanationText: {
    color: '#F5F5F5',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Aldrich',
    marginTop: 10,
    marginBottom: 16,
  },

  nextScenarioButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(217,217,217,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },

  nextScenarioText: {
    color: '#F5F5F5',
    fontSize: 13,
    fontFamily: 'Aldrich',
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