import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BASE_URL from './config';

// Enhanced color palette for better aesthetics
const colors = {
  // Primary colors
  primary: '#4A6FA5',       // Soft blue (like Aussie eyes)
  primaryLight: '#E8F0FE',  // Very light blue for backgrounds
  primaryDark: '#2C4A7A',   // Darker blue for text/accents
 
  // Secondary colors
  secondary: '#FF7E5F',     // Coral accent (paws/noses)
  secondaryLight: '#FFE8E2', // Light coral for highlights
 
  // Neutrals
  white: '#FFFFFF',
  lightGray: '#F5F7FA',     // Background color
  mediumGray: '#E1E5EB',    // Borders
  darkGray: '#6B7C93',      // Secondary text
  black: '#2D3748',         // Primary text
 
  // Status colors
  success: '#48BB78',       // Green (for available pets)
  warning: '#ED8936',       // Orange (urgent notices)
  danger: '#E53E3E',        // Red (important alerts)
  info: '#4299E1',          // Blue (information)
 
  // Pet-related colors
  furLight: '#F6AD55',      // Light fur tones
  furMedium: '#C05621',     // Medium fur tones
  furDark: '#723F13',       // Dark fur tones
 
  // Special accents
  highlight: '#FEFCBF',     // Yellow highlight
  rewardGold: '#D69E2E',    // Gold for reward badges
};

const PetDetails = ({ route, navigation }) => {
  const { petId } = route.params;

  console.log('[PetDetails] Initializing with petId:', petId);

  const [pet, setPet] = useState(null);
  const [shelter, setShelter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adoptionForm, setAdoptionForm] = useState({
    fullName: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      console.log('[PetDetails] Starting data fetch');
      setLoading(true);
      setError(null);

      try {
        // Fetch pet data
        const petUrl = `${BASE_URL}/pet/${petId}`;
        console.log('[PetDetails] Fetching from:', petUrl);
        
        const petResponse = await fetch(petUrl);
        console.log('[PetDetails] Response status:', petResponse.status);
        
        if (!petResponse.ok) {
          const errorData = await petResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${petResponse.status}`);
        }

        const petData = await petResponse.json();
        console.log('[PetDetails] Received pet data:', petData);
        setPet(petData);

        // Fetch shelter data if available
        if (petData.shelter) {
          const shelterUrl = `${BASE_URL}/shelter/${petData.shelter}`;
          console.log('[PetDetails] Fetching shelter from:', shelterUrl);
          
          const shelterResponse = await fetch(shelterUrl);
          if (shelterResponse.ok) {
            const shelterData = await shelterResponse.json();
            console.log('[PetDetails] Received shelter data:', shelterData);
            setShelter(shelterData);
          } else {
            console.warn('[PetDetails] Shelter fetch failed');
          }
        }
      } catch (err) {
        console.error('[PetDetails] Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      console.log('[PetDetails] Component unmounting');
    };
  }, [petId]);

  const submitAdoption = async () => {
    console.log('[Adoption] Starting submission');
    
    // First check if pet data exists
    if (!pet || !pet.id) {
      console.error('[Adoption] Error: Pet data missing when submitting');
      Alert.alert(
        'Error', 
        'Pet information is not available. Please try again later.',
        [{ text: 'OK', onPress: () => setModalVisible(false) }]
      );
      return;
    }

    // Validate form inputs
    if (!adoptionForm.fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name');
      return;
    }

    if (!adoptionForm.email.trim()) {
      Alert.alert('Required Field', 'Please enter your email address');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(adoptionForm.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('[Adoption] Submitting for pet:', pet.id);
      const response = await fetch(`${BASE_URL}/adoption-request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          petId: pet.id,
          petName: pet.name,
          ...adoptionForm
        }),
      });

      console.log('[Adoption] Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit adoption request');
      }

      Alert.alert('Success', 'Your adoption request has been submitted!', [
        {
          text: 'OK',
          onPress: () => {
            setModalVisible(false);
            setAdoptionForm({ fullName: '', email: '', message: '' });
          }
        }
      ]);
    } catch (err) {
      console.error('[Adoption] Submission error:', err);
      Alert.alert('Error', err.message || 'Failed to submit adoption request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = () => {
    if (pet?.imageUrls?.length > 0) {
      setCurrentImageIndex(prev => (prev + 1) % pet.imageUrls.length);
    }
  };

  const prevImage = () => {
    if (pet?.imageUrls?.length > 0) {
      setCurrentImageIndex(prev =>
        prev === 0 ? pet.imageUrls.length - 1 : prev - 1
      );
    }
  };

  // Status badge component - for showing adoption status
  const StatusBadge = ({ status }) => {
    let badgeColor;
    let textColor = colors.white;
    
    switch(status) {
      case 'Available':
        badgeColor = colors.success;
        break;
      case 'Pending':
        badgeColor = colors.warning;
        break;
      case 'Adopted':
        badgeColor = colors.primary;
        break;
      default:
        badgeColor = colors.darkGray;
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
        <Text style={[styles.statusText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  // Detail item for pet traits
  const DetailItem = ({ label, value, icon }) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIconContainer}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primaryLight} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading pet details...</Text>
      </View>
    );
  }

  // Error state
  if (error || !pet) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primaryLight} />
        <Ionicons name="alert-circle-outline" size={60} color={colors.danger} />
        <Text style={styles.errorText}>{error || 'Failed to load pet details'}</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check for urgent status
  const isUrgent = pet.urgent;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Details</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}  
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Pet Images Carousel */}
        <View style={styles.imageContainer}>
          {pet.imageUrls?.length > 1 && (
            <>
              <TouchableOpacity style={styles.navButtonLeft} onPress={prevImage}>
                <Ionicons name="chevron-back" size={28} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButtonRight} onPress={nextImage}>
                <Ionicons name="chevron-forward" size={28} color={colors.white} />
              </TouchableOpacity>
            </>
          )}
          
          <Image
            source={{ uri: pet.imageUrls?.[currentImageIndex] || 'https://via.placeholder.com/300' }}
            style={styles.petImage}
            onError={(e) => console.log('[PetDetails] Image error:', e.nativeEvent.error)}
          />
          
          {pet.imageUrls?.length > 1 && (
            <View style={styles.imageIndicatorContainer}>
              {pet.imageUrls.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.imageIndicatorDot,
                    currentImageIndex === index && styles.imageIndicatorDotActive
                  ]} 
                />
              ))}
            </View>
          )}
          
          {isUrgent && (
            <View style={styles.urgentBadge}>
              <Ionicons name="alert-circle" size={18} color={colors.white} />
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          )}
        </View>
        
        {/* Pet Info Card */}
        <View style={styles.petInfoCard}>
          <View style={styles.petNameRow}>
            <View>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.breed}>{pet.breed || 'Mixed breed'}</Text>
            </View>
            <StatusBadge status={pet.adoptionStatus || (pet.availableForAdoption ? 'Available' : 'Unavailable')} />
          </View>

          {/* Pet Attributes */}
          <View style={styles.detailsGrid}>
            <DetailItem label="Type" value={pet.type} icon="paw" />
            <DetailItem label="Age" value={`${pet.age || '?'} years`} icon="calendar" />
            <DetailItem label="Gender" value={pet.gender} icon="male-female" />
            <DetailItem label="Size" value={pet.size} icon="resize" />
          </View>

          {/* Medical Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medkit" size={22} color={colors.primary} />
              <Text style={styles.sectionTitle}>Medical</Text>
            </View>
            <View style={styles.medicalTags}>
              <MedicalTag 
                label="Vaccinated" 
                status={pet.vaccinationStatus !== 'Not Vaccinated'} 
              />
              <MedicalTag 
                label="Microchipped" 
                status={pet.microchip !== 'Not Microchipped'} 
              />
              <MedicalTag 
                label={pet.gender === 'Male' ? 'Neutered' : 'Spayed'} 
                status={pet.spayedNeutered} 
              />
            </View>
            {pet.medicalInfo && (
              <Text style={styles.medicalInfo}>{pet.medicalInfo}</Text>
            )}
          </View>

          {/* Temperament */}
          {pet.temperament && pet.temperament.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="heart" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Temperament</Text>
              </View>
              <View style={styles.temperamentContainer}>
                {pet.temperament.map((trait, index) => (
                  <View key={index} style={styles.temperamentTag}>
                    <Text style={styles.temperamentText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* About Pet */}
          {pet.description && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>About</Text>
              </View>
              <Text style={styles.description}>{pet.description}</Text>
            </View>
          )}

          {/* Background/History */}
          {pet.history && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="book" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Background</Text>
              </View>
              <Text style={styles.description}>{pet.history}</Text>
            </View>
          )}

          {/* Behavior */}
          {pet.behavior && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="paw" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Behavior</Text>
              </View>
              <Text style={styles.description}>{pet.behavior}</Text>
              {pet.trainingLevel && pet.trainingLevel !== 'Untrained' && (
                <View style={styles.trainingLevelContainer}>
                  <Text style={styles.trainingLevelLabel}>Training Level:</Text>
                  <Text style={styles.trainingLevel}>{pet.trainingLevel}</Text>
                </View>
              )}
            </View>
          )}

          {/* Shelter Information */}
          {shelter && (
            <View style={[styles.section, styles.shelterSection]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="home" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Shelter Information</Text>
              </View>
              
              <View style={styles.shelterCard}>
                <Text style={styles.shelterName}>{shelter.name}</Text>

                {shelter.address && (
                  <TouchableOpacity 
                    style={styles.shelterInfoRow}
                    onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(shelter.address)}`)}
                  >
                    <Ionicons name="location" size={18} color={colors.secondary} />
                    <Text style={styles.shelterInfoText}>{shelter.address}</Text>
                  </TouchableOpacity>
                )}
                
                {shelter.phone && (
                  <TouchableOpacity 
                    style={styles.shelterInfoRow}
                    onPress={() => Linking.openURL(`tel:${shelter.phone}`)}
                  >
                    <Ionicons name="call" size={18} color={colors.secondary} />
                    <Text style={styles.shelterInfoText}>{shelter.phone}</Text>
                  </TouchableOpacity>
                )}
                
                {shelter.email && (
                  <TouchableOpacity 
                    style={styles.shelterInfoRow}
                    onPress={() => Linking.openURL(`mailto:${shelter.email}`)}
                  >
                    <Ionicons name="mail" size={18} color={colors.secondary} />
                    <Text style={styles.shelterInfoText}>{shelter.email}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Adopt Button - Only show if pet is available */}
          {pet && (pet.adoptionStatus === 'Available' || pet.availableForAdoption) && (
            <View style={styles.adoptButtonContainer}>
              <TouchableOpacity 
                style={styles.adoptButton} 
                onPress={() => {
                  console.log('[PetDetails] Opening adoption modal');
                  setModalVisible(true);
                }}
              >
                <Ionicons name="heart" size={20} color={colors.white} style={styles.adoptButtonIcon} />
                <Text style={styles.adoptButtonText}>
                  Adopt {pet.name}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Adoption Modal */}
      <Modal 
        transparent 
        visible={modalVisible} 
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {!pet ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Adopt {pet.name}</Text>
                  <TouchableOpacity 
                    style={styles.modalCloseButton} 
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color={colors.darkGray} />
                  </TouchableOpacity>
                </View>

                <View style={styles.petSummary}>
                  <Image 
                    source={{ uri: pet.imageUrls?.[0] || 'https://via.placeholder.com/100' }}
                    style={styles.petThumbnail}
                  />
                  <View style={styles.petSummaryInfo}>
                    <Text style={styles.petSummaryName}>{pet.name}</Text>
                    <Text style={styles.petSummaryDetails}>{pet.breed} • {pet.age} years</Text>
                  </View>
                </View>
                
                <View style={styles.formContainer}>
                  <Text style={styles.formLabel}>Your Information</Text>
                  
                  <TextInput
                    placeholder="Full Name *"
                    value={adoptionForm.fullName}
                    onChangeText={text => setAdoptionForm({ ...adoptionForm, fullName: text })}
                    style={styles.input}
                    autoCapitalize="words"
                    placeholderTextColor={colors.darkGray}
                  />
                  
                  <TextInput
                    placeholder="Email *"
                    value={adoptionForm.email}
                    onChangeText={text => setAdoptionForm({ ...adoptionForm, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor={colors.darkGray}
                  />
                  
                  <Text style={styles.formLabel}>Why do you want to adopt {pet.name}?</Text>
                  <TextInput
                    placeholder="Share a bit about your home environment, experience with pets, etc."
                    value={adoptionForm.message}
                    onChangeText={text => setAdoptionForm({ ...adoptionForm, message: text })}
                    multiline
                    style={styles.messageInput}
                    placeholderTextColor={colors.darkGray}
                    textAlignVertical="top"
                  />

                  <TouchableOpacity 
                    style={[
                      styles.submitButton,
                      isSubmitting && styles.submitButtonDisabled
                    ]} 
                    onPress={submitAdoption} 
                    disabled={isSubmitting}
                  >
                    <Text style={styles.submitButtonText}>
                      {isSubmitting ? 'Submitting...' : 'Submit Adoption Request'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Medical tag component
const MedicalTag = ({ label, status }) => (
  <View style={[
    styles.medicalTag, 
    { backgroundColor: status ? colors.primary : colors.lightGray }
  ]}>
    <Ionicons 
      name={status ? "checkmark-circle" : "close-circle"} 
      size={16} 
      color={status ? colors.white : colors.darkGray} 
    />
    <Text style={[
      styles.medicalTagText, 
      { color: status ? colors.white : colors.darkGray }
    ]}>
      {label}
    </Text>
  </View>
);

const screen = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.primaryLight,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    marginTop: 15,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  goBackButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goBackButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    backgroundColor: colors.mediumGray,
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  navButtonLeft: {
    position: 'absolute',
    left: 15,
    top: '50%',
    marginTop: -25,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 25,
    padding: 12,
    zIndex: 1,
  },
  navButtonRight: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -25,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 25,
    padding: 12,
    zIndex: 1,
  },
  imageIndicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 1,
  },
  imageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 4,
  },
  imageIndicatorDotActive: {
    backgroundColor: colors.white,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  urgentBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: colors.warning,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  urgentText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  petInfoCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    padding: 25,
  },
  petNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  breed: {
    fontSize: 16,
    color: colors.darkGray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
    marginTop: 10,
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  detailIconContainer: {
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginLeft: 8,
  },
  medicalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  medicalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  medicalTagText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  medicalInfo: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.darkGray,
    marginTop: 5,
  },
  temperamentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  temperamentTag: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  temperamentText: {
    color: colors.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.darkGray,
  },
 trainingLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  trainingLevelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 8,
  },
  trainingLevel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  shelterSection: {
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    paddingTop: 25,
  },
  shelterCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 15,
    padding: 20,
  },
  shelterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  shelterInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shelterInfoText: {
    marginLeft: 10,
    fontSize: 15,
    color: colors.darkGray,
  },
  adoptButtonContainer: {
    marginTop: 10,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  adoptButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adoptButtonIcon: {
    marginRight: 8,
  },
  adoptButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: screen.height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.black,
  },
  modalCloseButton: {
    padding: 5,
  },
  petSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    paddingBottom: 15,
    marginBottom: 15,
  },
  petThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  petSummaryInfo: {
    marginLeft: 15,
    flex: 1,
  },
  petSummaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  petSummaryDetails: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 3,
  },
  formContainer: {
    maxHeight: screen.height * 0.6,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginTop: 5,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    color: colors.black,
  },
  messageInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    height: 120,
    color: colors.black,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: colors.mediumGray,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PetDetails;