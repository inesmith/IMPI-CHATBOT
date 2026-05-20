import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, PanResponder } from 'react-native';
import { useFonts } from 'expo-font';
import { useState } from 'react';

type Props = {
  setCurrentScreen: (screen: string) => void;
};

const scenarios = [
  {
    title: 'FRESH ELEPHANT TRACKS',
    context: 'You find fresh elephant tracks near a water source. Visibility is low and the wind is shifting.',
    threat: 'MEDIUM',
    correct: 'MARK LOCATION AND OBSERVE',
    options: [
      'FOLLOW IMMEDIATELY',
      'MARK LOCATION AND OBSERVE',
      'IGNORE AND CONTINUE',
    ],
    feedback: 'Correct. Fresh tracks near water may mean the herd is close. Observe first and avoid moving blindly into the area.',
  },
  {
    title: 'POSSIBLE SNARE LINE',
    context: 'You notice disturbed grass and a narrow path leading into thick bush.',
    threat: 'HIGH',
    correct: 'CALL BACKUP AND SECURE AREA',
    options: [
      'ENTER ALONE',
      'CALL BACKUP AND SECURE AREA',
      'LEAVE THE AREA',
    ],
    feedback: 'Correct. A possible snare line can indicate poaching activity. Secure the area and report before moving deeper.',
  },
  {
    title: 'INJURED ANIMAL REPORTED',
    context: 'A tourist reports an injured antelope near the fence line.',
    threat: 'LOW',
    correct: 'REPORT AND WAIT FOR WILDLIFE TEAM',
    options: [
      'APPROACH THE ANIMAL',
      'REPORT AND WAIT FOR WILDLIFE TEAM',
      'MOVE IT YOURSELF',
    ],
    feedback: 'Correct. Injured animals can panic. Report the location and wait for the correct support team.',
  },
];

export default function ScenarioTrainingScreen({ setCurrentScreen }: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

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

  const handleSelectOption = (option: string) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[currentScenario] = option;
    setSelectedOptions(updatedOptions);
  };

  const handleNextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
    } else {
      setCurrentScreen('home');
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Image
        source={require('../../assets/images/dust.png')}
        style={styles.dust}
        resizeMode="cover"
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>SCENARIO TRAINING</Text>
      </View>

      <View style={styles.rangerCard}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.rangerText}>
          TRAINING MODE ACTIVE{'\n'}
          FIELD DECISION SYSTEM ONLINE
        </Text>
      </View>

      <View style={styles.chatArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatContent}
        >
          {scenarios.slice(0, currentScenario + 1).map((scenario, scenarioIndex) => {
            const selectedOption = selectedOptions[scenarioIndex];
            const feedbackVisible = !!selectedOption;
            const isCurrentScenario = scenarioIndex === currentScenario;

            return (
                <View
                    key={scenarioIndex}
                    style={scenarioIndex !== 0 ? styles.scenarioBlock : undefined}
                >
                <Text style={styles.scenarioPrompt}>
                  SCENARIO {scenarioIndex + 1} / {scenarios.length}  |  THREAT LEVEL: {scenario.threat}
                </Text>

                <View style={styles.impiBubble}>
                  <Text style={styles.messageLabel}>IMPI</Text>
                  <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                  <Text style={styles.messageText}>{scenario.context}</Text>
                </View>

                {!feedbackVisible && isCurrentScenario ? (
                  <Text style={styles.responsePrompt}>SELECT A RESPONSE...</Text>
                ) : null}

                {scenario.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionBubble,
                      selectedOption === option && styles.selectedOptionBubble,
                    ]}
                    onPress={() => {
                      if (isCurrentScenario && !feedbackVisible) {
                        handleSelectOption(option);
                      }
                    }}
                  >
                    <Text style={styles.messageText}>{option}</Text>
                  </TouchableOpacity>
                ))}

                {feedbackVisible ? (
                  <View
                    style={[
                      styles.impiBubble,
                      selectedOption === scenario.correct
                        ? styles.correctBubble
                        : styles.wrongBubble,
                    ]}
                  >
                    <Text style={styles.messageLabel}>IMPI FEEDBACK</Text>
                    <Text style={styles.messageText}>
                      {selectedOption === scenario.correct
                        ? scenario.feedback
                        : `Not the safest response. Recommended action: ${scenario.correct}.`}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {selectedOptions[currentScenario] ? (
        <TouchableOpacity style={styles.inputBar} onPress={handleNextScenario}>
          <Text style={styles.inputText}>
            {currentScenario < scenarios.length - 1 ? 'NEXT SCENARIO' : 'COMPLETE TRAINING'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191818',
    paddingHorizontal: 20,
    paddingTop: 70,
  },

  dust: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: undefined,
    height: undefined,
  },

  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    left: 0,
    top: -15,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backArrow: {
    color: '#CFC4B2',
    fontSize: 34,
    fontFamily: 'Aldrich',
  },

  title: {
    color: '#CFC4B2',
    fontSize: 18,
    fontFamily: 'Aldrich',
    letterSpacing: 2,
  },

  rangerCard: {
    height: 60,
    borderRadius: 18,
    backgroundColor: '#67612737',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 24,
    width: '95%',
    alignSelf: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  logo: {
    width: 50,
    height: 50,
    marginRight: 16,
  },

  rangerText: {
    color: '#CFC4B2',
    fontSize: 10,
    fontFamily: 'Aldrich',
    lineHeight: 15,
  },

  chatArea: {
    flex: 1,
    borderRadius: 22,
    width: '95%',
    alignSelf: 'center',
    marginBottom: 20,
  },

  chatContent: {
    paddingBottom: 20,
  },

  scenarioPrompt: {
    alignSelf: 'flex-start',
    color: '#CFC4B2',
    fontSize: 11,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
    opacity: 0.8,
  },

  impiBubble: {
    maxWidth: '88%',
    alignSelf: 'flex-start',
    backgroundColor: '#191818',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  scenarioTitle: {
    color: '#8C7B52',
    fontSize: 11,
    fontFamily: 'Aldrich',
    marginBottom: 8,
    marginTop: 2,
    letterSpacing: 1,
  },

  responsePrompt: {
    alignSelf: 'flex-end',
    color: '#CFC4B2',
    fontSize: 11,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 4,
    opacity: 0.8,
  },

  optionBubble: {
    maxWidth: '88%',
    alignSelf: 'flex-end',
    backgroundColor: '#44282786',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderTopRightRadius: 4,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  selectedOptionBubble: {
    backgroundColor: '#8033077c',
  },

  correctBubble: {
    backgroundColor: '#676127a3',
  },

  wrongBubble: {
    backgroundColor: '#8033077c',
  },

  messageLabel: {
    color: '#CFC4B2',
    fontSize: 11,
    fontFamily: 'Aldrich',
    marginBottom: 8,
  },

  messageText: {
    color: '#CFC4B2',
    fontSize: 15,
    fontFamily: 'Aldrich',
    lineHeight: 24,
  },

  inputBar: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#676127a3',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '95%',
    alignSelf: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  inputText: {
    color: '#CFC4B2',
    fontFamily: 'Aldrich',
    fontSize: 13,
    letterSpacing: 1,
  },

  scenarioBlock: {
    marginTop: 30,
  },  
});