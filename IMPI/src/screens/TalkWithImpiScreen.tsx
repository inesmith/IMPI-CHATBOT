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

import ImpiLogo from '../../assets/images/ImpiLogo.svg';
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
  afterMessageCount: number;
};

const fallbackScenario: Scenario = {
  question:
    'A ranger spends hours recording animal tracks and signs, even when nothing dramatic happens. What does this teach us about conservation work?',
  options: [
    'Most conservation work is about careful observation and information gathering.',
    'Rangers only record tracks when they are bored.',
    'A patrol only matters if something dangerous happens.',
  ],
  correctIndex: 0,
  explanation:
    'A lot of ranger work is quiet and careful. Tracks, sightings and small changes help conservation teams understand what is happening in the landscape.',
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

  const IMPI_API_URL =
    'https://us-central1-impi-ranger.cloudfunctions.net/askImpi';

  const IMPI_SCENARIO_URL =
    'https://us-central1-impi-ranger.cloudfunctions.net/generateImpiScenario';

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [scenarioAnswered, setScenarioAnswered] = useState(false);
  const [scenarioAttempts, setScenarioAttempts] = useState<ScenarioAttempt[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [activeScenarioAfterMessageCount, setActiveScenarioAfterMessageCount] =
    useState(2);

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

  const loadNewScenario = async (afterMessageCount = 2) => {
    setScenarioLoading(true);
    setCurrentScenario(null);
    setActiveScenarioAfterMessageCount(afterMessageCount);

    try {
      const response = await fetch(IMPI_SCENARIO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (
        data?.question &&
        Array.isArray(data?.options) &&
        data.options.length === 3 &&
        typeof data.correctIndex === 'number' &&
        data?.explanation
      ) {
        setCurrentScenario(data);
      } else {
        setCurrentScenario(fallbackScenario);
      }
    } catch (error) {
      console.log(error);
      setCurrentScenario(fallbackScenario);
    } finally {
      setScenarioLoading(false);
    }
  };

  const saveNewChat = async (chatMessages: ChatMessage[]) => {
    try {
      if (!auth.currentUser) return;

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

      if (chatMode === 'scenarios') {
        setMessages([
          { role: 'user', content: 'Test me with a scenario' },
          {
            role: 'impi',
            content:
              'Ready for a challenge? Read the situation below and choose the option you think best explains the reality of ranger work.',
          },
        ]);

        setScenarioAttempts([]);
        setCorrectAnswers(0);
        setScenarioAnswered(false);
        await loadNewScenario(2);
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
  }, [messages, isTyping, scenarioAttempts, currentScenario, scenarioLoading]);

  const handleScenarioAnswer = (optionIndex: number) => {
    if (!currentScenario) return;

    shouldAutoScroll.current = true;

    if (optionIndex === currentScenario.correctIndex) {
      setCorrectAnswers((prev) => prev + 1);
    }

    setScenarioAttempts((previousAttempts) => [
      ...previousAttempts,
      {
        scenario: currentScenario,
        selectedIndex: optionIndex,
        afterMessageCount: activeScenarioAfterMessageCount,
      },
    ]);

    setScenarioAnswered(true);
  };

  const handleNextScenario = async () => {
    shouldAutoScroll.current = true;
    setScenarioAnswered(false);
    await loadNewScenario(activeScenarioAfterMessageCount);
  };

  const handleContinueScenarioAfterChat = async () => {
    shouldAutoScroll.current = true;
    setScenarioAnswered(false);
    await loadNewScenario(messages.length);
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
        headers: { 'Content-Type': 'application/json' },
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

      setMessages([
        ...userUpdatedMessages,
        {
          role: 'impi',
          content: 'Sorry, IMPI could not connect right now.',
        },
      ]);
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
        headers: { 'Content-Type': 'application/json' },
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

      setMessages([
        ...userUpdatedMessages,
        {
          role: 'impi',
          content: 'Sorry, IMPI could not connect right now.',
        },
      ]);
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
              {number}
              {heading}
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

  const lastImpiMessageIndex = messages
    .map((item, index) => (item.role === 'impi' ? index : -1))
    .filter((index) => index !== -1)
    .pop();

  const renderChatBubble = (chatMessage: ChatMessage, realIndex: number) => {
    const showImpiLogo =
      chatMessage.role === 'impi' && realIndex === lastImpiMessageIndex;

    return (
      <View
        key={`message-${realIndex}`}
        style={[
          styles.messageRow,
          chatMessage.role === 'user' && styles.userMessageRow,
        ]}
      >
        {showImpiLogo ? (
          <View style={styles.impiLogoWrap}>
            <ImpiLogo width={28} height={28} />
          </View>
        ) : null}

        <View
          style={
            chatMessage.role === 'user' ? styles.userBubble : styles.impiBubble
          }
        >
          {chatMessage.role === 'impi' ? (
            renderMessage(chatMessage.content)
          ) : (
            <Text style={styles.bubbleText}>{chatMessage.content}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderScenarioAttempt = (
    attempt: ScenarioAttempt,
    attemptIndex: number
  ) => {
    const wasCorrect = attempt.selectedIndex === attempt.scenario.correctIndex;

    return (
      <View key={`attempt-${attemptIndex}`} style={styles.scenarioCard}>
        <Text style={styles.scenarioTitle}>Learning Scenario</Text>

        <Text style={styles.scoreText}>
          Score: {correctAnswers}/{scenarioAttempts.length}
        </Text>

        <Text style={styles.scenarioQuestion}>{attempt.scenario.question}</Text>

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
          {wasCorrect ? 'Good observation. ' : 'Not quite. '}
          {attempt.scenario.explanation}
        </Text>
      </View>
    );
  };

  const renderActiveScenario = () => {
    if (scenarioLoading) {
      return (
        <View style={styles.impiBubble}>
          <Text style={styles.bubbleText}>IMPI is preparing a scenario...</Text>
        </View>
      );
    }

    if (!currentScenario || scenarioAnswered) return null;

    return (
      <View style={styles.scenarioCard}>
        <Text style={styles.scenarioTitle}>Learning Scenario</Text>

        <Text style={styles.scoreText}>
          Score: {correctAnswers}/{scenarioAttempts.length}
        </Text>

        <Text style={styles.scenarioQuestion}>{currentScenario.question}</Text>

        {currentScenario.options.map((option, index) => (
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
    );
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
          {chatMode === 'scenarios' ? (
            <>
              {messages.slice(0, 2).map((chatMessage, index) =>
                renderChatBubble(chatMessage, index)
              )}

              {scenarioAttempts
                .filter((attempt) => attempt.afterMessageCount === 2)
                .map(renderScenarioAttempt)}

              {activeScenarioAfterMessageCount === 2
                ? renderActiveScenario()
                : null}

              {scenarioAnswered &&
              activeScenarioAfterMessageCount === 2 &&
              messages.length <= 2 ? (
                <TouchableOpacity
                  style={styles.nextScenarioButton}
                  onPress={handleNextScenario}
                >
                  <Text style={styles.nextScenarioText}>Next Scenario</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}

          {messages
            .slice(chatMode === 'scenarios' ? 2 : 0)
            .map((chatMessage, index) => {
              const realIndex = chatMode === 'scenarios' ? index + 2 : index;
              const renderedMessageCount = realIndex + 1;

              return (
                <View key={`message-group-${realIndex}`}>
                  {renderChatBubble(chatMessage, realIndex)}

                  {chatMode === 'scenarios'
                    ? scenarioAttempts
                        .filter(
                          (attempt) =>
                            attempt.afterMessageCount === renderedMessageCount
                        )
                        .map(renderScenarioAttempt)
                    : null}

                  {chatMode === 'scenarios' &&
                  activeScenarioAfterMessageCount === renderedMessageCount
                    ? renderActiveScenario()
                    : null}
                </View>
              );
            })}

          {chatMode === 'scenarios' &&
          messages.length > 2 &&
          scenarioAnswered ? (
            <TouchableOpacity
              style={styles.nextScenarioButton}
              onPress={handleContinueScenarioAfterChat}
            >
              <Text style={styles.nextScenarioText}>
                Continue with More Scenarios
              </Text>
            </TouchableOpacity>
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

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
    marginBottom: 28,
  },

  userMessageRow: {
    alignSelf: 'flex-end',
  },

  impiLogoWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(217,217,217,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },

  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '78%',
    borderRadius: 25,
    borderBottomRightRadius: 0,
    backgroundColor: 'rgba(158,154,81,0.75)',
    paddingHorizontal: 22,
    paddingVertical: 14,
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
    paddingVertical: 18,
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

  scoreText: {
    color: '#F5F5F5',
    fontSize: 12,
    fontFamily: 'Aldrich',
    marginBottom: 10,
    opacity: 0.8,
  },
});