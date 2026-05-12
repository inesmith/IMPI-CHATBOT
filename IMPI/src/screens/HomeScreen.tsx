import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFonts } from 'expo-font';

import TrackIcon from '../../assets/images/trackIcon.svg';
import FieldGuideIcon from '../../assets/images/fieldguideIcon.svg';
import ScannerIcon from '../../assets/images/scannerIcon.svg';
import TrainingIcon from '../../assets/images/trainingIcon.svg';
import TalkIcon from '../../assets/images/talkIcon.svg';
import Arrow from '../../assets/images/arrow.svg';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>

        <Image
            source={require('../../assets/images/dust.png')}
            style={styles.dust}
            resizeMode="cover"
        />

      <View style={styles.scrollContent}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuText}>☰</Text>
          </TouchableOpacity>

          <View style={styles.greetingContainer}>
            <View style={styles.greetingContent}>
            <Image
                source={require('../../assets/images/logo.png')}
                style={styles.greetingLogo}
                resizeMode="contain"
            />

            <Text style={styles.greeting}>
                Good Morning, Ranger
            </Text>

            </View>
          </View>
        </View>

        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            WEATHER CONDITIONS: 28° | DRY | MODERATE WIND
          </Text>
        </View>

        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            PATROL ZONE: LIMPOPO EAST
          </Text>
        </View>

        <View style={styles.cardSection}>

          <TouchableOpacity style={styles.mainCard}>
            <Arrow
                width={30}
                height={30}
                style={styles.mainArrowIcon}
            />
              
            <TalkIcon
                width={30}
                height={30}
                style={styles.mainCardIcon}
            />

            <Text style={styles.mainCardText}>
              TALK{'\n'}WITH{'\n'}IMPI
            </Text>
          </TouchableOpacity>

          <View style={styles.sideCards}>
            <TouchableOpacity style={styles.smallCardOrange}>
              <Arrow
                width={18}
                height={18}
                style={styles.smallArrowIcon}
              />
              
              <TrackIcon
                width={30}
                height={30}
                style={styles.smallCardIcon}
              />

              <Text style={styles.smallCardText}>
                TRACK{'\n'}ANALYSIS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallCardGreen}>
              <Arrow
                width={18}
                height={18}
                style={styles.smallArrowIcon}
              />

              <FieldGuideIcon
                width={30}
                height={30}
                style={styles.smallCardIcon}
              />

              <Text style={styles.smallCardText}>
                SPECIES{'\n'}FIELD GUIDE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallCardRed}>
              <Arrow
                width={18}
                height={18}
                style={styles.smallArrowIcon}
              />

              <TrainingIcon
                width={30}
                height={30}
                style={styles.smallCardIcon}
              />

              <Text style={styles.smallCardText}>
                SCENARIO{'\n'}TRAINING
              </Text>
            </TouchableOpacity>
          </View>

        </View>
        

        <TouchableOpacity style={styles.scannerCard}>

          <Arrow
            width={30}
            height={30}
            style={styles.scannerArrowIcon}
          />

          <Text style={styles.scannerText}>
            FIELD SCANNER
          </Text>

          <TrainingIcon
                width={30}
                height={30}
                style={styles.scannerCardIcon}
          />

        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          RECENT ENCOUNTERS
        </Text>

        <TouchableOpacity style={styles.recentCard}>

          <Arrow
            width={30}
            height={30}
            style={styles.recentArrowIcon}
          />

          <Text style={styles.recentText}>PREVIOUS CHATS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.recentCard}>

          <Arrow
            width={30}
            height={30}
            style={styles.recentArrowIcon}
          />

          <Text style={styles.recentText}>ANALYZED PATROLS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.recentCard}>

          <Arrow
            width={30}
            height={30}
            style={styles.recentArrowIcon}
          />

          <Text style={styles.recentText}>COMPLETED SPECIES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.recentCard}>

          <Arrow
            width={30}
            height={30}
            style={styles.recentArrowIcon}
          />

          <Text style={styles.recentText}>TRAINING SESSIONS</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191818',
  },

  cardContainer: {
    overflow: 'hidden',
  },

  dust: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  scrollContent: {
    paddingTop: 70,
    paddingBottom: 40,
    paddingHorizontal: 20,
    width: '95%',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 15,
  },

  menuButton: {
    width: 58,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#67612737',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  menuText: {
    color: '#F4F1EA',
    fontSize: 28,
    fontFamily: 'Aldrich',
    marginTop: 4,
  },

  greetingContainer: {
    width: 350,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#67612737',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  greeting: {
    color: '#CFC4B2',
    fontSize: 18,
    fontFamily: 'Aldrich',
    marginTop: 4,
  },

  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  greetingLogo: {
    width: 40,
    height: 40,
    marginRight: 14,
    marginLeft: -1,
  },

  infoBar: {
    width: '100%',
    height: 30,
    borderRadius: 16,
    backgroundColor: '#676127a3',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginBottom: 2,
    marginTop: 7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 6,
  },

  infoText: {
    color: '#CFC4B2',
    fontSize: 10,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
    marginTop: 3,
  },

  cardSection: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 18,
  },

  mainCard: {
    width: '52%',
    height: 222,
    borderRadius: 22,
    backgroundColor: '#8033077c',
    justifyContent: 'flex-end',
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

  mainCardText: {
    color: '#CFC4B2',
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Aldrich',
    marginBottom: -5,
  },

  mainCardIcon: {
    marginLeft: -5,
    marginBottom: 83,
  },

  mainArrowIcon: {
    position: 'absolute',
    top: 12,
    right: 10,
    zIndex: 10,
  },

  sideCards: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },

  smallCardOrange: {
    height: 64,
    borderRadius: 20,
    backgroundColor: '#93562794',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  smallCardGreen: {
    height: 64,
    borderRadius: 20,
    backgroundColor: '#676127a3',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  smallCardRed: {
    height: 64,
    borderRadius: 20,
    backgroundColor: '#44282786',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  smallCardText: {
    color: '#CFC4B2',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Aldrich',
    marginTop: -32,
    marginLeft: 35,
  },

  smallCardContent: {
   flexDirection: 'row',
   alignItems: 'center',
  },

  smallCardIcon: {
    marginLeft: -5,
    marginTop: 5,
  },

  smallArrowIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },

  scannerCard: {
    width: '100%',
    height: 50,
    borderRadius: 18,
    backgroundColor: '#676127a3',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 42,
  },

  scannerText: {
    color: '#CFC4B2',
    fontSize: 14,
    fontFamily: 'Aldrich',
    marginTop: -20,
    marginLeft: 35,
  },

  scannerArrowIcon: {
    marginLeft: 310,
    marginTop: 0,
  },

  scannerCardIcon: {
    marginLeft: -5,
    marginTop: -24,
  },

  sectionTitle: {
    color: '#CFC4B2',
    fontSize: 18,
    fontFamily: 'Aldrich',
    marginBottom: 20,
  },

  recentCard: {
    width: '100%',
    height: 50,
    borderRadius: 18,
    backgroundColor: '#93562794',
    justifyContent: 'center',
    paddingHorizontal: 22,
    marginBottom: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 6,
  },

  recentText: {
    color: '#CFC4B2',
    fontSize: 14,
    fontFamily: 'Aldrich',
    marginTop: -20,
  },

  recentArrowIcon: {
    marginLeft: 310,
    marginTop: -5,
  },
});