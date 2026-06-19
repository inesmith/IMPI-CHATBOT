import {
  Alert,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { PanResponder } from 'react-native';
import { useFonts } from 'expo-font';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../services/firebaseConfig';

type Props = {
  setCurrentScreen: (screen: string) => void;
  setInitialChatMessage: (message: string) => void;
  setSelectedChatId: (chatId: string | null) => void;
};

type ChatMessage = {
  role: 'user' | 'impi';
  content: string;
};

type ChatHistoryItem = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: any;
  pinned?: boolean;
  archived?: boolean;
  messages?: ChatMessage[];
};

export default function ChatHistoryScreen({
  setCurrentScreen,
  setInitialChatMessage,
  setSelectedChatId,
}: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatHistoryItem | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameText, setRenameText] = useState('');

  const loadHistory = async () => {
    if (!auth.currentUser) return;

    const historyQuery = query(
      collection(db, 'chatHistory'),
      where('userId', '==', auth.currentUser.uid)
    );

    const snapshot = await getDocs(historyQuery);

    const chats = snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as Omit<ChatHistoryItem, 'id'>),
    }));

    const sortedChats = chats.sort((a, b) => {
      const aTime = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
      const bTime = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;

      return bTime - aTime;
    });

    setHistory(sortedChats);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const formatDate = (dateValue: any) => {
    if (!dateValue?.toDate) return 'Recently';

    const date = dateValue.toDate();

    return date.toLocaleString('en-ZA', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const chatMatchesSearch = (chat: ChatHistoryItem) => {
    const search = searchText.trim().toLowerCase();

    if (!search) return true;

    const titleMatch = chat.title?.toLowerCase().includes(search);
    const lastMessageMatch = chat.lastMessage?.toLowerCase().includes(search);

    const messageMatch = chat.messages?.some((item) =>
      item.content.toLowerCase().includes(search)
    );

    return titleMatch || lastMessageMatch || messageMatch;
  };

  const filteredHistory = history.filter(chatMatchesSearch);

  const pinnedChats = filteredHistory.filter(
    (chat) => chat.pinned === true && chat.archived !== true
  );

  const normalChats = filteredHistory.filter(
    (chat) => chat.pinned !== true && chat.archived !== true
  );

  const archivedChats = filteredHistory.filter(
    (chat) => chat.archived === true
  );

  const openChatMenu = (chat: ChatHistoryItem) => {
    setSelectedChat(chat);
    setRenameText(chat.title);
    setMenuVisible(true);
  };

  const closeChatMenu = () => {
    setMenuVisible(false);
    setSelectedChat(null);
  };

  const handleOpenChat = (chat: ChatHistoryItem) => {
    if (menuVisible) return;

    setSelectedChatId(chat.id);
    setInitialChatMessage('');
    setCurrentScreen('talkWithImpi');
  };

  const handleDeleteChat = () => {
    if (!selectedChat) return;

    Alert.alert('Delete Chat', 'Are you sure you want to delete this chat?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'chatHistory', selectedChat.id));
          closeChatMenu();
          loadHistory();
        },
      },
    ]);
  };

  const handleRenameChat = async () => {
    if (!selectedChat || !renameText.trim()) return;

    await updateDoc(doc(db, 'chatHistory', selectedChat.id), {
      title: renameText.trim(),
      updatedAt: serverTimestamp(),
    });

    setRenameVisible(false);
    closeChatMenu();
    loadHistory();
  };

  const handleTogglePin = async () => {
    if (!selectedChat) return;

    await updateDoc(doc(db, 'chatHistory', selectedChat.id), {
      pinned: !selectedChat.pinned,
      updatedAt: serverTimestamp(),
    });

    closeChatMenu();
    loadHistory();
  };

  const handleArchiveChat = async () => {
    if (!selectedChat) return;

    await updateDoc(doc(db, 'chatHistory', selectedChat.id), {
      archived: !selectedChat.archived,
      updatedAt: serverTimestamp(),
    });

    closeChatMenu();
    loadHistory();
  };

  const swipeBackResponder = useRef(
    PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dx > 25 && Math.abs(gesture.dy) < 20,
        onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 90) {
            setCurrentScreen('impiChatMenu');
        }
        },
    })
    ).current;

  const renderChatCard = (chat: ChatHistoryItem) => {
    const isSelected = menuVisible && selectedChat?.id === chat.id;

    return (
      <View key={chat.id}>
        <TouchableOpacity
          style={[
            styles.historyCard,
            isSelected && styles.selectedHistoryCard,
            menuVisible && !isSelected && styles.dimmedHistoryCard,
          ]}
          activeOpacity={0.85}
          onPress={() => handleOpenChat(chat)}
          onLongPress={() => openChatMenu(chat)}
        >
          <View style={styles.cardHeader}{...swipeBackResponder.panHandlers}>
            <Text style={styles.historyTitle}>{chat.title}</Text>

            <View style={styles.rightHeader}>
              <Text style={styles.historyDate}>{formatDate(chat.updatedAt)}</Text>

              {chat.pinned ? (
                <MaterialIcons name="push-pin" size={15} color="#F5F5F5" />
              ) : null}
            </View>
          </View>
        </TouchableOpacity>

        {isSelected ? (
          <View style={styles.actionMenu}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTogglePin}>
              <MaterialIcons name="push-pin" size={20} color="#F5F5F5" />
              <Text style={styles.actionText}>
                {selectedChat?.pinned ? 'Unpin' : 'Pin'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setMenuVisible(false);
                setRenameVisible(true);
              }}
            >
              <MaterialIcons name="edit" size={20} color="#F5F5F5" />
              <Text style={styles.actionText}>Rename</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleArchiveChat}>
              <MaterialIcons name="archive" size={20} color="#F5F5F5" />
              <Text style={styles.actionText}>
                {selectedChat?.archived ? 'Unarchive' : 'Archive'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteChat}>
              <MaterialIcons name="delete-outline" size={20} color="#FF5A5A" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

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
        onPress={() => setCurrentScreen('impiChatMenu')}
      >
        <MaterialIcons name="arrow-back" size={30} color="#F5F5F5" />
      </TouchableOpacity>

      <View style={[styles.topSearch, searchOpen && styles.topSearchOpen]}>
        {searchOpen ? (
          <TextInput
            style={styles.topSearchInput}
            placeholder="Search..."
            placeholderTextColor="#F5F5F5"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        ) : null}

        <TouchableOpacity
          onPress={() => {
            if (searchOpen && searchText.trim()) {
              setSearchText('');
            } else {
              setSearchOpen(!searchOpen);
            }
          }}
        >
          <MaterialIcons
            name={searchOpen && searchText.trim() ? 'close' : 'search'}
            size={28}
            color="#F5F5F5"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Chat History</Text>
      <Text style={styles.subtitle}>Press and hold a chat for options</Text>

      <ScrollView
        style={styles.historyList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.historyContent}
      >
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No chats found.</Text>
          </View>
        ) : (
          <>
            {pinnedChats.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Pinned</Text>
                {pinnedChats.map(renderChatCard)}
              </>
            ) : null}

            {normalChats.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Recents</Text>
                {normalChats.map(renderChatCard)}
              </>
            ) : null}

            {archivedChats.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Archived</Text>
                {archivedChats.map(renderChatCard)}
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <Modal visible={renameVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.renameBox}>
            <Text style={styles.actionTitle}>Rename Chat</Text>

            <TextInput
              style={styles.renameInput}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Chat title"
              placeholderTextColor="#F5F5F5"
              autoFocus
            />

            <TouchableOpacity style={styles.renameSaveButton} onPress={handleRenameChat}>
              <Text style={styles.renameSaveText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setRenameVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {menuVisible ? (
        <TouchableOpacity style={styles.clearMenuLayer} onPress={closeChatMenu} />
      ) : null}
    </View>
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
    left: -10,
    top: -10,
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

  topSearch: {
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
    flexDirection: 'row',
    zIndex: 20,
  },

  topSearchOpen: {
    width: 270,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    flexDirection: 'row',
  },

  topSearchInput: {
    flex: 1,
    color: '#F5F5F5',
    fontSize: 14,
    fontFamily: 'Aldrich',
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 3,
  },

  title: {
    color: '#F5F5F5',
    fontSize: 26,
    fontFamily: 'Aldrich',
    marginTop: 195,
    marginLeft: 34,
  },

  subtitle: {
    color: '#F5F5F5',
    fontSize: 14,
    fontFamily: 'Aldrich',
    marginTop: 8,
    marginLeft: 34,
  },

  historyList: {
    flex: 1,
    marginTop: 40,
    paddingHorizontal: 34,
  },

  historyContent: {
    paddingBottom: 70,
  },

  sectionTitle: {
    color: '#F5F5F5',
    fontSize: 13,
    fontFamily: 'Aldrich',
    marginBottom: 10,
    marginTop: 10,
    opacity: 0.85,
  },

  historyCard: {
    minHeight: 30,
    borderRadius: 28,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 22,
    marginBottom: 15,
  },

  selectedHistoryCard: {
    backgroundColor: 'rgba(217,217,217,0.30)',
    borderColor: 'rgba(255,255,255,0.35)',
    transform: [{ scale: 1.02 }],
    zIndex: 10,
  },

  dimmedHistoryCard: {
    opacity: 0.35,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  historyTitle: {
    flex: 1,
    color: '#F5F5F5',
    fontSize: 15,
    fontFamily: 'Aldrich',
    marginRight: 12,
  },

  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  historyDate: {
    color: '#F5F5F5',
    fontSize: 10,
    fontFamily: 'Aldrich',
    opacity: 0.8,
  },

  emptyBox: {
    height: 120,
    borderRadius: 28,
    backgroundColor: 'rgba(217,217,217,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    color: '#F5F5F5',
    fontSize: 14,
    fontFamily: 'Aldrich',
  },

  actionMenu: {
    width: 250,
    borderRadius: 30,
    borderWidth: 1,
    backgroundColor: 'rgba(217,217,217,0.30)',
    borderColor: 'rgba(255,255,255,0.35)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: -5,
    marginBottom: 18,
    alignSelf: 'flex-start',
    zIndex: 10,
  },

  actionButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  actionText: {
    color: '#F5F5F5',
    fontSize: 15,
    fontFamily: 'Aldrich',
    marginLeft: 22,
  },

  deleteText: {
    color: '#FF5A5A',
    fontSize: 15,
    fontFamily: 'Aldrich',
    marginLeft: 22,
  },

  clearMenuLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(25,24,24,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 34,
  },

  actionTitle: {
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Aldrich',
    marginBottom: 18,
  },

  renameBox: {
    width: '100%',
    borderRadius: 32,
    backgroundColor: 'rgba(96,87,55,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 24,
  },

  renameInput: {
    height: 55,
    borderRadius: 28,
    backgroundColor: 'rgba(217,217,217,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#F5F5F5',
    fontSize: 14,
    fontFamily: 'Aldrich',
    paddingHorizontal: 18,
    marginBottom: 16,
  },

  renameSaveButton: {
    height: 55,
    borderRadius: 28,
    backgroundColor: 'rgba(217,217,217,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  renameSaveText: {
    color: '#F5F5F5',
    fontSize: 15,
    fontFamily: 'Aldrich',
  },

  cancelButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },

  cancelText: {
    color: '#F5F5F5',
    fontSize: 14,
    fontFamily: 'Aldrich',
  },
});