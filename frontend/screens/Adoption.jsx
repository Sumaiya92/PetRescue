import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BASE_URL from './config';


const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
export const colors = {
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

const AdoptionScreen = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [viewFavorites, setViewFavorites] = useState(false);
  const [adoptionForm, setAdoptionForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [filters, setFilters] = useState({
    type: '',
    breed: '',
    age: '',
    location: '',
    specialNeeds: false
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [matchedPets, setMatchedPets] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const favoritePets = pets.filter(pet => favorites.has(pet._id));
  
  const navigation = useNavigation();

  useEffect(() => {
    fetchPets();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [filters]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/pet/all?`;
      const params = [];
      
      if (filters.type) params.push(`type=${encodeURIComponent(filters.type)}`);
      if (filters.breed) params.push(`breed=${encodeURIComponent(filters.breed)}`);
      if (filters.age) params.push(`age=${encodeURIComponent(filters.age)}`);
      if (filters.location) params.push(`location=${encodeURIComponent(filters.location)}`);
      if (filters.specialNeeds) params.push(`specialNeeds=true`);
      
      const response = await fetch(url + params.join('&'));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
      Alert.alert('Error', 'Could not fetch pets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (petId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(petId)) {
      newFavorites.delete(petId);
    } else {
      newFavorites.add(petId);
    }
    setFavorites(newFavorites);
  };

  const handleAdoptPress = (pet) => {
    setSelectedPet(pet);
    setModalVisible(true);
  };

  const submitAdoptionForm = async () => {
    if (!selectedPet?._id) {
      Alert.alert('Error', 'No pet selected');
      return;
    }

    if (!adoptionForm.email) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        petId: selectedPet._id,
        email: adoptionForm.email,
        name: adoptionForm.fullName || '',
        phone: adoptionForm.phone || '',
        message: adoptionForm.message || ''
      };

      const response = await fetch(`${BASE_URL}/pet/adoption-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Server returned invalid response');
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Request failed');
      }

      Alert.alert(
        'Success', 
        'Adoption request submitted! Check your email for confirmation.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setModalVisible(false);
              setAdoptionForm({ fullName: '', email: '', phone: '', message: '' });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Adoption request error:', error);
      Alert.alert(
        'Error',
        error.message.includes('<html') 
          ? 'Server error occurred. Please try again later.'
          : error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuizComplete = (results) => {
    setQuizModalVisible(false);
    const matched = pets.filter(pet => 
      pet.type === results.preferredType && 
      pet.age === results.preferredAge
    );
    setMatchedPets(matched);
    setShowMatches(true);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      breed: '',
      age: '',
      location: '',
      specialNeeds: false
    });
    setFilterVisible(false);
  };

  const renderPetCard = ({ item }) => {
    const matchPercentage = matchedPets.includes(item) ? '95%' : null;
    const isFavorite = favorites.has(item._id);
    
    return (
      <Animated.View style={[styles.petCard, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('PetDetails', { petId: item._id })}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            {matchPercentage && (
              <View style={styles.matchBadge}>
                <Text style={styles.matchBadgeText}>{matchPercentage} Match</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item._id)}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorite ? colors.rewardGold : colors.white} 
              />
            </TouchableOpacity>
          </View>

          <Image 
            source={{ uri: item.imageUrls?.[0] || 'https://via.placeholder.com/300' }} 
            style={styles.petImage}
            resizeMode="cover"
          />

          <View style={styles.petInfo}>
            <Text style={styles.petName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.petBreed} numberOfLines={1}>{item.breed || 'Mixed breed'}</Text>
            
            <View style={styles.personalityTags}>
              {['Friendly', 'Playful', 'Gentle'].slice(0, 2).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.quickInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="paw" size={14} color={colors.darkGray} />
                <Text style={styles.infoText}>{item.type}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={14} color={colors.darkGray} />
                <Text style={styles.infoText}>{item.age}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.adoptButton}
          onPress={() => handleAdoptPress(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.adoptButtonText}>Adopt Me</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Find Your Perfect Companion</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              onPress={() => setViewFavorites(!viewFavorites)}
              activeOpacity={0.8}
              style={styles.iconButton}
            >
              <Ionicons 
                name={viewFavorites ? "heart" : "heart-outline"} 
                size={24} 
                color={viewFavorites ? colors.rewardGold : colors.black} 
              />
              {favoritePets.length > 0 && !viewFavorites && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{favoritePets.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('AddPet')}
              activeOpacity={0.8}
              style={styles.iconButton}
            >
              <Ionicons name="add" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterVisible(!filterVisible)}
            activeOpacity={0.8}
          >
            <Ionicons name="filter" size={18} color={colors.black} />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quizButton}
            onPress={() => navigation.navigate('PetFind')}
            activeOpacity={0.8}
          >
            <Ionicons name="help-circle" size={18} color={colors.white} />
            <Text style={styles.quizButtonText}>Match Quiz</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {filterVisible && (
        <Animated.View style={[styles.filterPanel, { opacity: fadeAnim }]}>
          <Text style={styles.filterTitle}>Filter Options</Text>
          
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Species</Text>
            <View style={styles.filterOptions}>
              {['Dog', 'Cat', 'Bird', 'Rabbit'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    filters.type === type && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters({...filters, type})}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.type === type && styles.filterOptionTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setFilterVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {showMatches && matchedPets.length > 0 && (
            <View style={styles.matchesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Best Matches</Text>
                <TouchableOpacity 
                  onPress={() => setShowMatches(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={matchedPets}
                renderItem={renderPetCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.matchListContent}
                keyExtractor={item => item._id}
              />
            </View>
          )}

          <FlatList
            data={viewFavorites ? favoritePets : pets}
            renderItem={renderPetCard}
            keyExtractor={item => item._id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>
                {viewFavorites ? 'Your Favorite Pets' : 
                 showMatches ? 'All Available Pets' : 'Available for Adoption'}
              </Text>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name={viewFavorites ? "heart-dislike" : "paw"} 
                  size={48} 
                  color={colors.mediumGray} 
                />
                <Text style={styles.emptyText}>
                  {viewFavorites ? 'You have no favorite pets yet' : 'No pets found matching your criteria'}
                </Text>
                {viewFavorites ? (
                  <TouchableOpacity 
                    style={styles.resetButton}
                    onPress={() => setViewFavorites(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resetButtonText}>Browse All Pets</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.resetButton}
                    onPress={clearFilters}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resetButtonText}>Reset Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView 
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.darkGray} />
            </TouchableOpacity>
            
            <Image 
              source={{ uri: selectedPet?.imageUrls?.[0] || 'https://via.placeholder.com/300' }} 
              style={styles.modalPetImage}
              resizeMode="cover"
            />
            
            <Text style={styles.modalTitle}>Adopt {selectedPet?.name}</Text>
            <Text style={styles.modalSubtitle}>Complete the form below to begin the adoption process</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.formInput}
                value={adoptionForm.fullName}
                onChangeText={text => setAdoptionForm({...adoptionForm, fullName: text})}
                placeholder="Your full name"
                placeholderTextColor={colors.darkGray}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                value={adoptionForm.email}
                onChangeText={text => setAdoptionForm({...adoptionForm, email: text})}
                placeholder="Your email address"
                placeholderTextColor={colors.darkGray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.formInput}
                value={adoptionForm.phone}
                onChangeText={text => setAdoptionForm({...adoptionForm, phone: text})}
                placeholder="Your phone number"
                placeholderTextColor={colors.darkGray}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Message (Optional)</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                value={adoptionForm.message}
                onChangeText={text => setAdoptionForm({...adoptionForm, message: text})}
                placeholder="Tell us about your home and why you'd be a great pet parent"
                placeholderTextColor={colors.darkGray}
                multiline
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={submitAdoptionForm}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Submit Adoption Request</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: colors.rewardGold,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  filterButtonText: {
    marginLeft: 6,
    color: colors.black,
    fontWeight: '500',
    fontSize: 14,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  quizButtonText: {
    marginLeft: 6,
    color: colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  petCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  matchBadge: {
    backgroundColor: colors.rewardGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  matchBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  favoriteButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 6,
    borderRadius: 20,
  },
  petImage: {
    width: '100%',
    height: CARD_WIDTH * 0.9,
  },
  petInfo: {
    padding: 16,
    paddingBottom: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 13,
    color: colors.darkGray,
    marginBottom: 8,
  },
  personalityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  tagText: {
    fontSize: 11,
    color: colors.black,
  },
  quickInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.darkGray,
  },
  adoptButton: {
    backgroundColor: colors.primary,
    padding: 12,
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  adoptButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  filterPanel: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    color: colors.black,
    marginBottom: 8,
    fontWeight: '500',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  filterOptionText: {
    fontSize: 13,
    color: colors.darkGray,
  },
  filterOptionTextSelected: {
    color: colors.white,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  clearButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  clearButtonText: {
    color: colors.danger,
    fontWeight: '500',
  },
  applyButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    flex: 1,
  },
  applyButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalContent: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginTop: 8,
    marginRight: -8,
  },
  modalPetImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginVertical: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: colors.black,
    marginBottom: 8,
    fontWeight: '500',
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    padding: 14,
    backgroundColor: colors.white,
    fontSize: 15,
    color: colors.black,
  },
  formTextarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: colors.darkGray,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resetButtonText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  matchesSection: {
    marginTop: 16,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  seeAllText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  matchListContent: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  footerContainer: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    color: colors.darkGray,
    fontSize: 14,
  },
  quizModalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  quizModalContent: {
    padding: 24,
  },
  quizTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  quizDescription: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 24,
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 16,
  },
  optionContainer: {
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.black,
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  nextButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mediumGray,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 16,
  }
});

export default AdoptionScreen;