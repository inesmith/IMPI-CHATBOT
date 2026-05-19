import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, PanResponder, Keyboard, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import AttachIcon from '../../assets/images/attachIcon.svg';
import SendIcon from '../../assets/images/sendIcon.svg';

type Props = {
  setCurrentScreen: (screen: string) => void;
};

export default function TalkWithImpiScreen({ setCurrentScreen }: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dx > 20;
    },

    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 100) {
        setCurrentScreen('impiChatMenu');
      }
    },
  });

  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState([
    {
      sender: 'impi',
      text: 'Ranger, I am online. What do you need help with in the field?',
      image: null,
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        sender: 'user',
        text: message,
        image: null,
      },
    ]);

    setMessage('');
  };

  const uploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMessages([
        ...messages,
        {
          sender: 'user',
          text: '',
          image: result.assets[0].uri,
        },
      ]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMessages([
        ...messages,
        {
          sender: 'user',
          text: '',
          image: result.assets[0].uri,
        },
      ]);
    }
  };

  const chooseImageOption = () => {
    Alert.alert('Attach image', 'Choose an option', [
      {
        text: 'Upload Image',
        onPress: uploadImage,
      },
      {
        text: 'Take Photo',
        onPress: takePhoto,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}
      {...panResponder.panHandlers}
    >
      <Image
        source={require('../../assets/images/dust.png')}
        style={styles.dust}
        resizeMode="cover"
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('impiChatMenu')}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>TALK WITH IMPI</Text>
      </View>

      <View style={styles.rangerCard}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.rangerText}>
          IMPI ONLINE{'\n'}
          FIELD COMMS ACTIVE
        </Text>
      </View>

      <View style={styles.chatArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatContent}
        >
          {messages.map((item, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                item.sender === 'impi' ? styles.impiBubble : styles.userBubble,
              ]}
            >
              {item.sender === 'impi' && (
                <Text style={styles.messageLabel}>IMPI</Text>
              )}

              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={styles.chatImage}
                  resizeMode="cover"
                />
              )}

              {item.text ? (
                <Text style={styles.messageText}>{item.text}</Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputBar}>
        <TextInput
          style={[
            styles.input,
            { height: Math.min(120, Math.max(40, message.split('\n').length * 22)) },
          ]}
          placeholder="ASK IMPI..."
          placeholderTextColor="#CFC4B2"
          multiline
          blurOnSubmit={false}
          returnKeyType="default"
          value={message}
          onChangeText={setMessage}
          contextMenuHidden={false}
          selectTextOnFocus
        />

        <TouchableOpacity style={styles.attachButton} onPress={chooseImageOption}>
          <AttachIcon width={24} height={24} />
        </TouchableOpacity>

        {message.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <SendIcon width={24} height={24} />
          </TouchableOpacity>
        ) : null}
      </View>
    </KeyboardAvoidingView>
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

  messageBubble: {
    maxWidth: '78%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 14,
  },

  impiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#191818',
    borderTopLeftRadius: 4,
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#676127a3',
    borderTopRightRadius: 4,
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

  chatImage: {
    width: 190,
    height: 150,
    borderRadius: 14,
  },

  inputBar: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#676127a3',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 5,
    marginBottom: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '95%',
    alignSelf: 'center',
  },

  input: {
    flex: 1,
    color: '#CFC4B2',
    fontFamily: 'Aldrich',
    fontSize: 15,
    maxHeight: 110,
    paddingTop: 13,
    paddingBottom: 8,
  },

  attachButton: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginBottom: 2,
  },

  sendButton: {
    paddingLeft: 8,
    paddingVertical: 10,
    marginBottom: 2,
  },
});