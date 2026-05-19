import { Image, StyleSheet, Text, TouchableOpacity, View, PanResponder, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import Arrow from '../../assets/images/arrow.svg';

type Props = {
  setCurrentScreen: (screen: string) => void;
};

const species = ['LION', 'ELEPHANT', 'RHINO', 'LEOPARD', 'BUFFALO'];

const ages = [
  'APPROX. 30 MINUTES',
  'APPROX. 2 HOURS',
  'APPROX. 5 HOURS',
  'LESS THAN 1 DAY',
];

const directions = ['NORTH', 'SOUTH EAST', 'WEST', 'NORTH EAST'];

const dangerLevels = ['LOW', 'MEDIUM', 'HIGH'];

export default function TrackAnalysisScreen({ setCurrentScreen }: Props) {
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

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [scanStage, setScanStage] = useState('');

  const [analysisResult, setAnalysisResult] = useState({
    species: '',
    age: '',
    direction: '',
    danger: '',
  });

  const handleUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisDone(false);
    }
  };

  const handleTakePhoto = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
        return;
    }

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
    });

    if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setAnalysisDone(false);
    }
  };

  const handleAnalyzeTrack = () => {
    setIsAnalyzing(true);
    setAnalysisDone(false);
    setScanStage('SCANNING TRACK DEPTH...');

    setTimeout(() => {
        setScanStage('MATCHING SPECIES...');
    }, 700);

    setTimeout(() => {
        setScanStage('ANALYZING MOVEMENT...');
    }, 1400);

    setTimeout(() => {
        setScanStage('CALCULATING RISK...');
    }, 2100);

    setTimeout(() => {
        setAnalysisResult({
        species: species[Math.floor(Math.random() * species.length)],
        age: ages[Math.floor(Math.random() * ages.length)],
        direction: directions[Math.floor(Math.random() * directions.length)],
        danger: dangerLevels[Math.floor(Math.random() * dangerLevels.length)],
        });

        setIsAnalyzing(false);
        setAnalysisDone(true);
        setScanStage('');
    }, 2800);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.outerContainer}>
      <Image
        source={require('../../assets/images/dust.png')}
        style={styles.dust}
        resizeMode="stretch"
      />

      <View style={styles.container} {...panResponder.panHandlers}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>TRACK ANALYSIS</Text>

        <View style={styles.statusCard}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.statusText}>
            TRACK SYSTEM ONLINE{'\n'}
            FIELD ANALYSIS READY
          </Text>
        </View>

        <View style={styles.scanArea}>
          {selectedImage ? (
            <>
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
                resizeMode="cover"
              />

              {isAnalyzing ? (
                <View style={styles.scanOverlay}>
                  <ActivityIndicator size="large" color="#CFC4B2" />
                  <Text style={styles.scanOverlayText}>{scanStage}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.scanTitle}>
                DROP TRACK IMAGE{'\n'}
                FOR ANALYSIS
              </Text>

              <Text style={styles.scanSubtext}>
                Analyze spoor, footprints, scat,{'\n'}
                movement patterns, and terrain signs.
              </Text>
            </>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.orangeButton} onPress={handleTakePhoto}>
            <Text style={styles.buttonText}>TAKE PHOTO</Text>
            <Arrow width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.greenButton} onPress={handleUploadImage}>
            <Text style={styles.buttonText}>UPLOAD IMAGE</Text>
            <Arrow width={24} height={24} />
          </TouchableOpacity>

          {selectedImage ? (
        <TouchableOpacity
            style={styles.orangeButton}
            onPress={handleUploadImage}
        >
            <Text style={styles.buttonText}>CHANGE IMAGE</Text>
            <Arrow width={24} height={24} />
        </TouchableOpacity>
        ) : null}

          {selectedImage ? (
            <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyzeTrack}>
              <Text style={styles.buttonText}>
                {isAnalyzing ? 'ANALYZING TRACK...' : 'ANALYZE TRACK'}
              </Text>
              <Arrow width={24} height={24} />
            </TouchableOpacity>
          ) : null}
        </View>

        {analysisDone ? (
          <View
            style={[
                styles.resultCard,
                analysisResult.danger === 'HIGH' && styles.highThreatCard,
                analysisResult.danger === 'MEDIUM' && styles.mediumThreatCard,
                analysisResult.danger === 'LOW' && styles.lowThreatCard,
            ]}
            >
            <Text style={styles.resultTitle}>FIELD ANALYSIS RESULT</Text>
            <Text style={styles.resultText}>
              SPECIES: {analysisResult.species}{'\n'}
              TRACK AGE: {analysisResult.age}{'\n'}
              DIRECTION: {analysisResult.direction}{'\n'}
              THREAT LEVEL: {analysisResult.danger}
            </Text>
          </View>
        ) : null}

        <View style={styles.footerCard}>
          <Text style={styles.footerText}>
            IMPI CAN IDENTIFY:{'\n'}
            • SPECIES{'\n'}
            • TRACK AGE{'\n'}
            • DIRECTION OF MOVEMENT{'\n'}
            • POTENTIAL DANGER LEVEL
          </Text>
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
    paddingTop: 75,
    paddingHorizontal: 24,
    alignItems: 'center',
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
    marginTop: -15,
  },

  title: {
    color: '#CFC4B2',
    fontSize: 18,
    fontFamily: 'Aldrich',
    letterSpacing: 2,
    marginTop: 2,
    marginBottom: 28,
  },

  statusCard: {
    width: '95%',
    height: 70,
    borderRadius: 18,
    backgroundColor: '#67612737',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 28,

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
    marginTop: -4,
  },

  statusText: {
    color: '#CFC4B2',
    fontSize: 10,
    fontFamily: 'Aldrich',
    lineHeight: 15,
  },

  scanArea: {
    width: '95%',
    height: 320,
    borderRadius: 24,
    backgroundColor: '#8033077c',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  scanTitle: {
    color: '#CFC4B2',
    fontSize: 24,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 2,
    marginBottom: 22,
  },

  scanSubtext: {
    color: '#CFC4B2',
    fontSize: 11,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },

  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },

  analyzeButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#44282786',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 18,
  },

  resultCard: {
    width: '95%',
    borderRadius: 18,
    backgroundColor: '#676127a3',
    padding: 18,
    marginBottom: 18,
  },

  resultTitle: {
    color: '#CFC4B2',
    fontSize: 12,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
    marginBottom: 12,
  },

  resultText: {
    color: '#CFC4B2',
    fontSize: 10,
    fontFamily: 'Aldrich',
    lineHeight: 18,
    letterSpacing: 1,
  },

  highThreatCard: {
    backgroundColor: '#442827cc',
  },

  mediumThreatCard: {
    backgroundColor: '#935627cc',
  },

  lowThreatCard: {
    backgroundColor: '#676127cc',
  },

  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(25,24,24,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },

  scanOverlayText: {
    color: '#CFC4B2',
    fontSize: 12,
    fontFamily: 'Aldrich',
    marginTop: 18,
    letterSpacing: 1,
  },

  buttonGroup: {
    width: '95%',
    marginBottom: 26,
  },

  orangeButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#93562794',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 18,

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
    borderRadius: 18,
    backgroundColor: '#676127a3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,

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
    marginTop: 4,
  },

  footerCard: {
    width: '95%',
    borderRadius: 18,
    backgroundColor: '#44282786',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  footerText: {
    color: '#CFC4B2',
    fontSize: 10,
    fontFamily: 'Aldrich',
    lineHeight: 18,
    letterSpacing: 1,
  },
});