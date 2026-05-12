import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View,  KeyboardAvoidingView, Platform, ScrollView, PanResponder, Keyboard, } from 'react-native';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

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

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
        setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardVisible(false);
    });

    return () => {
        showSubscription.remove();
        hideSubscription.remove();
    };
  }, []);

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
        resizeMode="stretch"
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
            <Text style={styles.messageLabel}>IMPI</Text>
            <Text style={styles.messageText}>
            Ranger, I am online. What do you need help with in the field?
            </Text>
        </ScrollView>
      </View>

      <View style={styles.inputBar}>
        <TextInput
            style={[
                styles.input,
                { height: Math.min(120, Math.max(40, message.split('\n').length * 22)) }
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

        {keyboardVisible ? (
            <TouchableOpacity
                style={styles.sendButton}
                onPress={() => Keyboard.dismiss()}
            >
                <Text style={styles.sendText}>DONE</Text>
            </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendText}>SEND</Text>
        </TouchableOpacity>
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
    width: '100%',
    height: '100%',
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
    backgroundColor: '#8033077c',
    padding: 22,
    width: '95%',
    alignSelf: 'center',
    marginBottom: 20,
  },

  chatContent: {
    paddingBottom: 20,
  },

  messageLabel: {
    color: '#CFC4B2',
    fontSize: 11,
    fontFamily: 'Aldrich',
    marginBottom: 12,
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

  sendButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  sendText: {
    color: '#CFC4B2',
    fontFamily: 'Aldrich',
    fontSize: 11,
    marginBottom: 4,
  },
});