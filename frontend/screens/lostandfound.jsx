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
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.44;

export const colors = {
  primary: '#4A6FA5',
  primaryLight: '#E8F0FE',
  primaryDark: '#2C4A7A',
  lost: '#E53E3E',
  lostLight: '#FED7D7',
  found: '#48BB78',
  foundLight: '#C6F6D5',
  resolved: '#4299E1',
  resolvedLight: '#BEE3F8',
  secondary: '#FF7E5F',
  secondaryLight: '#FFE8E2',
  white: '#FFFFFF',
  lightGray: '#F5F7FA',
  mediumGray: '#E1E5EB',
  darkGray: '#6B7C93',
  black: '#2D3748',
  warning: '#ED8936',
  info: '#4299E1',
  highlight: '#FEFCBF',
  gradient1: '#667eea',
  gradient2: '#764ba2',
  accent: '#f093fb',
};

const LostFoundPetsScreen = ({ navigation }) => {
  const route = useRoute();
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'lost');
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [fabAnimation] = useState(new Animated.Value(1));
  const [tabIndicatorAnimation] = useState(new Animated.Value(0));
  const [headerAnimation] = useState(new Animated.Value(0));
  const [filters, setFilters] = useState({
    petType: 'all',
    location: '',
    searchQuery: '',
    sortBy: 'recent',
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

  // Animate header on mount
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // Animate tab indicator when tab changes
  useEffect(() => {
    Animated.spring(tabIndicatorAnimation, {
      toValue: activeTab === 'lost' ? 0 : 1,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  // Get appropriate icon for pet type
  const getPetIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'dog':
        return <FontAwesome5 name="dog" size={14} color={colors.darkGray} />;
      case 'cat':
        return <FontAwesome5 name="cat" size={14} color={colors.darkGray} />;
      case 'bird':
        return <FontAwesome5 name="dove" size={14} color={colors.darkGray} />;
      case 'rabbit':
        return <FontAwesome5 name="rabbit" size={14} color={colors.darkGray} />;
      default:
        return <FontAwesome5 name="paw" size={14} color={colors.darkGray} />;
    }
  };

 const getStatusInfo = (pet) => {
  const isLost = pet.status === 'lost';
  const isResolved = isLost ? pet.isFound : pet.isClaimed;
  
  if (isLost) {
    // Lost pet logic
    return {
      baseColor: colors.lost,        // Red for "LOST"
      resolvedColor: colors.found,   // Green for "FOUND"
      statusText: 'LOST',
      resolvedText: 'FOUND',
      actionText: pet.isFound ? 'Found ✓' : 'Mark Found',
      isResolved: isResolved,
    };
  } else {
    // Found pet logic - matching the lost tab pattern
    return {
      baseColor: colors.lost,        // Red for "Mark Claimed" (unclaimed found pets)
      resolvedColor: colors.found,   // Green for "Claimed ✓" (claimed found pets)
      statusText: 'FOUND',
      resolvedText: 'CLAIMED',
      actionText: pet.isClaimed ? 'Claimed ✓' : 'Mark Claimed',
      isResolved: isResolved,
    };
  }
};

  const navigateToLostPetDetails = (pet) => {
    if (pet && pet._id) {
      navigation.navigate("LostPetDetails", { petId: pet._id });
    }
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

  // Clear filters
  const clearFilters = () => {
    setFilters({
      petType: 'all',
      location: '',
      searchQuery: '',
      sortBy: 'recent',
    });
  };

  // Apply filters and close modal
  const applyFiltersAndClose = () => {
    setFilterModalVisible(false);
    applyFilters(pets, activeTab, filters);
  };

  // Render pet card with consistent colors and better layout
  const renderPetCard = ({ item, index }) => {
    const isEven = index % 2 === 0;
    const statusInfo = getStatusInfo(item);
    
    return (
      <TouchableOpacity 
        style={[
          styles.card, 
          { 
            marginLeft: isEven ? 16 : 8, 
            marginRight: isEven ? 8 : 16,
          }
        ]}
        activeOpacity={0.8}
        onPress={() => navigateToLostPetDetails(item)}
      >
        <View style={styles.cardImageContainer}>
          {item.image ? (
            <Image
              source={{ 
                uri: item.image.startsWith('http') ? item.image : `${BASE_URL}/${item.image.replace(/\\/g, '/')}`
              }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImage, styles.imagePlaceholder]}>
              {getPetIcon(item.type)}
            </View>
          )}
          
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: statusInfo.isResolved ? statusInfo.resolvedColor : statusInfo.baseColor
            }
          ]}>
            <Text style={styles.statusText}>
              {statusInfo.isResolved ? statusInfo.resolvedText : statusInfo.statusText}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          {activeTab === 'lost' && 
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name || 'Unknown Pet'}
            </Text>
          }
          
          <View style={styles.cardInfo}>
            <View style={styles.infoRow}>
              {getPetIcon(item.type)}
              <Text style={styles.infoText} numberOfLines={1}>{item.type}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="location-sharp" size={12} color={colors.darkGray} />
              <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { 
                backgroundColor: statusInfo.isResolved ? statusInfo.resolvedColor : statusInfo.baseColor,
              }
            ]}
            onPress={() => {
              if (item.status === 'lost') {
                updatePetStatus(item._id, { isFound: !item.isFound });
              } else {
                updatePetStatus(item._id, { isClaimed: !item.isClaimed });
              }
            }}
          >
            <Text style={styles.actionButtonText}>
              {statusInfo.actionText}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Header with Animation */}
      <Animated.View style={[
        styles.header,
        {
          transform: [{
            translateY: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            })
          }],
          opacity: headerAnimation,
        }
      ]}>
   <View style={styles.headerContent}>
    <Text style={styles.headerTitle}>Bringing families together</Text>
    
    <Animated.View style={[
      styles.addButton, 
      { transform: [{ scale: fabAnimation }] }
    ]}>
      <TouchableOpacity 
        onPress={() => {
          setModalVisible(true);
          setPetForm({...initialFormState, status: activeTab});
          
          // Animate button press
          Animated.sequence([
            Animated.timing(fabAnimation, {
              toValue: 0.8,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(fabAnimation, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            })
          ]).start();
        }}
        activeOpacity={0.8}
      >
        <AntDesign name="plus" size={20} color="#FFF" />
      </TouchableOpacity>
    </Animated.View>
  </View>
      </Animated.View>

      {/* Enhanced Search Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={18} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, breed, or description..."
            placeholderTextColor={colors.darkGray}
            value={filters.searchQuery}
            onChangeText={(text) => setFilters({...filters, searchQuery: text})}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.filterIconContainer}>
            <Feather name="sliders" size={18} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Enhanced Tabs with Animation */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrapper}>
          <TouchableOpacity
            style={[styles.tab]}
            onPress={() => setActiveTab('lost')}
            activeOpacity={0.7}
          >
            <FontAwesome5 
              name="search" 
              size={16} 
              color={activeTab === 'lost' ? colors.primary : colors.darkGray} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'lost' && styles.activeTabText
            ]}>
              Missing Pets
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab]}
            onPress={() => setActiveTab('found')}
            activeOpacity={0.7}
          >
            <FontAwesome5 
              name="hand-holding-heart" 
              size={16} 
              color={activeTab === 'found' ? colors.primary : colors.darkGray} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'found' && styles.activeTabText
            ]}>
              Found Pets
            </Text>
          </TouchableOpacity>
          
          {/* Animated Tab Indicator */}
          <Animated.View style={[
            styles.tabIndicator,
            {
              transform: [{
                translateX: tabIndicatorAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, width / 2],
                })
              }]
            }
          ]} />
        </View>
      </View>

      {/* Smart Finder Banner - Keep unchanged */}
      <TouchableOpacity 
        style={styles.smartFinderBanner}
        onPress={() => navigation.navigate('PetSearch')}
      >
        <FontAwesome5 name="search-location" size={16} color={colors.white} />
        <Text style={styles.smartFinderText}>Smart Pet Finder</Text>
        <AntDesign name="arrowright" size={16} color={colors.white} />
      </TouchableOpacity>

      {/* Pets List */}
      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item._id}
        renderItem={renderPetCard}
        numColumns={2}
        contentContainerStyle={[styles.gridContainer, { paddingBottom: 120 }]}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name={activeTab === 'lost' ? 'search' : 'paw'} size={32} color={colors.mediumGray} />
            <Text style={styles.emptyTitle}>No {activeTab} pets found</Text>
          </View>
        }
      />

      {/* Add Pet Modal - Keep unchanged */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report {activeTab === 'lost' ? 'Lost' : 'Found'} Pet</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={20} color={colors.darkGray} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Pet Name *</Text>
                <TextInput
                  style={styles.input}
                  value={petForm.name}
                  onChangeText={(text) => setPetForm({...petForm, name: text})}
                  placeholder="Enter pet's name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Pet Type *</Text>
                <View style={styles.typeSelector}>
                  {['Dog', 'Cat', 'Bird', 'Other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        petForm.type === type && styles.selectedTypeOption
                      ]}
                      onPress={() => setPetForm({...petForm, type})}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        petForm.type === type && styles.selectedTypeOptionText
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Breed</Text>
                <TextInput
                  style={styles.input}
                  value={petForm.breed}
                  onChangeText={(text) => setPetForm({...petForm, breed: text})}
                  placeholder="Enter breed (optional)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Location *</Text>
                <TextInput
                  style={styles.input}
                  value={petForm.location}
                  onChangeText={(text) => setPetForm({...petForm, location: text})}
                  placeholder="Where was the pet lost/found?"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact Information *</Text>
                <TextInput
                  style={styles.input}
                  value={activeTab === 'lost' ? petForm.OwnercontactInfo : petForm.findercontactInfo}
                  onChangeText={(text) => setPetForm({
                    ...petForm, 
                    [activeTab === 'lost' ? 'OwnercontactInfo' : 'findercontactInfo']: text
                  })}
                  placeholder="Phone number or email"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={petForm.description}
                  onChangeText={(text) => setPetForm({...petForm, description: text})}
                  placeholder="Describe the pet's appearance, behavior, etc."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Photo</Text>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                  ) : (
                    <View style={styles.imagePlaceholderButton}>
                      <AntDesign name="camera" size={24} color={colors.darkGray} />
                      <Text style={styles.imagePickerText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal - Keep unchanged */}
      <Modal
        visible={filterModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModalContainer}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <AntDesign name="close" size={20} color={colors.darkGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterModalBody}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Pet Type</Text>
                <View style={styles.filterOptions}>
                  {['All', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterOption,
                        filters.petType.toLowerCase() === type.toLowerCase() && styles.filterOptionActive
                      ]}
                      onPress={() => setFilters({...filters, petType: type})}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.petType.toLowerCase() === type.toLowerCase() && styles.filterOptionTextActive
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Location</Text>
                <View style={styles.searchInputContainer}>
                  <Feather name="map-pin" size={16} color={colors.darkGray} />
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Enter location"
                    value={filters.location}
                    onChangeText={(text) => setFilters({...filters, location: text})}
                    placeholderTextColor={colors.darkGray}
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <View style={styles.filterOptions}>
                  {[
                    { value: 'recent', label: 'Most Recent' },
                    { value: 'name', label: 'Name (A-Z)' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterOption,
                        filters.sortBy === option.value && styles.filterOptionActive
                      ]}
                      onPress={() => setFilters({...filters, sortBy: option.value})}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.sortBy === option.value && styles.filterOptionTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterModalFooter}>
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyFiltersButton}
                onPress={applyFiltersAndClose}
              >
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Enhanced StyleSheet (continued from line 799)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  
  // Simple Header Styles
  header: {
    
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  iconContainer: {
    position: 'relative',
    marginRight: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  overlayIcon: {
    position: 'absolute',
    top: 8,
    left: 10,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
  },
  
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Enhanced Search Container
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.white,
    gap: 12,
  },
  
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  
  searchIcon: {
    marginRight: 12,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    fontWeight: '400',
  },
  
  filterButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
  },
  
  filterIconContainer: {
    padding: 12,
  },
  
  // Enhanced Tabs
  tabsContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  
  tabsWrapper: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 4,
  },
  
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 2,
  },
  
  tabIcon: {
    marginRight: 8,
  },
  
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
  },
  
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '50%',
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1,
  },
  
  // Smart Finder Banner
  smartFinderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  
  smartFinderText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Grid and Card Styles
  gridContainer: {
    paddingTop: 8,
  },
  
  card: {
    width: cardWidth,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  
  cardImageContainer: {
    position: 'relative',
    height: cardWidth * 0.75,
  },
  
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGray,
  },
  
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  cardContent: {
    padding: 12,
  },
  
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  
  cardInfo: {
    marginBottom: 12,
    gap: 4,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  infoText: {
    fontSize: 12,
    color: colors.darkGray,
    flex: 1,
  },
  
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  
  emptyTitle: {
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 12,
    fontWeight: '500',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  formGroup: {
    marginBottom: 20,
    paddingTop: 8,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  
  input: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.white,
  },
  
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    backgroundColor: colors.white,
  },
  
  selectedTypeOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  typeOptionText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
  },
  
  selectedTypeOptionText: {
    color: colors.white,
  },
  
  imagePickerButton: {
    borderWidth: 2,
    borderColor: colors.mediumGray,
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  imagePlaceholderButton: {
    alignItems: 'center',
    gap: 8,
  },
  
  imagePickerText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
  },
  
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    gap: 12,
  },
  
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    alignItems: 'center',
  },
  
  cancelButtonText: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '600',
  },
  
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  
  submitButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  
  // Filter Modal Styles
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  filterModalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
  },
  
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  
  filterModalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  filterSection: {
    marginBottom: 24,
    paddingTop: 16,
  },
  
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    backgroundColor: colors.white,
  },
  
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  filterOptionText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
  },
  
  filterOptionTextActive: {
    color: colors.white,
  },
  
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  
  filterInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  
  filterModalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    gap: 12,
  },
  
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    alignItems: 'center',
  },
  
  clearFiltersText: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '600',
  },
  
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  
  applyFiltersText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
});

export default LostFoundPetsScreen;