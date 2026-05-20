import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, PanResponder, ScrollView, Alert, Modal, Pressable } from 'react-native';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import SearchIcon from '../../assets/images/searchIcon.svg';
import AttachIcon from '../../assets/images/attachIcon.svg';

type Props = {
  setCurrentScreen: (screen: string) => void;
};

const animalData = [
  {
    name: 'LION',
    heading: 'ANIMAL SPECIE',
    type: 'PREDATOR',
    threat: 'HIGH',
    speed: 'UP TO 80 KM/H',
    lifespan: '10 - 15 YEARS',
    habitat: 'SAVANNA, GRASSLANDS, OPEN WOODLANDS',
    diet: 'ZEBRA, WILDEBEEST, BUFFALO, ANTELOPE',
    note: 'Travels in prides. Look for large paw prints, scat, and drag marks near kills.',
  },
  {
    name: 'ELEPHANT',
    heading: 'ANIMAL SPECIE',
    type: 'HERBIVORE',
    threat: 'MEDIUM',
    speed: 'UP TO 40 KM/H',
    lifespan: '60 - 70 YEARS',
    habitat: 'SAVANNA, WOODLANDS, RIVER AREAS',
    diet: 'GRASS, BARK, FRUIT, LEAVES',
    note: 'Watch for broken branches, fresh dung, deep round tracks, and nearby herd movement.',
  },
  {
    name: 'RHINO',
    heading: 'ANIMAL SPECIE',
    type: 'HERBIVORE',
    threat: 'HIGH',
    speed: 'UP TO 50 KM/H',
    lifespan: '35 - 50 YEARS',
    habitat: 'GRASSLANDS, SAVANNA, BUSHVELD',
    diet: 'GRASS, SHRUBS, LEAVES',
    note: 'Track carefully. Look for middens, large three-toed prints, and disturbed soil.',
  },
  {
    name: 'LEOPARD',
    heading: 'ANIMAL SPECIE',
    type: 'PREDATOR',
    threat: 'HIGH',
    speed: 'UP TO 58 KM/H',
    lifespan: '12 - 17 YEARS',
    habitat: 'WOODLANDS, ROCKY AREAS, RIVERINE BUSH',
    diet: 'IMPALA, BIRDS, SMALL MAMMALS',
    note: 'Often solitary. Look for claw marks, tree drag signs, and hidden movement.',
  },
  {
    name: 'BUFFALO',
    heading: 'ANIMAL SPECIE',
    type: 'HERBIVORE',
    threat: 'HIGH',
    speed: 'UP TO 57 KM/H',
    lifespan: '15 - 25 YEARS',
    habitat: 'GRASSLANDS, SAVANNA, WETLAND EDGES',
    diet: 'GRASS, HERBS, SHRUBS',
    note: 'Can be unpredictable. Look for hoof marks, wallowing areas, and herd trails.',
  },
];

const plantData = [
  {
    name: 'MARULA TREE',
    heading: 'PLANT SPECIE',
    type: 'TREE',
    threat: 'LOW',
    speed: 'SLOW GROWING',
    lifespan: 'UP TO 150 YEARS',
    habitat: 'SAVANNA WOODLANDS',
    diet: 'FRUIT USED BY WILDLIFE',
    note: 'Important food source for wildlife. Fruit attracts elephants, antelope, and birds.',
  },
  {
    name: 'KNOB THORN',
    heading: 'PLANT SPECIE',
    type: 'TREE',
    threat: 'LOW',
    speed: 'MODERATE GROWTH',
    lifespan: 'LONG-LIVED TREE',
    habitat: 'BUSHVELD, SAVANNA, OPEN WOODLAND',
    diet: 'PODS AND LEAVES BROWSED BY WILDLIFE',
    note: 'Common savanna tree. Thorns and seed pods are useful identification markers.',
  },
  {
    name: 'SICKLE BUSH',
    heading: 'PLANT SPECIE',
    type: 'SHRUB',
    threat: 'LOW',
    speed: 'FAST SPREADING',
    lifespan: 'PERENNIAL SHRUB',
    habitat: 'DRY SAVANNA, DISTURBED BUSHVELD',
    diet: 'BROWSED BY SOME HERBIVORES',
    note: 'Dense growth can affect visibility and movement during patrol.',
  },
  {
    name: 'BUFFALO THORN',
    heading: 'PLANT SPECIE',
    type: 'TREE',
    threat: 'LOW',
    speed: 'SLOW TO MODERATE',
    lifespan: 'LONG-LIVED TREE',
    habitat: 'WOODLANDS, BUSHVELD, ROCKY AREAS',
    diet: 'FRUIT AND LEAVES USED BY WILDLIFE',
    note: 'Recognised by zig-zag branches and paired thorns.',
  },
];

export default function SpeciesFieldGuideScreen({ setCurrentScreen }: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [activeType, setActiveType] = useState<'animals' | 'plants'>('animals');
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const modalPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dx > 20;
    },

    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 100) {
        setModalVisible(false);
      }
    },
  });

  const guideData = activeType === 'animals' ? animalData : plantData;

  const filteredData = guideData.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenItem = (item: any) => {
    setUploadedImage(null);
    setSelectedItem(item);
    setModalVisible(true);
  };

  const openVisualSearchModal = (imageUri: string) => {
    const matchedItem = activeType === 'animals' ? animalData[0] : plantData[0];

    setUploadedImage(imageUri);
    setSelectedItem(matchedItem);
    setSearchText('');
    setModalVisible(true);
  };

  const handleUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      openVisualSearchModal(result.assets[0].uri);
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
      openVisualSearchModal(result.assets[0].uri);
    }
  };

  const handleVisualSearch = () => {
    Alert.alert('Visual search', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: handleTakePhoto,
      },
      {
        text: 'Upload Image',
        onPress: handleUploadImage,
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

        <Text style={styles.title}>SPECIES FIELD GUIDE</Text>

        <View style={styles.statusCard}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.statusText}>
            FIELD GUIDE ONLINE{'\n'}
            RANGER REFERENCE ACTIVE
          </Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="SEARCH..."
              placeholderTextColor="#CFC4B2"
              value={searchText}
              onChangeText={setSearchText}
            />

            <SearchIcon
              width={18}
              height={18}
              style={styles.searchIcon}
            />
          </View>

          <TouchableOpacity style={styles.visualSearchButton} onPress={handleVisualSearch}>
            <AttachIcon width={22} height={22} />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleBar}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeType === 'animals' && styles.activeToggle,
            ]}
            onPress={() => setActiveType('animals')}
          >
            <Text style={styles.toggleText}>ANIMALS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeType === 'plants' && styles.activeToggle,
            ]}
            onPress={() => setActiveType('plants')}
          >
            <Text style={styles.toggleText}>PLANTS</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.guideScroll}
          contentContainerStyle={styles.guideScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredData.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.guideCard}
              onPress={() => handleOpenItem(item)}
            >
              <View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardMeta}>
                  {item.type} | THREAT: {item.threat}
                </Text>
              </View>

              <Text style={styles.cardNote}>{item.note}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={require('../../assets/images/dust.png')}
            style={styles.dust}
            resizeMode="cover"
          />

          <Pressable onPress={(event) => event.stopPropagation()}>
            {selectedItem ? (
              <View style={styles.speciesModalCard} {...modalPanResponder.panHandlers}>
                <Text style={styles.modalHeading}>{selectedItem.heading}</Text>

                <View style={styles.speciesImageBox}>
                  <Image
                    source={
                      uploadedImage
                        ? { uri: uploadedImage }
                        : require('../../assets/images/logo.png')
                    }
                    style={styles.speciesImage}
                    resizeMode={uploadedImage ? 'cover' : 'contain'}
                  />
                </View>

                <Text style={styles.speciesName}>{selectedItem.name}</Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalScrollContent}
                >
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>TYPE</Text>
                    <Text style={styles.specValue}>{selectedItem.type}</Text>
                  </View>

                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>THREAT</Text>
                    <Text style={styles.specValue}>{selectedItem.threat}</Text>
                  </View>

                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>SPEED / GROWTH</Text>
                    <Text style={styles.specValue}>{selectedItem.speed}</Text>
                  </View>

                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>LIFESPAN</Text>
                    <Text style={styles.specValue}>{selectedItem.lifespan}</Text>
                  </View>

                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>HABITAT</Text>
                    <Text style={styles.specValue}>{selectedItem.habitat}</Text>
                  </View>

                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>
                      {activeType === 'animals' ? 'DIET' : 'WILDLIFE USE'}
                    </Text>
                    <Text style={styles.specValue}>{selectedItem.diet}</Text>
                  </View>

                  <Text style={styles.modalNote}>{selectedItem.note}</Text>
                </ScrollView>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
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
    marginBottom: 22,

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

  searchRow: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  searchBar: {
    flex: 1,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#8033077c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginRight: 12,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  visualSearchButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#8033077c',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  toggleBar: {
    width: '95%',
    height: 50,
    borderRadius: 18,
    backgroundColor: '#191818',
    flexDirection: 'row',
    padding: 5,
    marginTop: -5,
    marginBottom: 22,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  toggleButton: {
    flex: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  activeToggle: {
    backgroundColor: '#676127a3',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  toggleText: {
    color: '#CFC4B2',
    fontSize: 11,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
  },

  searchInput: {
    flex: 1,
    color: '#CFC4B2',
    fontSize: 11,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
    marginTop: 2,
  },

  searchIcon: {
    opacity: 0.8,
  },

  guideScroll: {
    width: '100%',
    flex: 1,
  },

  guideScrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },

  guideCard: {
    width: '95%',
    borderRadius: 18,
    backgroundColor: '#191818',
    padding: 18,
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

  cardTitle: {
    color: '#CFC4B2',
    fontSize: 15,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
    marginBottom: 8,
  },

  cardMeta: {
    color: '#CFC4B2',
    fontSize: 10,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
    opacity: 0.75,
    marginBottom: 14,
  },

  cardNote: {
    color: '#CFC4B2',
    fontSize: 11,
    fontFamily: 'Aldrich',
    lineHeight: 18,
    opacity: 0.9,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#191818',
    justifyContent: 'center',
    alignItems: 'center',
  },

  speciesModalCard: {
    width: 330,
    minHeight: 520,
    borderRadius: 24,
    backgroundColor: 'rgba(103, 97, 39, 0.38)',
    borderWidth: 2,
    borderColor: 'rgba(207, 196, 178, 0.25)',
    padding: 22,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,

    elevation: 8,
  },

  modalHeading: {
    color: '#F4F1EA',
    fontSize: 24,
    fontFamily: 'Aldrich',
    letterSpacing: 1.5,
    marginBottom: 18,
    textAlign: 'center',
  },

  speciesImageBox: {
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

  speciesImage: {
    width: '100%',
    height: '100%',
  },

  speciesName: {
    color: '#F4F1EA',
    fontSize: 18,
    fontFamily: 'Aldrich',
    letterSpacing: 1.5,
    marginBottom: 14,
    textAlign: 'center',
  },

  modalScrollContent: {
    paddingBottom: 20,
  },

  specRow: {
    width: '100%',
    backgroundColor: 'rgba(25, 24, 24, 0.45)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },

  specLabel: {
    color: '#CFC4B2',
    fontSize: 8,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
    marginBottom: 4,
  },

  specValue: {
    color: '#F4F1EA',
    fontSize: 11,
    fontFamily: 'Aldrich',
    lineHeight: 17,
  },

  modalNote: {
    color: '#F4F1EA',
    fontSize: 11,
    fontFamily: 'Aldrich',
    lineHeight: 18,
    backgroundColor: 'rgba(25, 24, 24, 0.45)',
    borderRadius: 12,
    padding: 10,
    marginTop: 0,
  },
});