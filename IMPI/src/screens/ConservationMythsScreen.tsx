import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { useFonts } from 'expo-font';
import { BlurView } from 'expo-blur';

type Props = {
  setCurrentScreen: (screen: string) => void;
};

type MythCard = {
  statement: string;
  answer: 'myth' | 'fact';
  explanation: string;
};

const cards: MythCard[] = [
  {
    statement: 'Rangers only catch poachers.',
    answer: 'myth',
    explanation:
      'Rangers also monitor wildlife, collect data, protect habitats and support conservation education.',
  },
  {
    statement: 'Healthy predators help keep ecosystems balanced.',
    answer: 'fact',
    explanation:
      'Predators help regulate prey populations and support biodiversity in natural ecosystems.',
  },
  {
    statement: 'All snakes are dangerous.',
    answer: 'myth',
    explanation:
      'Most snakes are harmless and play an important role by controlling pests.',
  },
  {
    statement: 'Conservation protects animals, plants, water and communities.',
    answer: 'fact',
    explanation:
      'Conservation is about protecting whole ecosystems, not only individual animals.',
  },
  {
    statement: 'Wild animals are usually happier in captivity.',
    answer: 'myth',
    explanation:
      'Most wild animals thrive best in natural ecosystems where they can follow natural behaviours.',
  },
  {
    statement: 'Rangers collect field data to help protect ecosystems.',
    answer: 'fact',
    explanation:
      'Field data helps conservation teams understand animal movement, habitat health and risks in the environment.',
  },
];

export default function ConservationMythsScreen({ setCurrentScreen }: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [chosenAnswer, setChosenAnswer] = useState<'myth' | 'fact' | null>(null);

  const position = useRef(new Animated.ValueXY()).current;
  const wrongBorderOpacity = useRef(new Animated.Value(0)).current;

  const rotate = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const currentCard = cards[currentIndex];
  const nextCard = cards[(currentIndex + 1) % cards.length];

  const currentCardRef = useRef(currentCard);
    currentCardRef.current = currentCard;

  const goToNextCard = () => {
    setShowResult(false);
    setChosenAnswer(null);
    wrongBorderOpacity.setValue(0);
    position.setValue({ x: 0, y: 0 });

    setCurrentIndex((previousIndex) =>
      previousIndex === cards.length - 1 ? 0 : previousIndex + 1
    );
  };

  const triggerWrongFeedback = () => {
    Vibration.vibrate(140);

    Animated.sequence([
      Animated.timing(wrongBorderOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: false,
      }),
      Animated.timing(wrongBorderOpacity, {
        toValue: 0.25,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.timing(wrongBorderOpacity, {
        toValue: 0.9,
        duration: 120,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleAnswer = (answer: 'myth' | 'fact', cardToCheck: MythCard) => {
    const correct = answer === cardToCheck.answer;

    setChosenAnswer(answer);
    setWasCorrect(correct);

    if (correct) {
        Animated.timing(position, {
        toValue: {
            x: answer === 'fact' ? 500 : -500,
            y: 0,
        },
        duration: 260,
        useNativeDriver: false,
        }).start(() => {
        goToNextCard();
        });
    } else {
        triggerWrongFeedback();

        Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
        }).start(() => {
        setShowResult(true);
        });
    }
    };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !showResult,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        const cardToCheck = currentCardRef.current;

        if (gesture.dx > 120) {
            handleAnswer('fact', cardToCheck);
        } else if (gesture.dx < -120) {
            handleAnswer('myth', cardToCheck);
        } else {
            Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            }).start();
        }
        },
    })
  ).current;

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
        onPress={() => setCurrentScreen('home')}
      >
        <MaterialIcons name="arrow-back" size={30} color="#F5F5F5" />
      </TouchableOpacity>

      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>Impi</Text>
        <Text style={styles.headerSubtitle}>Myths vs Facts</Text>
      </View>

      <View style={styles.cardWrapper}>
        <View style={styles.backCardTwo} />
        <View style={styles.backCardOne}>
          <Text style={styles.backCardText}>{nextCard.statement}</Text>
        </View>

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.animatedCard,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[styles.wrongBorderGlow, { opacity: wrongBorderOpacity }]}
          />

          <BlurView intensity={25} tint="light" style={styles.card}>
            {showResult ? (
              <>
                <Text style={styles.cardLabel}>
                  {currentCard.answer === 'myth' ? 'MYTH BUSTED' : 'FACT CHECK'}
                </Text>

                <Text style={styles.resultTitle}>
                  This is a {currentCard.answer.toUpperCase()}.
                </Text>

                <Text style={styles.explanationText}>
                  {currentCard.explanation}
                </Text>

                <TouchableOpacity style={styles.nextCardButton} onPress={goToNextCard}>
                  <Text style={styles.nextCardText}>Next Card</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardLabel}>SWIPE CARD</Text>

                <Text style={styles.cardText}>{currentCard.statement}</Text>

                <Text style={styles.cardHint}>
                  Swipe left for myth. Swipe right for fact.
                </Text>
              </>
            )}
          </BlurView>
        </Animated.View>
      </View>

      {!showResult ? (
        <View style={styles.answerGuide}>
          <View style={styles.answerPill}>
            <MaterialIcons name="arrow-back" size={18} color="#F5F5F5" />
            <Text style={styles.answerText}>MYTH</Text>
          </View>

          <Text style={styles.counterText}>
            {currentIndex + 1} / {cards.length}
          </Text>

          <View style={styles.answerPill}>
            <Text style={styles.answerText}>FACT</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#F5F5F5" />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#605737' },

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
    zIndex: 20,
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
    marginTop: 6,
  },

  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 34,
  },

  animatedCard: {
    zIndex: 10,
  },

  wrongBorderGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(255,70,70,0.95)',
    backgroundColor: 'rgba(255,70,70,0.08)',
    shadowColor: '#FF4646',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 18,
    zIndex: 20,
  },

  card: {
    minHeight: 430,
    borderRadius: 38,
    overflow: 'hidden',
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 34,
    justifyContent: 'center',
  },

  backCardOne: {
    position: 'absolute',
    left: 48,
    right: 48,
    minHeight: 400,
    borderRadius: 38,
    backgroundColor: 'rgba(217,217,217,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    transform: [{ scale: 0.94 }, { translateY: 18 }],
    justifyContent: 'center',
    padding: 34,
  },

  backCardTwo: {
    position: 'absolute',
    left: 62,
    right: 62,
    minHeight: 380,
    borderRadius: 38,
    backgroundColor: 'rgba(217,217,217,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    transform: [{ scale: 0.88 }, { translateY: 38 }],
  },

  backCardText: {
    color: '#F5F5F5',
    fontSize: 18,
    lineHeight: 25,
    fontFamily: 'Aldrich',
    opacity: 0.25,
  },

  cardLabel: {
    color: '#F5F5F5',
    fontSize: 15,
    fontFamily: 'Aldrich',
    marginBottom: 28,
    opacity: 0.85,
  },

  cardText: {
    color: '#F5F5F5',
    fontSize: 26,
    lineHeight: 36,
    fontFamily: 'Aldrich',
  },

  cardHint: {
    color: '#F5F5F5',
    fontSize: 13,
    lineHeight: 16,
    fontFamily: 'Aldrich',
    marginTop: 34,
    opacity: 0.75,
  },

  resultTitle: {
    color: '#F5F5F5',
    fontSize: 22,
    lineHeight: 30,
    fontFamily: 'Aldrich',
    marginBottom: 20,
  },

  explanationText: {
    color: '#F5F5F5',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Aldrich',
    opacity: 0.9,
  },

  nextCardButton: {
    height: 58,
    borderRadius: 31,
    backgroundColor: 'rgba(217,217,217,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 34,
  },

  nextCardText: {
    color: '#F5F5F5',
    fontSize: 14,
    fontFamily: 'Aldrich',
  },

  answerGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 34,
    paddingBottom: 55,
  },

  answerPill: {
    height: 54,
    borderRadius: 30,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  answerText: {
    color: '#F5F5F5',
    fontSize: 12,
    fontFamily: 'Aldrich',
    marginTop: 3,
  },

  counterText: {
    color: '#F5F5F5',
    fontSize: 12,
    fontFamily: 'Aldrich',
    opacity: 0.8,
  },
});