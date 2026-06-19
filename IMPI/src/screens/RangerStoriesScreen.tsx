import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { PanResponder } from 'react-native';
import { useFonts } from 'expo-font';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { auth, db } from '../services/firebaseConfig';

type Props = {
  setCurrentScreen: (screen: string) => void;
  setSelectedStoryId: (storyId: string) => void;
};

type Story = {
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  totalChapters: number;
  coverType: string;
  progress?: number;
};

export default function RangerStoriesScreen({
  setCurrentScreen,
  setSelectedStoryId,
}: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  const swipeBackResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dx > 25 && Math.abs(gesture.dy) < 20,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 90) {
          setCurrentScreen('home');
        }
      },
    })
  ).current;

  useEffect(() => {
    async function loadStories() {
      try {
        const progressMap: Record<string, number> = {};

        if (auth.currentUser) {
          const progressQuery = query(
            collection(db, 'userStoryProgress'),
            where('userId', '==', auth.currentUser.uid)
          );

          const progressSnapshot = await getDocs(progressQuery);

          progressSnapshot.forEach((doc) => {
            const data = doc.data();

            progressMap[data.storyId] = data.progressPercent || 0;
          });
        }

        const storySnapshot = await getDocs(collection(db, 'storyTemplates'));

        const loadedStories: Story[] = storySnapshot.docs
          .map((storyDoc) => {
            const data = storyDoc.data();

            return {
              id: storyDoc.id,
              title: data.title || 'Untitled Story',
              subtitle: data.subtitle || '',
              estimatedMinutes: data.estimatedMinutes || 1,
              totalChapters: data.totalChapters || 1,
              coverType: data.coverType || 'story',
              progress: progressMap[storyDoc.id] || 0,
            };
          })
          .filter((story) => story.id !== 'testStory');

          console.log('STORIES FOUND:', loadedStories.length);
console.log(loadedStories);
        setStories(loadedStories);
      } catch (error) {
        console.log('LOAD STORIES ERROR:', error);
      } finally {
        setLoadingStories(false);
      }
    }

    loadStories();
  }, []);

  const openStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    setCurrentScreen('rangerStoryReader');
  };

  const storyMatchesSearch = (story: Story) => {
    const search = searchText.trim().toLowerCase();

    if (!search) return true;

    return (
      story.title.toLowerCase().includes(search) ||
      story.subtitle.toLowerCase().includes(search) ||
      `${story.estimatedMinutes} min read`.toLowerCase().includes(search)
    );
  };

  const filteredStories = stories.filter(storyMatchesSearch);

  console.log('FILTERED STORIES:', filteredStories);
  const continueStory = filteredStories.find(
  story => story.progress! > 0 && story.progress! < 100
  );

  const completedStories = filteredStories.filter(
    story => story.progress === 100
  );

  const otherStories = filteredStories.filter(
    story =>
      story.id !== continueStory?.id &&
      story.progress !== 100
  );
  

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container} {...swipeBackResponder.panHandlers}>
      <Image
        source={require('../../assets/images/wallpaper.png')}
        style={styles.wallpaper}
        resizeMode="cover"
      />

      <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
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

      <Text style={styles.title}>Ranger Stories</Text>
      <Text style={styles.subtitle}>Pick up where you left off</Text>

      <ScrollView
        style={styles.storyList}
        contentContainerStyle={styles.storyContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingStories ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Loading stories...</Text>
          </View>
        ) : null}

        {!loadingStories && filteredStories.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No stories found.</Text>
          </View>
        ) : null}

        {continueStory ? (
          <TouchableOpacity
            style={styles.continueCard}
            activeOpacity={0.85}
            onPress={() => openStory(continueStory.id)}
          >
            <BlurView intensity={25} tint="light" style={styles.continueGlass}>
              <View style={styles.coverBox}>
                <MaterialIcons name="menu-book" size={42} color="#F5F5F5" />
                <Text style={styles.coverText}>IMPI</Text>
              </View>

              <View style={styles.continueInfo}>
                <Text style={styles.continueTitle}>{continueStory.title}</Text>
                <Text style={styles.continueSubtitle}>{continueStory.subtitle}</Text>

                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${continueStory.progress || 0}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{continueStory.progress || 0}%</Text>
                </View>

                <Text style={styles.readTime}>{continueStory.estimatedMinutes} min read</Text>
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => openStory(continueStory.id)}
              >
                <Text style={styles.continueButtonText}>Continue Reading</Text>
                <MaterialIcons name="chevron-right" size={22} color="#F5F5F5" />
              </TouchableOpacity>
            </BlurView>
          </TouchableOpacity>
        ) : null}

        {otherStories.length > 0 ? (
          <>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Other Stories</Text>
            </View>

            <View style={styles.recentGrid}>
              {otherStories.map((story) => (
                <TouchableOpacity
                  key={story.id}
                  style={styles.recentCard}
                  activeOpacity={0.85}
                  onPress={() => openStory(story.id)}
                >
                  <BlurView intensity={22} tint="light" style={styles.recentGlass}>
                    <View style={styles.smallCover}>
                      <MaterialIcons name="auto-stories" size={30} color="#F5F5F5" />
                    </View>

                    <Text style={styles.smallTitle}>{story.title}</Text>
                    <Text style={styles.smallTime}>{story.estimatedMinutes} min read</Text>

                    <View style={styles.smallProgressTrack}>
                      <View style={[styles.smallProgressFill, { width: `${story.progress || 0}%` }]} />
                    </View>

                    <Text style={styles.smallProgress}>{story.progress || 0}%</Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        {completedStories.length > 0 ? (
  <>
    <View style={styles.recentHeader}>
      <Text style={styles.recentTitle}>Completed Readings</Text>
    </View>

    <View style={styles.recentGrid}>
      {completedStories.map((story) => (
        <TouchableOpacity
          key={story.id}
          style={styles.recentCard}
          activeOpacity={0.85}
          onPress={() => openStory(story.id)}
        >
          <BlurView intensity={22} tint="light" style={styles.recentGlass}>
            <View style={styles.smallCover}>
              <MaterialIcons name="done" size={30} color="#F5F5F5" />
            </View>

            <Text style={styles.smallTitle}>{story.title}</Text>
            <Text style={styles.smallTime}>{story.estimatedMinutes} min read</Text>

            <View style={styles.smallProgressTrack}>
              <View style={[styles.smallProgressFill, { width: '100%' }]} />
            </View>

            <Text style={styles.smallProgress}>Completed</Text>
          </BlurView>
        </TouchableOpacity>
      ))}
    </View>
  </>
) : null}
      </ScrollView>
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
    fontSize: 30,
    fontFamily: 'Aldrich',
    marginTop: 175,
    marginLeft: 34,
  },

  subtitle: {
    color: '#F5F5F5',
    fontSize: 13,
    fontFamily: 'Aldrich',
    marginTop: 8,
    marginLeft: 34,
    opacity: 0.9,
  },

  storyList: {
    flex: 1,
    marginTop: 28,
    paddingHorizontal: 34,
  },

  storyContent: {
    paddingBottom: 60,
  },

  continueCard: {
    height: 260,
    borderRadius: 34,
    overflow: 'hidden',
    marginBottom: 34,
  },

  continueGlass: {
    flex: 1,
    borderRadius: 34,
    backgroundColor: 'rgba(217,217,217,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 18,
  },

  coverBox: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 105,
    height: 135,
    borderRadius: 20,
    backgroundColor: 'rgba(25,24,24,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  coverText: {
    color: '#F5F5F5',
    fontSize: 13,
    fontFamily: 'Aldrich',
    marginTop: 10,
  },

  continueInfo: {
    marginLeft: 128,
    paddingTop: 25,
    paddingRight: 10,
  },

  continueTitle: {
    color: '#F5F5F5',
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'Aldrich',
    marginBottom: 8,
  },

  continueSubtitle: {
    color: '#F5F5F5',
    fontSize: 11,
    lineHeight: 15,
    fontFamily: 'Aldrich',
    opacity: 0.85,
    marginBottom: 18,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },

  progressFill: {
    height: 4,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },

  progressText: {
    color: '#F5F5F5',
    fontSize: 10,
    fontFamily: 'Aldrich',
  },

  readTime: {
    color: '#F5F5F5',
    fontSize: 10,
    fontFamily: 'Aldrich',
    opacity: 0.75,
    marginTop: 10,
  },

  continueButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 180,
    height: 58,
    borderRadius: 31,
    backgroundColor: 'rgba(25,24,24,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  continueButtonText: {
    color: '#F5F5F5',
    fontSize: 13,
    fontFamily: 'Aldrich',
  },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  recentTitle: {
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Aldrich',
  },

  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  recentCard: {
    width: '48%',
    height: 205,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },

  recentGlass: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: 'rgba(217,217,217,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    padding: 14,
  },

  smallCover: {
    height: 88,
    borderRadius: 18,
    backgroundColor: 'rgba(25,24,24,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  smallTitle: {
    color: '#F5F5F5',
    fontSize: 12,
    lineHeight: 15,
    fontFamily: 'Aldrich',
    marginBottom: 6,
  },

  smallTime: {
    color: '#F5F5F5',
    fontSize: 9,
    fontFamily: 'Aldrich',
    opacity: 0.7,
    marginBottom: 8,
  },

  smallProgressTrack: {
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.20)',
    overflow: 'hidden',
  },

  smallProgressFill: {
    height: 3,
    borderRadius: 3,
    backgroundColor: '#F5F5F5',
  },

  smallProgress: {
    color: '#F5F5F5',
    fontSize: 9,
    fontFamily: 'Aldrich',
    opacity: 0.75,
    marginTop: 6,
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
});