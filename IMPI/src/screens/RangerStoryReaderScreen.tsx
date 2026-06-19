import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useEffect, useRef, useState } from 'react';
import { PanResponder } from 'react-native';

type Props = {
  setCurrentScreen: (screen: string) => void;
  selectedStoryId: string;
};

const storyContent: Record<string, any> = {
  'night-patrol': {
    title: 'Night Patrol',
    chapter: 'Chapter 1',
    chapterTotal: 'Chapter 1 of 3',
    readTime: '5 min read',
    progress: '35%',
    body: [
      'The sun had already disappeared behind the hills when the ranger team began their patrol.',
      'At night, the bush feels different. Every sound matters. A broken branch, a distant call, or a fresh track can tell a ranger that something has changed.',
      'The team moved slowly, checking the fence line and looking for signs of movement near the waterhole.',
      'Ranger work is not only about reacting to danger. It is about noticing small details before they become serious problems.',
    ],
  },
  'lost-rhino-calf': {
    title: 'The Lost Rhino Calf',
    chapter: 'Chapter 1',
    chapterTotal: 'Chapter 1 of 2',
    readTime: '7 min read',
    progress: '12%',
    body: [
      'The calf was found standing alone near thick bush, calling softly for its mother.',
      'The ranger team kept their distance. In conservation, rushing in can sometimes create more harm than good.',
      'They recorded the location, watched the calf carefully, and waited for the wildlife team to arrive.',
      'This story shows that patience, teamwork, and careful observation are some of the most important ranger skills.',
    ],
  },
  'elephant-crossing': {
    title: 'Elephant Crossing',
    chapter: 'Chapter 1',
    chapterTotal: 'Chapter 1 of 1',
    readTime: '4 min read',
    progress: '0%',
    body: [
      'A herd of elephants approached the road just as vehicles began to gather nearby.',
      'The ranger raised a hand and asked everyone to wait. The safest action was not to rush the animals, but to give them space.',
      'One by one, the elephants crossed. The youngest stayed close to the adults.',
      'A ranger protects people by helping them understand when nature needs room.',
    ],
  },
};

export default function RangerStoryReaderScreen({
  setCurrentScreen,
  selectedStoryId,
}: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const story = storyContent[selectedStoryId] || storyContent['night-patrol'];

  const swipeBackResponder = useRef(
    PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dx > 25 && Math.abs(gesture.dy) < 20,
        onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 90) {
            setCurrentScreen('rangerStories');
        }
        },
    })
    ).current;

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}  {...swipeBackResponder.panHandlers}>
      <Image
        source={require('../../assets/images/wallpaper.png')}
        style={styles.wallpaper}
        resizeMode="cover"
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentScreen('rangerStories')}
      >
        <MaterialIcons name="arrow-back" size={30} color="#F5F5F5" />
      </TouchableOpacity>

      <ScrollView
        style={styles.reader}
        contentContainerStyle={styles.readerContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.chapter}>{story.chapter}</Text>
        <Text style={styles.title}>{story.title}</Text>

        <View style={styles.divider} />

        {story.body.map((paragraph: string, index: number) => (
          <Text key={index} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.bottomDetails}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: story.progress }]} />
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailText}>{story.progress}</Text>
          <Text style={styles.detailText}>{story.chapterTotal}</Text>
          <Text style={styles.detailText}>{story.readTime}</Text>
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
    paddingBottom: 20,
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
    fontSize: 31,
    lineHeight: 38,
    fontFamily: 'Aldrich',
    textAlign: 'center',
    marginBottom: 20,
  },

  divider: {
    width: 45,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
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