import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useEffect, useRef, useState } from 'react';
import { PanResponder } from 'react-native';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../services/firebaseConfig';

type Props = {
  setCurrentScreen: (screen: string) => void;
  selectedStoryId: string;
};

type StoryTemplate = {
  title: string;
  subtitle: string;
  totalChapters: number;
  estimatedMinutes: number;
  coverType: string;
};

type StoryChapter = {
  id: string;
  storyId: string;
  chapterNumber: number;
  chapterTitle: string;
  content: string[];
};

export default function RangerStoryReaderScreen({
  setCurrentScreen,
  selectedStoryId,
}: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [story, setStory] = useState<StoryTemplate | null>(null);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentChapterNumber, setCurrentChapterNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  const totalChapters = chapters.length || story?.totalChapters || 1;

  const readTime = story?.estimatedMinutes
    ? `${story.estimatedMinutes} min read`
    : '1 min read';

  const progressWidth = `${Math.max(0, Math.min(progressPercent, 100))}%`;

  const saveProgress = async (progress: number, chapterNumber: number) => {
    try {
      if (!auth.currentUser) return;

      await setDoc(
        doc(db, 'userStoryProgress', `${auth.currentUser.uid}_${selectedStoryId}`),
        {
          userId: auth.currentUser.uid,
          storyId: selectedStoryId,
          currentChapter: chapterNumber,
          progressPercent: Math.round(progress),
          completed: progress >= 100,
          lastReadAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.log('SAVE STORY PROGRESS ERROR:', error);
    }
  };

  useEffect(() => {
    async function loadStory() {
      try {
        const storyDoc = await getDoc(doc(db, 'storyTemplates', selectedStoryId));

        if (storyDoc.exists()) {
          const data = storyDoc.data();

          setStory({
            title: data.title || 'Untitled Story',
            subtitle: data.subtitle || '',
            totalChapters: data.totalChapters || 1,
            estimatedMinutes: data.estimatedMinutes || 1,
            coverType: data.coverType || 'story',
          });
        }

        const chaptersQuery = query(
          collection(db, 'storyChapters'),
          where('storyId', '==', selectedStoryId)
        );

        const chapterSnapshot = await getDocs(chaptersQuery);

        const loadedChapters: StoryChapter[] = chapterSnapshot.docs
          .map((chapterDoc) => {
            const data = chapterDoc.data();

            console.log('CHAPTER DATA:', data);

            return {
              id: chapterDoc.id,
              storyId: data.storyId,
              chapterNumber: data.chapterNumber || 1,
              chapterTitle: data.chapterTitle || data.title || 'Chapter',
              content: data.content || [],
            };
          })
          .sort((a, b) => a.chapterNumber - b.chapterNumber);

        setChapters(loadedChapters);
        console.log('CHAPTERS FOUND:', loadedChapters.length);
        console.log(loadedChapters);
      } catch (error) {
        console.log('LOAD STORY ERROR:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStory();
  }, [selectedStoryId]);

  const handleScroll = (event: any) => {
    const offsetY = Math.max(0, event.nativeEvent.contentOffset.y);
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    const scrollableHeight = contentHeight - layoutHeight;

    if (scrollableHeight <= 0) {
      setProgressPercent(100);
      setCurrentChapterNumber(totalChapters);
      saveProgress(100, totalChapters);
      return;
    }

    const scrollProgress = Math.min(offsetY / scrollableHeight, 1);
    const finalProgress = Math.round(scrollProgress * 100);

    const estimatedChapter = Math.min(
      totalChapters,
      Math.max(1, Math.ceil(scrollProgress * totalChapters))
    );

    setProgressPercent(finalProgress);
    setCurrentChapterNumber(estimatedChapter);
    saveProgress(finalProgress, estimatedChapter);
  };

  const finishReading = () => {
    setProgressPercent(100);
    setCurrentChapterNumber(totalChapters);
    saveProgress(100, totalChapters);
    setCurrentScreen('rangerStories');
  };

  const swipeBackResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dx > 25 && Math.abs(gesture.dy) < 20,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 90) {
          saveProgress(progressPercent, currentChapterNumber);
          setCurrentScreen('rangerStories');
        }
      },
    })
  ).current;

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container} {...swipeBackResponder.panHandlers}>
      <Image
        source={require('../../assets/images/wallpaper.png')}
        style={styles.wallpaper}
        resizeMode="cover"
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          saveProgress(progressPercent, currentChapterNumber);
          setCurrentScreen('rangerStories');
        }}
      >
        <MaterialIcons name="arrow-back" size={30} color="#F5F5F5" />
      </TouchableOpacity>

      <ScrollView
        style={styles.reader}
        contentContainerStyle={styles.readerContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={300}
      >
        {loading ? (
          <Text style={styles.paragraph}>Loading story...</Text>
        ) : null}

        {!loading && chapters.length === 0 ? (
          <Text style={styles.paragraph}>This story has no chapters yet.</Text>
        ) : null}

        {chapters.map((chapter) => (
          <View key={chapter.id} style={styles.chapterBlock}>
            <Text style={styles.chapter}>CHAPTER {chapter.chapterNumber}</Text>

            <Text style={styles.title}>{chapter.chapterTitle}</Text>

            <View style={styles.smallDivider} />

            {chapter.content.map((paragraph, index) => (
              <Text key={index} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        {chapters.length > 0 ? (
          <TouchableOpacity style={styles.finishButton} onPress={finishReading}>
            <Text style={styles.finishText}>Finish Reading</Text>
            <MaterialIcons name="chevron-right" size={22} color="#F5F5F5" />
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <View style={styles.bottomDetails}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailText}>{progressPercent}%</Text>
          <Text style={styles.detailText}>
            Chapter {currentChapterNumber} of {totalChapters}
          </Text>
          <Text style={styles.detailText}>{readTime}</Text>
        </View>
      </View>
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
    zIndex: 10,
  },

  reader: {
    position: 'absolute',
    top: 170,
    left: 38,
    right: 38,
    bottom: 140,
  },

  readerContent: {
    paddingBottom: 30,
  },

  chapterBlock: {
    marginBottom: 55,
  },

  chapter: {
    color: '#F5F5F5',
    fontSize: 12,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    letterSpacing: 3,
    opacity: 0.8,
    marginBottom: 18,
  },

  title: {
    color: '#F5F5F5',
    fontSize: 28,
    lineHeight: 35,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    marginBottom: 20,
  },


  smallDivider: {
    width: 38,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignSelf: 'center',
    marginBottom: 35,
  },

  paragraph: {
    color: '#F5F5F5',
    fontSize: 16,
    lineHeight: 27,
    fontFamily: 'Aldrich',
    marginBottom: 22,
  },

  finishButton: {
    height: 58,
    borderRadius: 31,
    backgroundColor: 'rgba(217,217,217,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
  },

  finishText: {
    color: '#F5F5F5',
    fontSize: 13,
    fontFamily: 'Aldrich',
  },

  bottomDetails: {
    position: 'absolute',
    left: 38,
    right: 38,
    bottom: 45,
    height: 72,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  progressTrack: {
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
    marginBottom: 13,
  },

  progressFill: {
    height: 4,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailText: {
    color: '#F5F5F5',
    fontSize: 10,
    fontFamily: 'Aldrich',
    opacity: 0.85,
  },
});