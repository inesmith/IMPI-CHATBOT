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
import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useFonts } from 'expo-font';
import { BlurView } from 'expo-blur';
import { doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

import { auth, db } from '../services/firebaseConfig';

import ImpiLogo from '../../assets/images/ImpiLogo.svg';
import TalkIcon from '../../assets/images/voice_selection.svg';
import LeafIcon from '../../assets/images/nest_eco_leaf.svg';
import MythIcon from '../../assets/images/bug_report.svg';
import BookIcon from '../../assets/images/import_contacts.svg';

type Props = {
  setCurrentScreen: (screen: string) => void;
  setInitialChatMessage: (message: string) => void;
  setSelectedChatId: (chatId: string | null) => void;
  setChatMode: (mode: 'general' | 'stories' | 'scenarios') => void;
};

export default function HomeScreen({
  setCurrentScreen,
  setInitialChatMessage,
  setSelectedChatId,
  setChatMode,
}: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const [accountMode, setAccountMode] = useState<'view' | 'edit'>('view');
  const [message, setMessage] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  const flipAnim = useRef(new Animated.Value(0)).current;
  const [cardFlipped, setCardFlipped] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      if (!auth.currentUser) return;

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
  }, [menuVisible]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
    Alert.prompt(
      'Confirm Password',
      'Enter your password to permanently delete your IMPI account.',
      async (password) => {
        const user = auth.currentUser;

        if (!user || !user.email || !password) return;

        try {
          const credential = EmailAuthProvider.credential(user.email, password);

          await reauthenticateWithCredential(user, credential);
          await deleteDoc(doc(db, 'users', user.uid));
          await deleteUser(user);

          setMenuVisible(false);
          setCurrentScreen('welcome');
        } catch (error: any) {
          console.log(error.code);
          setProfileMessage('ACCOUNT NOT DELETED. PLEASE LOG OUT AND LOG IN AGAIN FIRST.');
        }
      },
      'secure-text'
    );
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;

    const updatedUsername = username.trim();
    const updatedEmail = email.trim();
    const updatedPhoneNumber = phoneNumber.trim();

    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      username: updatedUsername,
      email: updatedEmail,
      phoneNumber: updatedPhoneNumber,
    });

    setUsername(updatedUsername);
    setEmail(updatedEmail);
    setPhoneNumber(updatedPhoneNumber);

    Keyboard.dismiss();
    setAccountMode('view');
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setInitialChatMessage(message.trim());
      setMessage('');
      Keyboard.dismiss();
      setCurrentScreen('talkWithImpi');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Image
            source={require('../../assets/images/wallpaper.png')}
            style={styles.wallpaper}
            resizeMode="cover"
          />

          <View style={styles.homeContent}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <Text style={styles.menuText}>☰</Text>
            </TouchableOpacity>

            <BlurView intensity={30} tint="light" style={styles.logoGlass}>
              <ImpiLogo width={58} height={58} />
            </BlurView>

            <Text style={styles.homeTitle}>Hello!</Text>

            <Text style={styles.homeSubtitle}>
              What would you like to discover{'\n'}today?
            </Text>

            <View style={styles.cardGrid}>
              <TouchableOpacity
                style={styles.homeCard}
                onPress={() => setCurrentScreen('impiChatMenu')}
              >
                <BlurView intensity={25} tint="light" style={styles.homeCardGlass}>
                  <BlurView intensity={25} tint="light" style={styles.cardIconCircle}>
                    <TalkIcon width={20} height={20} />
                  </BlurView>
                  <Text style={styles.homeCardTitle}>Talk{'\n'}With Impi</Text>
                  <Text style={styles.homeCardText}>Conversations about conservation.</Text>
                  <Text style={styles.homeCardArrow}>↗</Text>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.homeCard}
                onPress={() => setCurrentScreen('rangerStories')}
              >
                <BlurView intensity={25} tint="light" style={styles.homeCardGlass}>
                  <BlurView intensity={25} tint="light" style={styles.cardIconCircle}>
                    <BookIcon width={20} height={20} />
                  </BlurView>
                  <Text style={styles.homeCardTitle}>Ranger{'\n'}Stories</Text>
                  <Text style={styles.homeCardText}>Hear experiences from the field.</Text>
                  <Text style={styles.homeCardArrow}>↗</Text>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.homeCard}
                onPress={() => {
                  setSelectedChatId(null);
                  setChatMode('scenarios');
                  setInitialChatMessage(
                    'Give me a conservation scenario. Let me choose an answer, then tell me if I was correct or incorrect and explain why.'
                  );
                  setCurrentScreen('talkWithImpi');
                }}
              >
                <BlurView intensity={25} tint="light" style={styles.homeCardGlass}>
                  <BlurView intensity={25} tint="light" style={styles.cardIconCircle}>
                    <LeafIcon width={20} height={20} />
                  </BlurView>
                  <Text style={styles.homeCardTitle}>Conservation{'\n'}Scenarios</Text>
                  <Text style={styles.homeCardText}>Make difficult conser-vation decisions.</Text>
                  <Text style={styles.homeCardArrow}>↗</Text>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity style={styles.homeCard}
                onPress={() => setCurrentScreen('conservationMyths')}
              >
                <BlurView intensity={25} tint="light" style={styles.homeCardGlass}>
                  <BlurView intensity={25} tint="light" style={styles.cardIconCircle}>
                    <MythIcon width={20} height={20} />
                  </BlurView>
                  <Text style={styles.homeCardTitle}>Conservation{'\n'}Myths</Text>
                  <Text style={styles.homeCardText}>Challenge common misconceptions.</Text>
                  <Text style={styles.homeCardArrow}>↗</Text>
                </BlurView>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.askBar}
              activeOpacity={0.85}
              onPress={() => {
                setSelectedChatId(null);
                setChatMode('general');
                setInitialChatMessage('');
                setCurrentScreen('impiChatMenu');
              }}
            >
              <Text style={styles.askPlaceholder}>Ask me anything...</Text>

              <BlurView intensity={25} tint="light" style={styles.askIconCircle}>
                <MaterialIcons name="arrow-upward" size={25} color="#F5F5F5" />
              </BlurView>
            </TouchableOpacity>
          </View>

          <Modal visible={menuVisible} animationType="fade">
            <View style={styles.accountScreen}>
              <Image
                source={require('../../assets/images/fieldwallpaper3.png')}
                style={styles.wallpaper}
                resizeMode="cover"
              />

              <TouchableOpacity
                style={styles.accountBackButton}
                onPress={() => setMenuVisible(false)}
              >
                <MaterialIcons name="arrow-back" size={28} color="#F5F5F5" />
              </TouchableOpacity>

              <View style={styles.accountContent}>
                <Text style={styles.accountTitle}>Account Settings</Text>
                <Text style={styles.accountSubtitle}>View or edit your account settings here</Text>

                <View style={styles.accountSwitch}>
                  <TouchableOpacity
                    style={[
                      styles.accountInactiveTab,
                      accountMode === 'view' && styles.accountActiveTab,
                    ]}
                    onPress={() => setAccountMode('view')}
                  >
                    <Text style={styles.accountTabText}>View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.accountInactiveTab,
                      accountMode === 'edit' && styles.accountActiveTab,
                    ]}
                    onPress={() => setAccountMode('edit')}
                  >
                    <Text style={styles.accountTabText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.accountInput}>
                  <BlurView intensity={24} tint="light" style={styles.inputIconCircle}>
                    <MaterialIcons name="person-outline" size={25} color="#F5F5F5" />
                  </BlurView>

                  {accountMode === 'edit' ? (
                    <TextInput
                      style={styles.accountTextInput}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Username"
                      placeholderTextColor="#F5F5F5"
                    />
                  ) : (
                    <Text style={styles.accountInputText}>{username || 'Not available'}</Text>
                  )}
                </View>

                <View style={styles.accountInput}>
                  <BlurView intensity={24} tint="light" style={styles.inputIconCircle}>
                    <MaterialIcons name="mail-outline" size={25} color="#F5F5F5" />
                  </BlurView>

                  {accountMode === 'edit' ? (
                    <TextInput
                      style={styles.accountTextInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email"
                      placeholderTextColor="#F5F5F5"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  ) : (
                    <Text style={styles.accountInputText}>{email || 'Not available'}</Text>
                  )}
                </View>

                <View style={styles.accountInput}>
                  <BlurView intensity={24} tint="light" style={styles.inputIconCircle}>
                    <MaterialIcons name="phone" size={25} color="#F5F5F5" />
                  </BlurView>

                  {accountMode === 'edit' ? (
                    <TextInput
                      style={styles.accountTextInput}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="Phone"
                      placeholderTextColor="#F5F5F5"
                      keyboardType="phone-pad"
                    />
                  ) : (
                    <Text style={styles.accountInputText}>{phoneNumber || 'Not available'}</Text>
                  )}
                </View>

                {profileMessage ? (
                  <Text style={styles.profileMessage}>{profileMessage}</Text>
                ) : null}

                {accountMode === 'edit' ? (
                  <>
                    <TouchableOpacity style={styles.saveButtonAccount} onPress={handleSaveProfile}>
                      <Text style={styles.saveButtonAccountText}>Save</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                      <View style={styles.line} />
                      <Text style={styles.orText}>Password</Text>
                      <View style={styles.line} />
                    </View>

                    <TouchableOpacity style={styles.resetPasswordButton}>
                      <Text style={styles.accountButtonText}>Reset Password</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.dividerRow}>
                      <View style={styles.line} />
                      <Text style={styles.orText}>Account</Text>
                      <View style={styles.line} />
                    </View>

                    <View style={styles.accountRow}>
                      <TouchableOpacity style={styles.accountButton} onPress={handleLogout}>
                        <Text style={styles.accountButtonText}>Log Out</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.accountButton} onPress={handleDeleteAccount}>
                        <Text style={styles.accountButtonText}>Delete Account</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    top: -10,
    left: -10,
  },

  homeContent: {
    flex: 1,
    paddingHorizontal: 34,
    paddingTop: 90,
  },

  menuButton: {
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

  menuText: {
    color: '#F5F5F5',
    fontSize: 30,
    fontFamily: 'Aldrich',
    marginTop: 2,
  },

  logoGlass: {
    width: 88,
    height: 88,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 34,
  },

  homeTitle: {
    color: '#F5F5F5',
    fontSize: 40,
    fontFamily: 'Aldrich',
    marginBottom: 10,
    marginTop: -5,
  },

  homeSubtitle: {
    color: '#F5F5F5',
    fontSize: 20,
    lineHeight: 20,
    fontFamily: 'Aldrich',
    marginBottom: 82,
  },

  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 18,
  },

  homeCard: {
    width: '48.5%',
    height: 176,
    borderRadius: 34,
    marginTop: -10,
    marginBottom: 20,
    overflow: 'hidden',
  },

  cardIconCircle: {
    width: 37,
    height: 37,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(217,217,217,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -5,
    marginTop: -5,
  },

  homeCardGlass: {
    flex: 1,
    borderRadius: 34,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 22,
  },

  homeCardTitle: {
    color: '#F5F5F5',
    fontSize: 18,
    lineHeight: 20,
    fontFamily: 'Aldrich',
    position: 'absolute',
    top: 65,
    left: 17,
  },

  homeCardText: {
    position: 'absolute',
    left: 17,
    top: 115,
    width: 140,
    color: '#F5F5F5',
    fontSize: 12,
    lineHeight: 13,
    fontFamily: 'Aldrich',
  },

  homeCardArrow: {
    position: 'absolute',
    right: 18,
    bottom: 10,
    color: '#F5F5F5',
    fontSize: 25,
  },

  askBar: {
    minHeight: 72,
    maxHeight: 120,
    borderRadius: 39,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginTop: 50,
    paddingLeft: 32,
    paddingRight: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 18,
  },

  askBarKeyboardOpen: {
    marginTop: -280,
    backgroundColor: '#605737e1',
    borderColor: 'rgba(255,255,255,0.28)',
  },

  askIconCircle: {
    width: 50,
    height: 50,
    right: 5,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(217,217,217,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
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

  askPlaceholder: {
    flex: 1,
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Aldrich',
    paddingRight: 14,
  },

  inputIconCircle: {
    width: 37,
    height: 37,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(217,217,217,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    marginRight: -5,
  },

  accountScreen: {
    flex: 1,
    backgroundColor: '#191818',
    top: -15,
  },

  accountContent: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 210,
  },

  accountBackButton: {
    width: 49,
    height: 49,
    borderRadius: 28,
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    backgroundColor: 'rgba(217,217,217,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    left: 40,
    top: 93,
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 18,
  },

  accountTitle: {
    color: '#F5F5F5',
    fontSize: 26,
    fontFamily: 'Aldrich',
    bottom: 85,
  },

  accountSubtitle: {
    color: '#F5F5F5',
    fontSize: 13,
    fontFamily: 'Aldrich',
    marginTop: -73,
    marginBottom: 35,
  },

  accountSwitch: {
    height: 67,
    top: 30,
    borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 73,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  accountActiveTab: {
    flex: 1,
    height: 49,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  accountInactiveTab: {
    flex: 1,
    height: 49,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },

  accountTabText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Aldrich',
    marginTop: 5,
  },

  accountInput: {
    height: 55,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 20,
  },

  accountInputText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Aldrich',
    marginLeft: 18,
    marginTop: 5,
  },

  accountTextInput: {
    flex: 1,
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Aldrich',
    marginLeft: 18,
    marginTop: 5,
  },

  profileMessage: {
    color: '#F5F5F5',
    fontSize: 10,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    marginBottom: 8,
  },

  saveButtonAccount: {
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(9, 42, 255, 0.61)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 18,
    marginBottom: 20,
  },

  saveButtonAccountText: {
    color: '#F5F5F5',
    fontSize: 20,
    fontFamily: 'Aldrich',
    marginTop: 5,
  },

  resetPasswordButton: {
    height: 55,
    borderRadius: 31,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  accountButton: {
    width: '47%',
    height: 55,
    borderRadius: 31,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 18,
  },

  accountButtonText: {
    color: '#F5F5F5',
    fontSize: 15,
    fontFamily: 'Aldrich',
    marginTop: 5,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    top: 25,
    marginBottom: 70,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },

  orText: {
    marginHorizontal: 20,
    color: '#F5F5F5',
    fontSize: 13,
    fontFamily: 'Aldrich',
  },
});