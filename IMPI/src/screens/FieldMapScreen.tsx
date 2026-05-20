import { Image, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable, ScrollView, PanResponder, TextInput, Keyboard } from 'react-native';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { addDoc, collection, getDocs, serverTimestamp, deleteDoc, doc, updateDoc, } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

type Props = {
  setCurrentScreen: (screen: string) => void;
};

const reportOptions = [
  'POACHERS / SUSPICIOUS ACTIVITY',
  'BROKEN FENCE',
  'INJURED ANIMAL',
  'SNARE / TRAP',
  'FIRE / SMOKE',
  'CARCASS FOUND',
  'VEHICLE TRACKS',
  'ILLEGAL CAMP',
];

type FieldReport = {
  id?: string;
  collectionName?: string;
  resolved?: boolean;
  type: string;
  notes: string;
  dateTime: string;
  latitude: number | null;
  longitude: number | null;
};

export default function FieldMapScreen({ setCurrentScreen }: Props) {
  const [fontsLoaded] = useFonts({
    Aldrich: require('../../assets/fonts/Aldrich-Regular.ttf'),
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [mapFullScreen, setMapFullScreen] = useState(false);
  const [modalMode, setModalMode] = useState<'report' | 'spotted'>('report');
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [spottedSpecies, setSpottedSpecies] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    }

    getLocation();
  }, []);

  useEffect(() => {
    async function loadSavedReports() {
      const fieldReportsSnapshot = await getDocs(collection(db, 'fieldReports'));
      const fieldSightingsSnapshot = await getDocs(collection(db, 'fieldSightings'));

      const savedReports = fieldReportsSnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          collectionName: 'fieldReports',
          resolved: data.resolved || false,
          type: data.type || 'FIELD REPORT',
          notes: data.notes || '',
          dateTime: data.dateTime || 'DATE UNAVAILABLE',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        };
      });

      const savedSightings = fieldSightingsSnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          collectionName: 'fieldSightings',
          resolved: data.resolved || false,
          type: `SPOTTED: ${data.species || 'SPECIES UNKNOWN'}`,
          notes: data.notes || '',
          dateTime: data.dateTime || 'DATE UNAVAILABLE',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        };
      });

      setReports([...savedReports, ...savedSightings]);
    }

    loadSavedReports();
  }, []);

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

  const openReportModal = () => {
    setModalMode('report');
    setSelectedReport('');
    setSpottedSpecies('');
    setReportNotes('');
    setModalVisible(true);
  };

  const openSpottedModal = () => {
    setModalMode('spotted');
    setSelectedReport('');
    setSpottedSpecies('');
    setReportNotes('');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    const dateTime = new Date().toLocaleString();

    const reportType = modalMode === 'report' ? selectedReport : `SPOTTED: ${spottedSpecies}`;

    if (!reportType.trim()) {
      return;
    }

    const newReport = {
      type: reportType,
      notes: reportNotes,
      dateTime,
      latitude: location?.latitude || null,
      longitude: location?.longitude || null,
    };

    setReports((currentReports) => [...currentReports, newReport]);

    setModalVisible(false);
    setMapFullScreen(false);
    setSelectedReport('');
    setSpottedSpecies('');
    setReportNotes('');

    try {
      if (modalMode === 'report') {
        await addDoc(collection(db, 'fieldReports'), {
          type: selectedReport,
          notes: reportNotes,
          dateTime,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          createdAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'fieldSightings'), {
          species: spottedSpecies,
          notes: reportNotes,
          dateTime,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.log('Report saved locally, but Firebase failed:', error);
    }
  };

    const handleDeleteReport = async (report: FieldReport) => {
    try {
      if (report.id && report.collectionName) {
        await deleteDoc(doc(db, report.collectionName, report.id));
      }

      setReports((currentReports) =>
        currentReports.filter((item) => item !== report)
      );
    } catch (error) {
      console.log('Failed to delete report:', error);
    }
  };

  const handleResolveReport = async (report: FieldReport) => {
    try {
      if (report.id && report.collectionName) {
        await updateDoc(
          doc(db, report.collectionName, report.id),
          {
            resolved: true,
          }
        );
      }

      setReports((currentReports) =>
        currentReports.map((item) =>
          item === report
            ? { ...item, resolved: true }
            : item
        )
      );
    } catch (error) {
      console.log('Failed to resolve report:', error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Image
        source={require('../../assets/images/dust.png')}
        style={styles.dust}
        resizeMode="cover"
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>FIELD MAP</Text>
      </View>

      <View style={styles.rangerCard}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.rangerText}>
          GPS ACTIVE{'\n'}
          FIELD REPORT SYSTEM ONLINE
        </Text>
      </View>

      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          style={styles.mapContainer}
          onPress={() => setMapFullScreen(true)}
        >
          {location ? (
            <MapView
              style={styles.mapImage}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation
            >
              {reports.map((report, index) => (
                report.latitude && report.longitude ? (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: report.latitude,
                      longitude: report.longitude,
                    }}
                    title={report.type}
                    description={report.dateTime}
                  />
                ) : null
              ))}
            </MapView>
          ) : (
            <View style={styles.mapLoading}>
              <Text style={styles.mapLoadingText}>LOADING FIELD MAP...</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={openReportModal}
        >
          <Text style={styles.reportButtonText}>REPORT FIELD ISSUE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.spottedButton}
          onPress={openSpottedModal}
        >
          <Text style={styles.reportButtonText}>SPOTTED SPECIES</Text>
        </TouchableOpacity>

        <View style={styles.reportFeed}>
          {reports.map((report, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reportCard}
              onPress={() => {
                if (report.latitude && report.longitude) {
                  setSelectedMapLocation({
                    latitude: report.latitude,
                    longitude: report.longitude,
                  });
                  setMapFullScreen(true);
                }
              }}
            >
              <Text style={styles.reportLabel}>
                {report.resolved ? 'RESOLVED REPORT' : 'FIELD REPORT'}
              </Text>

              <Text style={styles.reportType}>{report.type}</Text>

              <Text style={styles.reportDetails}>
                WHERE: {report.latitude && report.longitude
                  ? `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`
                  : 'LOCATION UNAVAILABLE'}{'\n'}
                DATE/TIME: {report.dateTime}{'\n'}
                REPORTED: {report.type}
                {report.notes ? `\n\nDETAILS: ${report.notes}` : ''}
              </Text>

              <View style={styles.reportActions}>
                {!report.resolved && (
                  <TouchableOpacity
                    style={styles.resolveButton}
                    onPress={() => handleResolveReport(report)}
                  >
                    <Text style={styles.actionButtonText}>RESOLVE</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteReport(report)}
                >
                  <Text style={styles.actionButtonText}>DELETE</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={mapFullScreen} transparent animationType="fade">
        <View style={styles.fullMapContainer}>
          {location ? (
            <MapView
              style={styles.fullMap}
              initialRegion={{
                latitude: selectedMapLocation?.latitude || location.latitude,
                longitude: selectedMapLocation?.longitude || location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              showsUserLocation
            >
              {reports.map((report, index) => (
                report.latitude && report.longitude ? (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: report.latitude,
                      longitude: report.longitude,
                    }}
                    title={report.type}
                    description={report.dateTime}
                  />
                ) : null
              ))}
            </MapView>
          ) : (
            <View style={styles.mapLoading}>
              <Text style={styles.mapLoadingText}>LOADING FIELD MAP...</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.fullMapCloseButton}
            onPress={() => {
              setSelectedMapLocation(null);
              setMapFullScreen(false);
            }}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          <View style={styles.fullMapButtons}>
            <TouchableOpacity
              style={[styles.reportButton, styles.fullMapReportButton]}
              onPress={openReportModal}
            >
              <Text style={styles.reportButtonText}>REPORT FIELD ISSUE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.spottedButton}
              onPress={openSpottedModal}
            >
              <Text style={styles.reportButtonText}>SPOTTED</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

          <Pressable
            style={styles.modalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.modalTitle}>
              {modalMode === 'report' ? 'SELECT REPORT TYPE' : 'SPOTTED SPECIES'}
            </Text>

            <View style={styles.modalInfoBox}>
              <Text style={styles.modalInfoText}>
                {modalMode === 'report'
                  ? 'SELECT THE TYPE OF FIELD INCIDENT YOU WOULD LIKE TO REPORT.'
                  : 'ENTER THE ANIMAL OR PLANT SPECIES YOU SPOTTED.'}
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              {modalMode === 'report' ? (
                reportOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedReport === option && styles.selectedOptionButton,
                    ]}
                    onPress={() => setSelectedReport(option)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <TextInput
                  style={styles.modalInput}
                  placeholder="SPECIES NAME..."
                  placeholderTextColor="#CFC4B2"
                  value={spottedSpecies}
                  onChangeText={setSpottedSpecies}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              )}

              <TextInput
                style={styles.notesInput}
                placeholder="ADD ADDITIONAL INFORMATION..."
                placeholderTextColor="#CFC4B2"
                value={reportNotes}
                onChangeText={setReportNotes}
                multiline
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>SUBMIT REPORT</Text>
              </TouchableOpacity>
            </ScrollView>
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
  },

  rangerText: {
    color: '#CFC4B2',
    fontSize: 10,
    fontFamily: 'Aldrich',
    lineHeight: 15,
  },

  pageScroll: {
    flex: 1,
    width: '100%',
  },

  pageScrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },

  mapContainer: {
    width: '95%',
    height: 550,
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'center',
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

  mapImage: {
    width: '100%',
    height: '100%',
  },

  fullMapContainer: {
    flex: 1,
    backgroundColor: '#191818',
  },

  fullMap: {
    width: '100%',
    height: '100%',
  },

  fullMapCloseButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#191818',
    borderRadius: 21,
  },

  fullMapButtons: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  fullMapReportButton: {
    backgroundColor: '#584509',
  },

  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#191818',
  },

  mapLoadingText: {
    color: '#CFC4B2',
    fontSize: 12,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
  },

  reportButton: {
    width: '95%',
    height: 58,
    borderRadius: 18,
    backgroundColor: '#846b1895',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  spottedButton: {
    width: '95%',
    height: 58,
    borderRadius: 18,
    backgroundColor: '#191818',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
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

  reportButtonText: {
    color: '#CFC4B2',
    fontSize: 12,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
  },

  reportFeed: {
    width: '95%',
    alignSelf: 'center',
  },

  reportCard: {
    backgroundColor: '#191818',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 6,
  },

  reportLabel: {
    color: '#CFC4B2',
    fontSize: 10,
    fontFamily: 'Aldrich',
    marginBottom: 8,
    opacity: 0.8,
  },

  reportType: {
    color: '#8C7B52',
    fontSize: 12,
    fontFamily: 'Aldrich',
    marginBottom: 10,
    letterSpacing: 1,
  },

  reportDetails: {
    color: '#CFC4B2',
    fontSize: 11,
    fontFamily: 'Aldrich',
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#191818',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    width: 320,
    maxHeight: 500,
    borderRadius: 24,
    backgroundColor: 'rgba(103, 97, 39, 0.38)',
    borderWidth: 2,
    borderColor: 'rgba(207, 196, 178, 0.25)',
    padding: 22,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.45,
    shadowRadius: 12,

    elevation: 8,
  },

  modalTitle: {
    color: '#F4F1EA',
    fontSize: 24,
    fontFamily: 'Aldrich',
    letterSpacing: 1.5,
    marginBottom: 18,
    textAlign: 'center',
  },

  modalScroll: {
    paddingBottom: 10,
  },

  optionButton: {
    width: '100%',
    backgroundColor: 'rgba(25, 24, 24, 0.45)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  selectedOptionButton: {
    backgroundColor: '#8033077c',
  },

  optionText: {
    color: '#F4F1EA',
    fontSize: 11,
    fontFamily: 'Aldrich',
    lineHeight: 17,
    letterSpacing: 1,
  },

  modalInput: {
    width: '100%',
    backgroundColor: 'rgba(25, 24, 24, 0.45)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    color: '#F4F1EA',
    fontSize: 11,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
  },

  notesInput: {
    width: '100%',
    minHeight: 90,
    backgroundColor: 'rgba(25, 24, 24, 0.45)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    color: '#F4F1EA',
    fontSize: 11,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
    textAlignVertical: 'top',
  },

  submitButton: {
    width: '100%',
    backgroundColor: '#676127a3',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
  },

  submitButtonText: {
    color: '#F4F1EA',
    fontSize: 11,
    fontFamily: 'Aldrich',
    letterSpacing: 1,
  },

  modalInfoBox: {
    width: '100%',
    backgroundColor: 'rgba(25, 24, 24, 0.45)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  modalInfoText: {
    color: '#CFC4B2',
    fontSize: 10,
    fontFamily: 'Aldrich',
    lineHeight: 17,
    letterSpacing: 1,
  },

    reportActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },

  resolveButton: {
    flex: 1,
    backgroundColor: '#676127',
    borderRadius: 12,
    paddingVertical: 10,
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

  deleteButton: {
    flex: 1,
    backgroundColor: '#191818',
    borderRadius: 12,
    paddingVertical: 10,
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

  actionButtonText: {
    color: '#CFC4B2',
    fontFamily: 'Aldrich',
    fontSize: 11,
    letterSpacing: 1,
  },
});