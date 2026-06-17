import { Animated, Image, Modal, PanResponder, Pressable, StyleSheet, Text, TouchableOpacity, View, Alert, TextInput, Keyboard } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useFonts } from 'expo-font';
import * as Location from 'expo-location';
import { auth, db } from '../services/firebaseConfig';
import { doc, deleteDoc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider, onAuthStateChanged } from 'firebase/auth';

import TrackIcon from '../../assets/images/trackIcon.svg';
import FieldGuideIcon from '../../assets/images/fieldguideIcon.svg';
import ScannerIcon from '../../assets/images/scannerIcon.svg';
import TrainingIcon from '../../assets/images/trainingIcon.svg';
import TalkIcon from '../../assets/images/talkIcon.svg';
import Arrow from '../../assets/images/arrow.svg';
import SunnyClearIcon from '../../assets/images/sunnyClear.svg';
import SunnyCloudyIcon from '../../assets/images/sunnyCloudy.svg';
import CloudyIcon from '../../assets/images/cloudy.svg';
import RainyIcon from '../../assets/images/rainy.svg';
import SnowyIcon from '../../assets/images/snowy.svg';
import MixedWeatherIcon from '../../assets/images/mixedWeather.svg';
import ThunderstormIcon from '../../assets/images/thunderstorm.svg';
import HailIcon from '../../assets/images/hail.svg';
import NightCloudyIcon from '../../assets/images/nightCloudy.svg';
import NightClearIcon from '../../assets/images/nightClear.svg';
import LocationIcon from '../../assets/images/locationIcon.svg';
import FieldMapIcon from '../../assets/images/fieldMapIcon.svg';

const weatherIcons = {
  CLEAR: SunnyClearIcon,
  PARTLY_CLOUDY: SunnyCloudyIcon,
  CLOUDY: CloudyIcon,
  FOG: MixedWeatherIcon,
  DRIZZLE: RainyIcon,
  RAIN: RainyIcon,
  SNOW: SnowyIcon,
  RAIN_SHOWERS: RainyIcon,
  THUNDERSTORM: ThunderstormIcon,
  HAIL: HailIcon,
  UNKNOWN: MixedWeatherIcon,
  NIGHT_CLEAR: NightClearIcon,
  NIGHT_CLOUDY: NightCloudyIcon,
};

type Props = {
  setCurrentScreen: (screen: string) => void;
};

const getWeatherCondition = (code: number, isNight: boolean) => {
  if (code === 0) return isNight ? 'NIGHT_CLEAR' : 'CLEAR';

  if ([1, 2].includes(code)) {
    return isNight ? 'NIGHT_CLOUDY' : 'PARTLY_CLOUDY';
  }

  if (code === 3) {
    return isNight ? 'NIGHT_CLOUDY' : 'CLOUDY';
  }

  if ([45, 48].includes(code)) return 'FOG';
  if ([51, 53, 55, 56, 57].includes(code)) return 'DRIZZLE';
  if ([61, 63, 65, 66, 67].includes(code)) return 'RAIN';
  if ([71, 73, 75, 77].includes(code)) return 'SNOW';
  if ([80, 81, 82].includes(code)) return 'RAIN_SHOWERS';
  if ([95, 96, 99].includes(code)) return 'THUNDERSTORM';

  return 'UNKNOWN';
};

export default function HomeScreen({ setCurrentScreen }: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [weatherTemp, setWeatherTemp] = useState('LOADING...');
  const [weatherWind, setWeatherWind] = useState('');
  const [weatherIcon, setWeatherIcon] = useState(() => weatherIcons.UNKNOWN);
  const [patrolZone, setPatrolZone] = useState('PATROL ZONE: LOADING...');

  const [menuVisible, setMenuVisible] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  const [profileImage, setProfileImage] = useState('');
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [cardFlipped, setCardFlipped] = useState(false);

  useEffect(() => {
  async function loadLocationAndWeather() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setWeatherIcon(() => weatherIcons.UNKNOWN);
        setWeatherTemp('LOCATION DISABLED');
        setWeatherWind('');
        setPatrolZone('PATROL ZONE: LOCATION DISABLED');
        return;
      }

      const location = await Location.getLastKnownPositionAsync({});

      if (!location) {
        setWeatherIcon(() => weatherIcons.UNKNOWN);
        setWeatherTemp('LOCATION UNAVAILABLE');
        setWeatherWind('');
        setPatrolZone('PATROL ZONE: LOCATION UNAVAILABLE');
        return;
      }
      
      const { latitude, longitude } = location.coords;

      const places = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const place = places[0];

      const area =
        place?.city ||
        place?.district ||
        place?.subregion ||
        place?.region ||
        'CURRENT LOCATION';

      const region = place?.region || '';

      let provinceCode = '';

      if (region.includes('Gauteng')) provinceCode = 'GP';
      else if (region.includes('Western Cape')) provinceCode = 'WC';
      else if (region.includes('KwaZulu-Natal')) provinceCode = 'KZN';
      else if (region.includes('Eastern Cape')) provinceCode = 'EC';
      else if (region.includes('Free State')) provinceCode = 'FS';
      else if (region.includes('Limpopo')) provinceCode = 'LP';
      else if (region.includes('Mpumalanga')) provinceCode = 'MP';
      else if (region.includes('North West')) provinceCode = 'NW';
      else if (region.includes('Northern Cape')) provinceCode = 'NC';

      setPatrolZone(
        `PATROL ZONE: ${area.toUpperCase()}, ${provinceCode}`
      );

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`
      );

      const data = await response.json();

      const temperature = Math.round(data.current.temperature_2m);
      const windSpeed = Math.round(data.current.wind_speed_10m);
      const currentHour = new Date().getHours();
      const isNight = currentHour < 6 || currentHour >= 18;
      const condition = getWeatherCondition(data.current.weather_code, isNight);  

      setWeatherIcon(() => weatherIcons[condition as keyof typeof weatherIcons]);

      setWeatherTemp(`${temperature}°C`);
      setWeatherWind(`WIND ${windSpeed} KM/H`);
    } catch (error) {
        setWeatherIcon(() => weatherIcons.UNKNOWN);
        setWeatherTemp('UNAVAILABLE');
        setWeatherWind('');
        setPatrolZone('PATROL ZONE: UNAVAILABLE');
    }
  }

  loadLocationAndWeather();
}, []);

  useEffect(() => {
  async function loadUserData() {
    if (!auth.currentUser) {
      return;
    }

    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));

    if (userDoc.exists()) {
      const data = userDoc.data();

      setUsername(data.username || '');
      setEmail(data.email || auth.currentUser.email || '');
      setPhoneNumber(data.phoneNumber || '');
      setProfileImage(data.profileImage || '');
    } else {
      setEmail(auth.currentUser.email || '');
    }
  }

  loadUserData();
}, []);
  
const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: cardFlipped ? 0 : 1,
      duration: 450,
      useNativeDriver: true,
    }).start();

    setCardFlipped(!cardFlipped);
  };

  const resetCardToFront = () => {
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();

    setCardFlipped(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 25,

      onPanResponderRelease: () => {
        flipCard();
      },
    })
  ).current;

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setProfileMessage('IMAGE PERMISSION DENIED.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64 && auth.currentUser) {
      const imageData = `data:image/jpeg;base64,${result.assets[0].base64}`;

      setProfileImage(imageData);

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        profileImage: imageData,
      });

      setProfileMessage('IMAGE UPDATED.');
    }
  };

  const handleLogout = async () => {
  await signOut(auth);
  setMenuVisible(false);
  setCurrentScreen('login');
};

const handleDeleteAccount = () => {
  setDeleteMessage('');

  Alert.prompt(
    'Confirm Password',
    'Enter your password to permanently delete your IMPI account.',
    async (password) => {
      const user = auth.currentUser;

      if (!user || !user.email || !password) {
        setDeleteMessage('DELETE FAILED. PASSWORD REQUIRED.');
        return;
      }

      try {
        const credential = EmailAuthProvider.credential(user.email, password);

        await reauthenticateWithCredential(user, credential);
        await deleteDoc(doc(db, 'users', user.uid));
        await deleteUser(user);

        setMenuVisible(false);
        setCurrentScreen('landing');
      } catch (error: any) {
        setDeleteMessage('PASSWORD INCORRECT. ACCOUNT NOT DELETED.');
      }
    },
    'secure-text'
  );
};

  const handleSaveProfile = async () => {
  if (!auth.currentUser) {
    return;
  }

  await updateDoc(doc(db, 'users', auth.currentUser.uid), {
    username: username.trim(),
    email: email.trim(),
    phoneNumber: phoneNumber.trim(),
  });

  Keyboard.dismiss();

  Animated.timing(flipAnim, {
    toValue: 0,
    duration: 450,
    useNativeDriver: true,
  }).start();

  setCardFlipped(false);
};

  if (!fontsLoaded) {
    return null;
  }

  const greetingText = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
        return 'Good Morning, Ranger';
    }

    if (hour < 18) {
        return 'Good Afternoon, Ranger';
    }

    return 'Good Evening, Ranger';
  }, []);

  const WeatherIconComponent = weatherIcon;


  return (
    <View style={styles.container}>

        <Image
            source={require('../../assets/images/dust.png')}
            style={styles.dust}
            resizeMode="cover"
        />

      <View style={styles.scrollContent}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
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
                {greetingText}
            </Text>

            </View>
          </View>
        </View>

        <View style={styles.infoBar}>
            <View style={styles.weatherContent}>
                <Text style={styles.infoText}>
                WEATHER CONDITIONS: {weatherTemp}
                </Text>

                {weatherWind ? (
                  <>
                    <Text style={styles.infoText}>|</Text>

                    <WeatherIconComponent
                        width={15}
                        height={15}
                        style={styles.weatherIcon}
                    />

                    <Text style={styles.infoText}>|  {weatherWind}</Text>
                  </>
                ) : null}
            </View>
        </View>

        <View style={styles.infoBar}>
        <View style={styles.locationContent}>
          <Text style={styles.infoText}>
            PATROL ZONE:
          </Text>

          <LocationIcon
            width={14}
            height={14}
            style={styles.locationIcon}
          />

          <Text style={styles.infoText}>
            {patrolZone.replace('PATROL ZONE: ', '')}
          </Text>
        </View>
      </View>

        <View style={styles.cardSection}>

          <TouchableOpacity
            style={styles.mainCard}
            onPress={() => setCurrentScreen('impiChatMenu')}
          >
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
            <TouchableOpacity
                style={styles.smallCardOrange}
                onPress={() => setCurrentScreen('trackAnalysis')}
            >
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

            <TouchableOpacity
              style={styles.smallCardGreen}
              onPress={() => setCurrentScreen('speciesFieldGuide')}
            >
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

            <TouchableOpacity
              style={styles.smallCardRed}
              onPress={() => setCurrentScreen('scenarioTraining')}
            >
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
        

        <TouchableOpacity style={styles.fieldMapCard}
          onPress={() => setCurrentScreen('fieldMap')}
        >

          <Arrow
            width={30}
            height={30}
            style={styles.fieldMapArrowIcon}
          />

          <Text style={styles.fieldMapText}>
            FIELD MAP
          </Text>

          <FieldMapIcon
                width={30}
                height={30}
                style={styles.fieldMapIcon}
          />

        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          RECENT ENCOUNTERS
        </Text>

        <TouchableOpacity style={styles.recentCard}>
          <Text style={styles.recentText}>PREVIOUS CHATS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.recentCard}>
          <Text style={styles.recentText}>ANALYZED PATROLS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.recentCard}>
          <Text style={styles.recentText}>COMPLETED SPECIES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.recentCard}>
          <Text style={styles.recentText}>TRAINING SESSIONS</Text>
        </TouchableOpacity>
      </View>

        

      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setMenuVisible(false);
            resetCardToFront();
          }}
        >
          <Image
            source={require('../../assets/images/dust.png')}
            style={styles.dust}
            resizeMode="cover"
          />

          <Pressable onPress={(event) => event.stopPropagation()}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.rangerCard,
                {
                  transform: [
                    { perspective: 1000 },
                    {
                      rotateY: flipAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              {!cardFlipped ? (
                <View>
                  <Text style={styles.cardTitle}>WILDLIFE RANGER</Text>

                  {profileImage ? (
                    <View style={styles.profileImageBox}>
                      <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.profileImageBox} onPress={pickProfileImage}>
                      <Text style={styles.uploadText}>UPLOAD IMAGE</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.profileRow}>
                    <Text style={styles.profileLabel}>USERNAME</Text>
                    <Text style={styles.profileValue}>{username || 'Not available'}</Text>
                  </View>

                  <View style={styles.profileRow}>
                    <Text style={styles.profileLabel}>EMAIL</Text>
                    <Text style={styles.profileValue}>{email || 'Not available'}</Text>
                  </View>

                  <View style={styles.profileRow}>
                    <Text style={styles.profileLabel}>PHONE</Text>
                    <Text style={styles.profileValue}>{phoneNumber || 'Not available'}</Text>
                  </View>

                  <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
                    <Text style={styles.flipButtonText}>EDIT CARD</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cardBack}>
                  <Text style={styles.cardTitle}>RANGER SETTINGS</Text>

                  <TouchableOpacity style={styles.editImageButton} onPress={pickProfileImage}>
                    <Text style={styles.modalButtonText}>EDIT IMAGE</Text>
                  </TouchableOpacity>

                  <Text style={styles.modalLabel}>USERNAME</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="USERNAME"
                    placeholderTextColor="#CFC4B2"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />

                  <Text style={styles.modalLabel}>EMAIL</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="EMAIL"
                    placeholderTextColor="#CFC4B2"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />

                  <Text style={styles.modalLabel}>PHONE</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="PHONE"
                    placeholderTextColor="#CFC4B2"
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />

                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                    <Text style={styles.modalButtonText}>SAVE DETAILS</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                    <Text style={styles.modalButtonText}>LOG OUT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                    <Text style={styles.deleteButtonText}>DELETE ACCOUNT</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
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
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 4,
    },
    shadowOpacity: 0.40,
    shadowRadius: 8,

    elevation: 6,
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
    backgroundColor: '#191818',
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

  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
},

  weatherIcon: {
    width: 10,
    height: 10,
    marginTop: 1,
  },

  locationContent: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},

locationIcon: {
  width: 14,
  height: 14,
  marginTop: 1,
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

  fieldMapCard: {
    width: '100%',
    height: 50,
    borderRadius: 18,
    backgroundColor: '#846b1895',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 42,
  },

  fieldMapText: {
    color: '#CFC4B2',
    fontSize: 14,
    fontFamily: 'Aldrich',
    marginTop: -20,
    marginLeft: 35,
  },

  fieldMapArrowIcon: {
    marginLeft: 310,
    marginTop: 0,
  },

  fieldMapIcon: {
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
    backgroundColor: '#191818',
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
    marginTop: 5,
  },

  recentArrowIcon: {
    marginLeft: 310,
    marginTop: -5,
  },

  ///modal styles

  modalOverlay: {
  flex: 1,
  backgroundColor: '#191818',
  justifyContent: 'center',
  alignItems: 'center',
},

modalCard: {
  width: '85%',
  borderRadius: 22,
  overflow: 'hidden',
  padding: 28,
},

modalBackground: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: '#676127',
  opacity: 0.32,
},

modalTitle: {
  color: '#CFC4B2',
  fontSize: 22,
  lineHeight: 28,
  fontFamily: 'Aldrich',
  letterSpacing: 2,
  marginBottom: 28,
  textAlign: 'center',
},

modalLabel: {
  color: '#CFC4B2',
  fontSize: 9,
  fontFamily: 'Aldrich',
  letterSpacing: 1,
  marginBottom: 6,
},

modalValue: {
  color: '#F4F1EA',
  fontSize: 13,
  fontFamily: 'Aldrich',
  marginBottom: 18,
},

modalStatus: {
  color: '#CFC4B2',
  fontSize: 10,
  fontFamily: 'Aldrich',
  textAlign: 'center',
  marginTop: 10,
  marginBottom: 24,
},

modalButton: {
  height: 44,
  borderRadius: 14,
  backgroundColor: 'rgba(103, 97, 39, 0.38)',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 14,
  shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 4,
    },
    shadowOpacity: 0.40,
    shadowRadius: 8,

    elevation: 6,
},

modalButtonText: {
  color: '#CFC4B2',
  fontSize: 12,
  fontFamily: 'Aldrich',
  letterSpacing: 1,
},

deleteButton: {
  height: 44,
  borderRadius: 14,
  backgroundColor: 'rgba(103, 97, 39, 0.38)',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 22,
  shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 4,
    },
    shadowOpacity: 0.40,
    shadowRadius: 8,

    elevation: 6,
},

deleteButtonText: {
  color: '#CFC4B2',
  fontSize: 12,
  fontFamily: 'Aldrich',
  letterSpacing: 1,
},

modalInput: {
  width: '100%',
  height: 42,
  borderRadius: 14,
  backgroundColor: 'rgba(25, 24, 24, 0.45)',
  color: '#CFC4B2',
  fontFamily: 'Aldrich',
  fontSize: 11,
  paddingHorizontal: 14,
  marginBottom: 16,
},

profileMessage: {
  color: '#CFC4B2',
  fontSize: 9,
  fontFamily: 'Aldrich',
  textAlign: 'center',
  marginBottom: 14,
},

rangerCard: {
  width: 330,
  minHeight: 520,
  borderRadius: 24,
  backgroundColor: 'rgba(103, 97, 39, 0.38)',
  borderWidth: 2,
  borderColor: 'rgba(207, 196, 178, 0.25)',
  padding: 22,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.45,
  shadowRadius: 12,
  elevation: 8,
  backfaceVisibility: 'visible',
},

cardBack: {
  transform: [{ rotateY: '180deg' }],
},

cardTitle: {
  color: '#F4F1EA',
  fontSize: 24,
  fontFamily: 'Aldrich',
  letterSpacing: 1.5,
  marginBottom: 18,
  textAlign: 'center',
},

profileImageBox: {
  width: '100%',
  height: 230,
  borderRadius: 18,
  borderWidth: 2,
  borderColor: 'rgba(207, 196, 178, 0.3)',
  backgroundColor: 'rgba(25, 24, 24, 0.55)',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 18,
  overflow: 'hidden',
},

profileImage: {
  width: '100%',
  height: '100%',
  borderRadius: 16,
},

uploadText: {
  color: '#CFC4B2',
  fontSize: 12,
  fontFamily: 'Aldrich',
  letterSpacing: 1,
},

profileRow: {
  backgroundColor: 'rgba(25, 24, 24, 0.45)',
  borderRadius: 12,
  padding: 10,
  marginBottom: 8,
},

profileLabel: {
  color: '#CFC4B2',
  fontSize: 8,
  fontFamily: 'Aldrich',
  letterSpacing: 1,
  marginBottom: 4,
},

profileValue: {
  color: '#F4F1EA',
  fontSize: 11,
  fontFamily: 'Aldrich',
},

flipHint: {
  color: '#CFC4B2',
  fontSize: 9,
  fontFamily: 'Aldrich',
  textAlign: 'center',
  marginTop: 16,
  marginBottom: 10,
},

flipButton: {
  height: 40,
  borderRadius: 14,
  backgroundColor: 'rgba(128, 51, 7, 0.55)',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 10,
},

flipButtonText: {
  color: '#CFC4B2',
  fontSize: 11,
  fontFamily: 'Aldrich',
  letterSpacing: 1,
  marginTop: 2,
},

editImageButton: {
  height: 42,
  borderRadius: 14,
  backgroundColor: 'rgba(25, 24, 24, 0.45)',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 18,
},

saveButton: {
  height: 44,
  borderRadius: 14,
  backgroundColor: '#8033077c',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 14,

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.40,
  shadowRadius: 8,

  elevation: 6,
},

});