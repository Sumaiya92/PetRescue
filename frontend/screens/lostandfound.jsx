import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, FontAwesome5, Ionicons, AntDesign, Feather } from '@expo/vector-icons';
import BASE_URL from './config';

// Screen dimensions for responsive layout
const { width } = Dimensions.get('window');
const cardWidth = width * 0.44;

// App color palette
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


const LostFoundPetsScreen = ({ navigation }) => {
  // State management
  const [activeTab, setActiveTab] = useState('lost');
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [fabAnimation] = useState(new Animated.Value(1));
  const [scrollY] = useState(new Animated.Value(0));
  
  // Filter states
  const [filters, setFilters] = useState({
    petType: 'all',
    location: '',
    searchQuery: '',
    sortBy: 'recent',
  });
   const navigateToLostPetDetails = (pet) => {
    // Only navigate if pet and pet._id exist
    if (pet && pet._id) {

      navigation.navigate("LostPetDetails", { petId: pet._id });
    } else {
      console.warn("Cannot navigate to pet details: Missing pet ID");
    }
  };

  // Animation references
  const filterButtonScale = useRef(new Animated.Value(1)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [160, 60],
    extrapolate: 'clamp',
  });

  const initialFormState = {
    name: '',
    type: 'Dog',
    breed: '',
    location: '',
    status: 'lost',
    findercontactInfo: '',
    OwnercontactInfo: '',
    description: '',
    isFound: false,
    isClaimed: false,
    image: '',
    date: new Date().toISOString(),
  };

  const [petForm, setPetForm] = useState(initialFormState);

  // Animation for FAB button
  const animateFab = () => {
    Animated.sequence([
      Animated.timing(fabAnimation, {
        toValue: 0.8,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(fabAnimation, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true
      })
    ]).start();
  };

  // Animation for filter button
  const animateFilterButton = () => {
    Animated.sequence([
      Animated.timing(filterButtonScale, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(filterButtonScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true
      })
    ]).start();
  };

  // Fetch pets data from API
  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/lostfound`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPets(data);
      applyFilters(data, activeTab, filters);
    } catch (error) {
      console.error('Error fetching pets:', error);
      Alert.alert('Error', 'Failed to fetch pets data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Apply filters to pets data
 const applyFilters = (data, tab, currentFilters) => {
    let filtered = data.filter(pet => pet.status === tab);
    
    if (currentFilters.petType !== 'all') {
      filtered = filtered.filter(pet => pet.type === currentFilters.petType);
    }
    
    if (currentFilters.location) {
      filtered = filtered.filter(pet => 
        pet.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      );
    }
    
    if (currentFilters.searchQuery) {
      filtered = filtered.filter(pet => 
        pet.name.toLowerCase().includes(currentFilters.searchQuery.toLowerCase()) ||
        (pet.breed && pet.breed.toLowerCase().includes(currentFilters.searchQuery.toLowerCase())) ||
        pet.description.toLowerCase().includes(currentFilters.searchQuery.toLowerCase())
      );
    }
    
    switch (currentFilters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    
    setFilteredPets(filtered);
  };

  // Initial fetch and filter updates
  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    applyFilters(pets, activeTab, filters);
  }, [activeTab, filters, pets]);

  // Image picker function
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'We need access to your photos to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Form submission handler
  const handleSubmit = async () => {
    if (!petForm.name || !petForm.location || !petForm.description) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    
    if (imageUri) {
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      });
    }

    Object.keys(petForm).forEach(key => {
      formData.append(key, petForm[key]);
    });

    try {
      setModalVisible(false);
      setLoading(true);
      
      const response = await fetch(`${BASE_URL}/lostfound`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to submit pet report');
      }

      Alert.alert('Success', 'Pet report submitted successfully');
      resetForm();
      fetchPets();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit pet report');
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete pet function
  const deletePet = async (id) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this pet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/lostfound/${id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              throw new Error('Failed to delete pet');
            }

            fetchPets();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete pet');
            console.error('Deletion error:', error);
          } finally {
            setLoading(false);
          }
        }}
      ]
    );
  };

  // Update pet status function
  const updatePetStatus = async (id, updatedStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/lostfound/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const petData = await response.json();
      
      const updatedPet = {
        ...petData,
        ...updatedStatus
      };
      
      const updateResponse = await fetch(`${BASE_URL}/lostfound/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPet),
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Update failed with status: ${updateResponse.status}`);
      }
      
      Alert.alert('Success', 'Pet status updated successfully');
      fetchPets();
    } catch (error) {
      console.error('Failed to update pet status:', error);
      Alert.alert('Error', 'Failed to update pet status');
    } finally {
      setLoading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setPetForm(initialFormState);
    setImageUri(null);
    setModalVisible(false);
  };

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  // Render pet card
   const renderPetCard = ({ item, index }) => {
    const isEven = index % 2 === 0;
    const statusColor = item.status === 'lost' ? colors.danger : colors.success;
    
    return (
      <TouchableOpacity 
        style={[
          styles.card, 
          { 
            marginLeft: isEven ? 16 : 8, 
            marginRight: isEven ? 8 : 16,
            height: 220 // Fixed height for all cards
          }
        ]}
        activeOpacity={0.8}
        onPress={() => navigateToLostPetDetails(item)}
        
       
      >
        <View style={styles.cardImageContainer}>
          {item.image ? (
            <Image
              source={{ 
                uri: item.image.startsWith('http') || item.image.startsWith('https')
                  ? item.image 
                  : `${BASE_URL}/${item.image.replace(/\\/g, '/')}`
              }}
              style={styles.cardImage}
              resizeMode="cover"
              onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            />
          ) : (
            <View style={[styles.cardImage, styles.imagePlaceholder]}>
              <FontAwesome5 name="paw" size={32} color={colors.primaryLight} />
            </View>
          )}
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {item.status === 'lost' ? 'LOST' : 'FOUND'}
              {(item.isFound || item.isClaimed) ? ' ✓' : ''}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          
          <View style={styles.cardInfo}>
            <View style={styles.infoRow}>
             
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="location-sharp" size={12} color={colors.darkGray} />
              <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
            </View>
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: statusColor }]}
              onPress={() => {
                if (item.status === 'lost') {
                  updatePetStatus(item._id, { isFound: !item.isFound });
                } else {
                  updatePetStatus(item._id, { isClaimed: !item.isClaimed });
                }
              }}
            >
              <Text style={styles.actionButtonText}>
                {item.status === 'lost' 
                  ? (item.isFound ? 'Found ✓' : 'Mark Found')
                  : (item.isClaimed ? 'Claimed ✓' : 'Mark Claimed')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && pets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading pets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Simplified Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lost & Found Pets</Text>
        <Text style={styles.headerSubtitle}>Help reunite pets with their families</Text>
        
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={18} color={colors.darkGray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search pets..."
              placeholderTextColor={colors.darkGray}
              value={filters.searchQuery}
              onChangeText={(text) => setFilters({...filters, searchQuery: text})}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Feather name="sliders" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs Section */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lost' && styles.activeTab]}
          onPress={() => setActiveTab('lost')}
        >
          <FontAwesome5 
            name="search" 
            size={14} 
            color={activeTab === 'lost' ? colors.white : colors.darkGray} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === 'lost' && styles.activeTabText]}>
            Lost Pets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'found' && styles.activeTab]}
          onPress={() => setActiveTab('found')}
        >
          <FontAwesome5 
            name="paw" 
            size={14} 
            color={activeTab === 'found' ? colors.white : colors.darkGray} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === 'found' && styles.activeTabText]}>
            Found Pets
          </Text>
        </TouchableOpacity>
      </View>

      {/* Smart Pet Finder Banner */}
      <TouchableOpacity 
        style={styles.smartFinderBanner}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PetSearch')}
      >
        <View style={styles.smartFinderIcon}>
          <FontAwesome5 name="search-location" size={20} color={colors.white} />
        </View>
        <View style={styles.smartFinderContent}>
          <Text style={styles.smartFinderTitle}>Smart Pet Finder</Text>
          <Text style={styles.smartFinderSubtitle}>Match your pet using our AI tool</Text>
        </View>
        <AntDesign name="arrowright" size={20} color={colors.white} />
      </TouchableOpacity>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredPets.length} {activeTab} pet{filteredPets.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Pets Grid */}
      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item._id}
        renderItem={renderPetCard}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name={activeTab === 'lost' ? 'search' : 'paw'} size={48} color={colors.mediumGray} />
            <Text style={styles.emptyTitle}>No {activeTab} pets found</Text>
            <Text style={styles.emptyText}>
              Be the first to report a {activeTab} pet in your area
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => {
                setModalVisible(true);
                setPetForm({...initialFormState, status: activeTab});
              }}
            >
              <Text style={styles.emptyButtonText}>Report {activeTab === 'lost' ? 'a Lost' : 'Found'} Pet</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button */}
      <Animated.View 
        style={[
          styles.fab,
          { transform: [{ scale: fabAnimation }] }
        ]}
      >
        <TouchableOpacity 
          onPress={() => {
            setModalVisible(true);
            setPetForm({...initialFormState, status: activeTab});
          }}
          activeOpacity={0.7}
        >
          <AntDesign name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add Pet Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Report {activeTab === 'lost' ? 'a Lost' : 'Found'} Pet
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={resetForm}
              >
                <AntDesign name="close" size={20} color={colors.darkGray} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Basic Information</Text>
                
                <TextInput
                  placeholder="Pet Name *"
                  placeholderTextColor={colors.textLight}
                  value={petForm.name}
                  onChangeText={(text) => setPetForm({ ...petForm, name: text })}
                  style={styles.input}
                />
                
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      petForm.type === 'Dog' && styles.typeOptionActive
                    ]}
                    onPress={() => setPetForm({ ...petForm, type: 'Dog' })}
                  >
                    <FontAwesome5 
                      name="dog" 
                      size={16} 
                      color={petForm.type === 'Dog' ? colors.white : colors.textMedium} 
                    />
                    <Text style={[
                      styles.typeText,
                      petForm.type === 'Dog' && styles.typeTextActive
                    ]}>Dog</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      petForm.type === 'Cat' && styles.typeOptionActive
                    ]}
                    onPress={() => setPetForm({ ...petForm, type: 'Cat' })}
                  >
                    <FontAwesome5 
                      name="cat" 
                      size={16} 
                      color={petForm.type === 'Cat' ? colors.white : colors.textMedium} 
                    />
                    <Text style={[
                      styles.typeText,
                      petForm.type === 'Cat' && styles.typeTextActive
                    ]}>Cat</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      petForm.type === 'Other' && styles.typeOptionActive
                    ]}
                    onPress={() => setPetForm({ ...petForm, type: 'Other' })}
                  >
                    <FontAwesome5 
                      name="paw" 
                      size={16} 
                      color={petForm.type === 'Other' ? colors.white : colors.textMedium} 
                    />
                    <Text style={[
                      styles.typeText,
                      petForm.type === 'Other' && styles.typeTextActive
                    ]}>Other</Text>
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  placeholder="Breed (optional)"
                  placeholderTextColor={colors.textLight}
                  value={petForm.breed}
                  onChangeText={(text) => setPetForm({ ...petForm, breed: text })}
                  style={styles.input}
                />
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Location & Contact</Text>
                
                <TextInput
                  placeholder="Location where pet was lost/found *"
                  placeholderTextColor={colors.textLight}
                  value={petForm.location}
                  onChangeText={(text) => setPetForm({ ...petForm, location: text })}
                  style={styles.input}
                />
                
                <TextInput
                  placeholder={activeTab === 'lost' ? "Owner's Contact Info *" : "Finder's Contact Info *"}
                  placeholderTextColor={colors.textLight}
                  value={activeTab === 'lost' ? petForm.OwnercontactInfo : petForm.findercontactInfo}
                  onChangeText={(text) => 
                    setPetForm(
                      activeTab === 'lost' 
                        ? { ...petForm, OwnercontactInfo: text }
                        : { ...petForm, findercontactInfo: text }
                    )
                  }
                  style={styles.input}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Details</Text>
                
                <TextInput
                  placeholder="Description (color, distinctive features, etc.) *"
                  placeholderTextColor={colors.textLight}
                  value={petForm.description}
                  onChangeText={(text) => setPetForm({ ...petForm, description: text })}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                />
                
                <TouchableOpacity 
                  style={styles.imageUploadButton} 
                  onPress={pickImage}
                >
                  <FontAwesome5 name="camera" size={16} color={colors.primary} />
                  <Text style={styles.imageUploadText}>
                    {imageUri ? 'Change Image' : 'Add Photo'}
                  </Text>
                </TouchableOpacity>

                {imageUri && (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => setImageUri(null)}
                    >
                      <AntDesign name="close" size={16} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              
              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={[styles.formButton, styles.cancelButton]}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.formButton, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        visible={filterModalVisible}
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.filterModalContainer]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Pets</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <AntDesign name="close" size={20} color={colors.darkGray} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              contentContainerStyle={styles.filterModalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Pet Type</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.petType === 'all' && styles.filterChipActive
                    ]}
                    onPress={() => setFilters({...filters, petType: 'all'})}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.petType === 'all' && styles.filterChipTextActive
                    ]}>All</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.petType === 'Dog' && styles.filterChipActive
                    ]}
                    onPress={() => setFilters({...filters, petType: 'Dog'})}
                  >
                    <FontAwesome5 
                      name="dog" 
                      size={12} 
                      color={filters.petType === 'Dog' ? colors.white : colors.textMedium} 
                      style={styles.filterChipIcon}
                    />
                    <Text style={[
                      styles.filterChipText,
                      filters.petType === 'Dog' && styles.filterChipTextActive
                    ]}>Dogs</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.petType === 'Cat' && styles.filterChipActive
                    ]}
                    onPress={() => setFilters({...filters, petType: 'Cat'})}
                  >
                    <FontAwesome5 
                      name="cat" 
                      size={12} 
                      color={filters.petType === 'Cat' ? colors.white : colors.textMedium} 
                      style={styles.filterChipIcon}
                    />
                    <Text style={[
                      styles.filterChipText,
                      filters.petType === 'Cat' && styles.filterChipTextActive
                    ]}>Cats</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.petType === 'Other' && styles.filterChipActive
                    ]}
                    onPress={() => setFilters({...filters, petType: 'Other'})}
                  >
                    <FontAwesome5 
                      name="paw" 
                      size={12} 
                      color={filters.petType === 'Other' ? colors.white : colors.textMedium} 
                      style={styles.filterChipIcon}
                    />
                    <Text style={[
                      styles.filterChipText,
                      filters.petType === 'Other' && styles.filterChipTextActive
                    ]}>Other</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Location</Text>
                <TextInput
                  placeholder="Filter by location"
                  placeholderTextColor={colors.textLight}
                  value={filters.location}
                  onChangeText={(text) => setFilters({...filters, location: text})}
                  style={styles.locationInput}
                />
              </View>
              
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                
                <TouchableOpacity
                  style={styles.sortOption}
                  onPress={() => setFilters({...filters, sortBy: 'recent'})}
                >
                  <View style={{ width: 24, alignItems: 'center' }}>
                    {filters.sortBy === 'recent' ? (
                      <Ionicons name="radio-button-on" size={18} color={colors.primary} />
                    ) : (
                      <Ionicons name="radio-button-off" size={18} color={colors.textMedium} />
                    )}
                  </View>
                  <Text style={styles.sortOptionText}>Most Recent</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.sortOption}
                  onPress={() => setFilters({...filters, sortBy: 'name'})}
                >
                  <View style={{ width: 24, alignItems: 'center' }}>
                    {filters.sortBy === 'name' ? (
                      <Ionicons name="radio-button-on" size={18} color={colors.primary} />
                    ) : (
                      <Ionicons name="radio-button-off" size={18} color={colors.textMedium} />
                    )}
                  </View>
                  <Text style={styles.sortOptionText}>Pet Name (A-Z)</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterActions}>
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => {
                    setFilters({
                      petType: 'all',
                      location: '',
                      searchQuery: '',
                      sortBy: 'recent',
                    });
                  }}
                >
                  <Text style={styles.clearButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => setFilterModalVisible(false)}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>
  );
}
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.lightGray,
    },
    header: {
      backgroundColor: colors.primary,
 padding: 16,
    paddingTop: 10,
    paddingBottom: 20,
    },
 
    headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 8,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
  },
   filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabIcon: {
    marginRight: 6,
  },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.darkGray,
    },
    activeTabText: {
      color: colors.white,
    },
   gridContainer: {
    paddingHorizontal: 8,
    paddingBottom: 100,
  },
    card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    width: cardWidth,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
   imagePlaceholder: {
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
    cardContent: {
      padding: 12,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textDark,
      marginBottom: 4,
    },
    cardInfo: {
      flexDirection: 'row',
        //this is where the the mark found btn 
      marginBottom: 8,
    },
     infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 6,
    flexShrink: 1,
  },
  cardActions: {
    flexDirection: 'row',
  },
   actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    top: 5,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
   smartFinderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
  },
  smartFinderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  smartFinderContent: {
    flex: 1,
  },
  smartFinderTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  smartFinderSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.darkGray,
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.darkGray,
  },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxHeight: '90%',
      backgroundColor: colors.white,
      borderRadius: 20,
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textDark,
    },
    closeButton: {
      padding: 4,
    },
    modalContent: {
      padding: 16,
    },
    formSection: {
      marginBottom: 20,
    },
    formSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textDark,
      marginBottom: 12,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      fontSize: 14,
      color: colors.textDark,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    typeSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    typeOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      paddingVertical: 12,
      marginHorizontal: 4,
      borderRadius: 12,
    },
    typeOptionActive: {
      backgroundColor: colors.primary,
    },
    typeText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textMedium,
      marginLeft: 6,
    },
    typeTextActive: {
      color: colors.white,
    },
    imageUploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryLight,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    imageUploadText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    previewContainer: {
      position: 'relative',
      marginTop: 12,
      borderRadius: 12,
      overflow: 'hidden',
    },
    previewImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
    },
    removeImageButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    formActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    formButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.background,
      marginRight: 8,
    },
    cancelButtonText: {
      color: colors.textMedium,
      fontWeight: '600',
      fontSize: 14,
    },
    submitButton: {
      backgroundColor: colors.primary,
      marginLeft: 8,
    },
    submitButtonText: {
      color: colors.white,
      fontWeight: '600',
      fontSize: 14,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.textMedium,
    },
    emptyContainer: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textDark,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMedium,
      textAlign: 'center',
      marginBottom: 24,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    emptyButtonText: {
      color: colors.white,
      fontWeight: '600',
      fontSize: 14,
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    resultsCount: {
      fontSize: 14,
      color: colors.textMedium,
    },
    smartFinderBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.primaryDark,
      borderRadius: 12,
    },
    smartFinderIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    smartFinderContent: {
      flex: 1,
    },
    smartFinderTitle: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    smartFinderSubtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 12,
    },
    filterModalContainer: {
      width: '85%',
    },
    filterModalContent: {
      padding: 16,
    },
    filterSection: {
      marginBottom: 16,
    },
    filterSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textDark,
      marginBottom: 12,
    },
    filterOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
    },
    filterChipIcon: {
      marginRight: 4,
    },
    filterChipText: {
      fontSize: 12,
      color: colors.textMedium,
    },
    filterChipTextActive: {
      color: colors.white,
    },
    locationInput: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      fontSize: 14,
      color: colors.textDark,
    },
    sortBySection: {
      marginTop: 8,
      marginBottom: 20,
    },
    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    sortOptionText: {
      fontSize: 14,
      marginLeft: 12,
      color: colors.textDark,
    },
    filterActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    clearButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.background,
      marginRight: 8,
    },
    clearButtonText: {
      color: colors.textMedium,
      fontWeight: '600',
      fontSize: 14,
    },
    applyButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.primary,
      marginLeft: 8,
    },
    applyButtonText: {
      color: colors.white,
      fontWeight: '600',
      fontSize: 14,
    }
  });
export default LostFoundPetsScreen;
  