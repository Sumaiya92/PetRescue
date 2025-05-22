import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Modal, 
  ScrollView, 
  Switch, 
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  Linking,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5,Feather } from '@expo/vector-icons';

import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import API_URL from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');

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

const ShelterScreen = ({ navigation }) => {
  const [shelters, setShelters] = useState([]);
  const [filteredShelters, setFilteredShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newShelter, setNewShelter] = useState({ 
    name: '', 
    description: '',
    capacity: 0,
    location: { 
      address: '', 
      city: '', 
      state: '', 
      zipCode: '', 
      coordinates: [0, 0]
    }, 
    contactInfo: { 
      email: '', 
      phone: '', 
      website: '' 
    },
    operatingHours: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' }
    },
    requirements: '',
    services: [],
    active: true,
    imageUrl: ''
  });
  const [isCreateFormVisible, setCreateFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterState, setFilterState] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [servicesModalVisible, setServicesModalVisible] = useState(false);
const [currentServices, setCurrentServices] = useState([]);

  useEffect(() => {
    fetchShelters();
    checkLocationPermission();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterShelters();
  }, [searchQuery, filterCity, filterState, shelters, showOnlyFavorites, favorites]);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
    } catch (err) {
      console.error('Error checking location permission:', err);
    }
  };

  const openDirections = async (shelter) => {
    // First check if we have shelter coordinates
    if (!shelter?.location?.coordinates || !Array.isArray(shelter.location.coordinates)) {
      Alert.alert('Error', 'This shelter does not have valid location coordinates');
      return;
    }

    const [lng, lat] = shelter.location.coordinates;
    
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      Alert.alert('Error', 'Invalid shelter coordinates');
      return;
    }

    try {
      // Check if we have user location, if not try to get it
      if (!userLocation) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need location permission to show directions from your current location');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      }

      // Prepare the URL based on platform
      let url;
      if (Platform.OS === 'ios') {
        // Apple Maps
        url = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
      } else {
        // Google Maps
        if (userLocation) {
          url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${lat},${lng}&travelmode=driving`;
        } else {
          url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        }
      }

      // Check if we can open the URL
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to browser if native maps app not available
        const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        await Linking.openURL(browserUrl);
      }
    } catch (error) {
      console.error('Error opening directions:', error);
      Alert.alert('Error', 'Failed to open directions. Please make sure you have a maps app installed.');
    }
  };

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed to set shelter location');
        setHasLocationPermission(false);
        setLocationLoading(false);
        return;
      }
      
      setHasLocationPermission(true);
      
      let location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.High,
        timeout: 10000 // 10 second timeout
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      // Update the form with the new coordinates
      setNewShelter(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: [
            parseFloat(location.coords.longitude.toFixed(6)),
            parseFloat(location.coords.latitude.toFixed(6))
          ]
        }
      }));
      
      // Reverse geocode to get address details
      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        
        if (address.length > 0) {
          setNewShelter(prev => ({
            ...prev,
            location: {
              ...prev.location,
              address: address[0].street || prev.location.address,
              city: address[0].city || prev.location.city,
              state: address[0].region || prev.location.state,
              zipCode: address[0].postalCode || prev.location.zipCode
            }
          }));
        }
      } catch (geocodeError) {
        console.log('Reverse geocoding failed:', geocodeError);
      }
      
    } catch (err) {
      console.error('Error getting location:', err);
      Alert.alert('Error', 'Failed to get location. Please ensure location services are enabled and try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchShelters = async () => {
    try {
      const res = await fetch(`${API_URL}/shelter`);
      const data = await res.json();
      
      const processedData = data.map(shelter => {
        if (shelter.location && shelter.location.coordinates) {
          if (!Array.isArray(shelter.location.coordinates) || shelter.location.coordinates.length !== 2) {
            shelter.location.coordinates = [0, 0];
          } else {
            shelter.location.coordinates = [
              parseFloat(shelter.location.coordinates[0]) || 0,
              parseFloat(shelter.location.coordinates[1]) || 0
            ];
          }
        }
        return shelter;
      });
      
      setShelters(processedData);
      setFilteredShelters(processedData);
    } catch (err) {
      console.error('Failed to fetch shelters:', err);
      Alert.alert('Error', 'Failed to fetch shelters: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterShelters = () => {
    let filtered = shelters;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shelter => 
        shelter.name.toLowerCase().includes(query) || 
        shelter.description.toLowerCase().includes(query) ||
        (shelter.location.city && shelter.location.city.toLowerCase().includes(query)) ||
        (shelter.location.state && shelter.location.state.toLowerCase().includes(query)) ||
        (shelter.services && shelter.services.some(service => service.toLowerCase().includes(query))));
    }
    
    if (filterCity) {
      filtered = filtered.filter(shelter => 
        shelter.location.city && shelter.location.city.toLowerCase() === filterCity.toLowerCase());
    }
    
    if (filterState) {
      filtered = filtered.filter(shelter => 
        shelter.location.state && shelter.location.state.toLowerCase() === filterState.toLowerCase());
    }
    
    if (showOnlyFavorites) {
      filtered = filtered.filter(shelter => favorites.includes(shelter._id));
    }
    
    setFilteredShelters(filtered);
  };

  const findNearbyShelters = async () => {
    try {
      if (!userLocation) {
        Alert.alert('Location not available', 'Please enable location services');
        await getLocation();
        
        if (!userLocation) {
          Alert.alert('Location required', 'Cannot find shelters without location');
          setFilteredShelters([]);
          return;
        }
      }
  
      if (!userLocation.latitude || !userLocation.longitude) {
        Alert.alert('Invalid location', 'Current location coordinates are invalid');
        setFilteredShelters([]);
        return;
      }
  
      const nearbyShelters = shelters.filter(shelter => {
        try {
          if (!shelter?.location?.coordinates || !Array.isArray(shelter.location.coordinates)) {
            return false;
          }
  
          const [lng, lat] = shelter.location.coordinates;
          
          if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
            return false;
          }
  
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            lat,
            lng
          );
          
          return distance <= 50;
        } catch (error) {
          console.error('Error processing shelter:', shelter, error);
          return false;
        }
      });
  
      if (nearbyShelters.length === 0) {
        Alert.alert('No shelters found', 'No shelters found within 50km of your location');
      }
  
      setFilteredShelters(nearbyShelters);
    } catch (error) {
      console.error('Error in findNearbyShelters:', error);
      Alert.alert('Error', 'Failed to find nearby shelters');
      setFilteredShelters([]);
    }
  };
  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  const addShelter = async () => {
    if (!newShelter.name || !newShelter.description || !newShelter.location.address ||
        !newShelter.location.city || !newShelter.location.state || !newShelter.location.zipCode ||
        !newShelter.contactInfo.email || !newShelter.contactInfo.phone) {
      Alert.alert('Missing information', 'Please fill in all required fields (marked with *)');
      return;
    }
    
    try {
      const shelterToAdd = {
        ...newShelter,
        location: {
          ...newShelter.location,
          coordinates: [
            parseFloat(newShelter.location.coordinates[0]) || 0,
            parseFloat(newShelter.location.coordinates[1]) || 0
          ]
        }
      };
      
      const res = await fetch(`${API_URL}/shelter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shelterToAdd),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShelters([...shelters, data]);
        setCreateFormVisible(false);
        resetForm();
        Alert.alert('Success', 'Shelter added successfully');
      } else {
        console.error('Failed to add shelter:', data);
        Alert.alert('Error', data.message || 'Failed to add shelter');
      }
    } catch (err) {
      console.error('Error adding shelter:', err);
      Alert.alert('Error', 'Failed to connect to server: ' + err.message);
    }
  };

  const resetForm = () => {
    setNewShelter({ 
      name: '', 
      description: '',
      capacity: 0,
      location: { 
        address: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        coordinates: userLocation ? [userLocation.longitude, userLocation.latitude] : [0, 0]
      }, 
      contactInfo: { 
        email: '', 
        phone: '', 
        website: '' 
      },
      operatingHours: {
        monday: { open: '', close: '' },
        tuesday: { open: '', close: '' },
        wednesday: { open: '', close: '' },
        thursday: { open: '', close: '' },
        friday: { open: '', close: '' },
        saturday: { open: '', close: '' },
        sunday: { open: '', close: '' }
      },
      requirements: '',
      services: [],
      active: true,
      imageUrl: ''
    });
  };

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    }
  };
  
  const saveFavorite = async (shelterId) => {
    try {
      let newFavorites;
      if (favorites.includes(shelterId)) {
        newFavorites = favorites.filter(id => id !== shelterId);
      } else {
        newFavorites = [...favorites, shelterId];
      }
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (e) {
      console.error('Failed to save favorite:', e);
    }
  };
  
  const deleteShelter = async (id) => {
    Alert.alert(
      "Delete Shelter",
      "Are you sure you want to delete this shelter?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/shelter/${id}`, { method: 'DELETE' });
              if (res.ok) {
                setShelters(shelters.filter((shelter) => shelter._id !== id));
                setFilteredShelters(filteredShelters.filter((shelter) => shelter._id !== id));
                Alert.alert('Success', 'Shelter deleted successfully');
              } else {
                console.error('Failed to delete shelter');
                Alert.alert('Error', 'Failed to delete shelter');
              }
            } catch (err) {
              console.error('Error deleting shelter:', err);
              Alert.alert('Error', 'Failed to connect to server: ' + err.message);
            }
          }
        }
      ]
    );
  };

  const toggleService = (service) => {
    setNewShelter(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };
  const handleCallShelter = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('Error', 'No phone number available for this shelter');
      return;
    }
    const phoneUrl = `tel:${phoneNumber.replace(/[^0-9]/g, '')}`;
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        } else {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch(err => console.error('Error opening phone app:', err));
  };

  const handleEmailShelter = (email) => {
    if (!email) {
      Alert.alert('Error', 'No email address available for this shelter');
      return;
    }
    const emailUrl = `mailto:${email}`;
    Linking.canOpenURL(emailUrl)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Email is not configured on this device');
        } else {
          return Linking.openURL(emailUrl);
        }
      })
      .catch(err => console.error('Error opening email app:', err));
  };

  const handleDonate = (website) => {
    if (!website) {
      Alert.alert('Error', 'No donation link available for this shelter');
      return;
    }
    let donationUrl = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(donationUrl)
      .catch(err => {
        console.error('Error opening browser:', err);
        Alert.alert('Error', 'Could not open donation page');
      });
  };

  const navigateToShelterPets = (shelterId, shelterName) => {
    navigation.navigate('PetList', { 
      shelterFilter: shelterId,
      title: `Pets at ${shelterName}`
    });
  };

  // Sample data for demonstration - in a real app, this would come from your backend
  const samplePets = [
    { id: '1', name: 'Buddy', type: 'Dog', imageUrl: 'https://example.com/dog1.jpg' },
    { id: '2', name: 'Whiskers', type: 'Cat', imageUrl: 'https://example.com/cat1.jpg' },
    { id: '3', name: 'Rex', type: 'Dog', imageUrl: 'https://example.com/dog2.jpg' },
  ];

  const sampleReviews = [
    { id: '1', rating: 5, comment: 'Great shelter with caring staff!', author: 'Happy Adopter' },
    { id: '2', rating: 4, comment: 'Clean facilities and friendly volunteers', author: 'Local Visitor' },
  ];

  const sampleEvents = [
    { id: '1', title: 'Adoption Day', date: '2023-06-15', time: '10:00 AM', location: 'Main Shelter' },
    { id: '2', title: 'Vaccination Camp', date: '2023-06-20', time: '9:00 AM - 3:00 PM', location: 'Community Center' },
  ];
  const showServicesModal = (services) => {
  setCurrentServices(services || []);
  setServicesModalVisible(true);
};

const renderItem = ({ item }) => (
  <View style={styles.card}>
    {/* Shelter Header with Favorite */}
    <View style={styles.cardHeader}>
      <Text style={styles.shelterName}>{item.name}</Text>
    </View>

    {/* Status Badge */}
    <View style={[
      styles.statusBadge,
      { backgroundColor: item.active ? colors.success + '20' : colors.danger + '20' }
    ]}>
      <View style={[
        styles.statusDot,
        { backgroundColor: item.active ? colors.success : colors.danger }
      ]} />
      <Text style={[
        styles.statusText,
        { color: item.active ? colors.success : colors.danger }
      ]}>
        {item.active ? 'Active' : 'Inactive'}
      </Text>
    </View>

    {/* Description */}
    <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
      {item.description}
    </Text>

    {/* Quick Info Row */}
    <View style={styles.infoRow}>
      <View style={styles.infoItem}>
        <Ionicons name="location" size={16} color={colors.primary} />
        <Text style={styles.infoText}>
          {item.location.city}, {item.location.state}
        </Text>
      </View>
      
      {item.capacity > 0 && (
        <View style={styles.infoItem}>
          <Ionicons name="paw" size={16} color={colors.primary} />
          <Text style={styles.infoText}>Capacity: {item.capacity}</Text>
        </View>
      )}
    </View>

    {/* Services Preview */}
    {item.services && item.services.length > 0 && (
      <View style={styles.servicesPreview}>
        <Text style={styles.sectionTitle}>Available Services</Text>
        <View style={styles.serviceTags}>
          {item.services.slice(0, 3).map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{service}</Text>
            </View>
          ))}
          {item.services.length > 3 && (
            <View style={styles.moreServicesTag}>
              <Text style={styles.moreServicesText}>+{item.services.length - 3} more</Text>
            </View>
          )}
        </View>
      </View>
    )}

    {/* Distance Indicator */}
    {userLocation && item.location.coordinates && (
      <View style={styles.distanceContainer}>
        <Ionicons name="navigate" size={16} color={colors.primary} />
        <Text style={styles.distanceText}>
          {calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            item.location.coordinates[1],
            item.location.coordinates[0]
          ).toFixed(1)} km away
        </Text>
      </View>
    )}

    {/* Action Buttons */}
    <View style={styles.actionButtons}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.primaryButton]}
        onPress={() => showServicesModal(item.services)}
      >
        <Feather name="list" size={16} color={colors.white} />
        <Text style={styles.buttonText}> View Services</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.secondaryButton]}
        onPress={() => {
          setSelectedShelter(item);
          setMapModalVisible(true);
        }}
      >
        <Feather name="map" size={16} color={colors.white} />
        <Text style={styles.buttonText}> Map</Text>
      </TouchableOpacity>
    </View>

    {/* Quick Contact Row */}
    <View style={styles.quickContact}>
      {item.contactInfo.phone && (
        <TouchableOpacity 
          style={styles.contactIcon}
          onPress={() => handleCallShelter(item.contactInfo.phone)}
        >
          <Feather name="phone" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
      
      {item.contactInfo.email && (
        <TouchableOpacity 
          style={styles.contactIcon}
          onPress={() => handleEmailShelter(item.contactInfo.email)}
        >
          <Feather name="mail" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
      
      {item.contactInfo.website && (
        <TouchableOpacity 
          style={styles.contactIcon}
          onPress={() => handleDonate(item.contactInfo.website)}
        >
          <Feather name="globe" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// Add this state at the top with your other state declarations


// Add this function to show services


// Add this modal component to your main return statement


  
  const renderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Add New Shelter</Text>
        <TouchableOpacity 
          style={styles.closeFormButton}
          onPress={() => {
            setCreateFormVisible(false);
            resetForm();
          }}
        >
          <Ionicons name="close" size={24} color={colors.darkGray} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.formSectionTitle}>Basic Information</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Shelter Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter shelter name"
          value={newShelter.name}
          onChangeText={(text) => setNewShelter({ ...newShelter, name: text })}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Describe the shelter, its mission, and services"
          multiline
          numberOfLines={3}
          value={newShelter.description}
          onChangeText={(text) => setNewShelter({ ...newShelter, description: text })}
        />
      </View>
      
      <Text style={styles.formSectionTitle}>Location Information</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Street address"
          value={newShelter.location.address}
          onChangeText={(text) => setNewShelter({ 
            ...newShelter, 
            location: { ...newShelter.location, address: text } 
          })}
        />
      </View>
      
      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            value={newShelter.location.city}
            onChangeText={(text) => setNewShelter({ 
              ...newShelter, 
              location: { ...newShelter.location, city: text } 
            })}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="State"
            value={newShelter.location.state}
            onChangeText={(text) => setNewShelter({ 
              ...newShelter, 
              location: { ...newShelter.location, state: text } 
            })}
          />
        </View>
      </View>
      
      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>ZIP Code *</Text>
          <TextInput
            style={styles.input}
            placeholder="ZIP code"
            value={newShelter.location.zipCode}
            onChangeText={(text) => setNewShelter({ 
              ...newShelter, 
              location: { ...newShelter.location, zipCode: text } 
            })}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Capacity</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of pets"
            keyboardType="numeric"
            value={String(newShelter.capacity)}
            onChangeText={(text) => setNewShelter({ 
              ...newShelter, 
              capacity: parseInt(text) || 0 
            })}
          />
        </View>
      </View>
      
      <View style={styles.coordinatesContainer}>
        <Text style={styles.coordinateLabel}>Location Coordinates</Text>
        <View style={styles.coordInputRow}>
          <View style={styles.coordinateInputContainer}>
            <Text style={styles.coordLabel}>Longitude:</Text>
            <TextInput
              style={styles.coordInput}
              placeholder="0.000000"
              keyboardType="numeric"
              value={newShelter.location.coordinates[0]?.toString() || ''}
              onChangeText={(text) => setNewShelter({ 
                ...newShelter, 
                location: { 
                  ...newShelter.location, 
                  coordinates: [parseFloat(text) || 0, newShelter.location.coordinates[1] || 0] 
                } 
              })}
            />
          </View>
          
          <View style={styles.coordinateInputContainer}>
            <Text style={styles.coordLabel}>Latitude:</Text>
            <TextInput
              style={styles.coordInput}
              placeholder="0.000000"
              keyboardType="numeric"
              value={newShelter.location.coordinates[1]?.toString() || ''}
              onChangeText={(text) => setNewShelter({ 
                ...newShelter, 
                location: { 
                  ...newShelter.location, 
                  coordinates: [newShelter.location.coordinates[0] || 0, parseFloat(text) || 0] 
                } 
              })}
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.getLocationButton}
          onPress={getLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="locate" size={16} color={colors.white} />
              <Text style={styles.buttonText}> Use Current Location</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {hasLocationPermission && (
        <Text style={styles.locationStatusText}>
          {/* {newShelter.location.coordinates[0] !== 0 && newShelter.location.coordinates[1] !== 0 
          ? 'Location set'
          : 'No location set'} */}
          {newShelter.location.coordinates[0] !== 0 && newShelter.location.coordinates[1] !== 0
          ? 'Location set'
          : 'No location set'}
        </Text>
      )}
      
      <Text style={styles.formSectionTitle}>Contact Information</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          keyboardType="email-address"
          value={newShelter.contactInfo.email}
          onChangeText={(text) => setNewShelter({ 
            ...newShelter, 
            contactInfo: { ...newShelter.contactInfo, email: text } 
          })}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone *</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          keyboardType="phone-pad"
          value={newShelter.contactInfo.phone}
          onChangeText={(text) => setNewShelter({ 
            ...newShelter, 
            contactInfo: { ...newShelter.contactInfo, phone: text } 
          })}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Website</Text>
        <TextInput
          style={styles.input}
          placeholder="Website URL"
          keyboardType="url"
          value={newShelter.contactInfo.website}
          onChangeText={(text) => setNewShelter({ 
            ...newShelter, 
            contactInfo: { ...newShelter.contactInfo, website: text } 
          })}
        />
      </View>
      
      <Text style={styles.formSectionTitle}>Services</Text>
      <View style={styles.servicesSelectionContainer}>
        <TouchableOpacity 
          style={[
            styles.serviceOption,
            newShelter.services.includes('Adoption') && styles.selectedService
          ]}
          onPress={() => toggleService('Adoption')}
        >
          <Text style={[
            styles.serviceOptionText,
            newShelter.services.includes('Adoption') && styles.selectedServiceText
          ]}>
            Adoption
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.serviceOption,
            newShelter.services.includes('Fostering') && styles.selectedService
          ]}
          onPress={() => toggleService('Fostering')}
        >
          <Text style={[
            styles.serviceOptionText,
            newShelter.services.includes('Fostering') && styles.selectedServiceText
          ]}>
            Fostering
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.serviceOption,
            newShelter.services.includes('Veterinary Care') && styles.selectedService
          ]}
          onPress={() => toggleService('Veterinary Care')}
        >
          <Text style={[
            styles.serviceOptionText,
            newShelter.services.includes('Veterinary Care') && styles.selectedServiceText
          ]}>
            Veterinary Care
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.serviceOption,
            newShelter.services.includes('Grooming') && styles.selectedService
          ]}
          onPress={() => toggleService('Grooming')}
        >
          <Text style={[
            styles.serviceOptionText,
            newShelter.services.includes('Grooming') && styles.selectedServiceText
          ]}>
            Grooming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.serviceOption,
            newShelter.services.includes('Training') && styles.selectedService
          ]}
          onPress={() => toggleService('Training')}
        >
          <Text style={[
            styles.serviceOptionText,
            newShelter.services.includes('Training') && styles.selectedServiceText
          ]}>
            Training
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.serviceOption,
            newShelter.services.includes('Rescue') && styles.selectedService
          ]}
          onPress={() => toggleService('Rescue')}
        >
          <Text style={[
            styles.serviceOptionText,
            newShelter.services.includes('Rescue') && styles.selectedServiceText
          ]}>
            Rescue
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Image URL</Text>
        <TextInput
          style={styles.input}
          placeholder="Link to shelter image"
          keyboardType="url"
          value={newShelter.imageUrl}
          onChangeText={(text) => setNewShelter({ ...newShelter, imageUrl: text })}
        />
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.inputLabel}>Status: </Text>
        <Switch
          value={newShelter.active}
          onValueChange={(value) => setNewShelter({ ...newShelter, active: value })}
          trackColor={{ false: colors.mediumGray, true: colors.primaryLight }}
          thumbColor={newShelter.active ? colors.primary : colors.darkGray}
        />
        <Text style={styles.statusText}>{newShelter.active ? 'Active' : 'Inactive'}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.submitButton}
        onPress={addShelter}
      >
        <Text style={styles.submitButtonText}>Add Shelter</Text>
      </TouchableOpacity>
    </View>
  );

   return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pet Shelters</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setCreateFormVisible(true)}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.darkGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search shelters..."
          placeholderTextColor={colors.darkGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color={colors.darkGray} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <Ionicons name="filter" size={18} color={colors.primary} />
          <Text style={styles.filterButtonText}> Filters</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={findNearbyShelters}
        >
          <Ionicons name="navigate" size={18} color={colors.primary} />
          <Text style={styles.filterButtonText}> Nearby</Text>
        </TouchableOpacity>
      </View>
      
      {/* Expanded Filters */}
      {isFilterExpanded && (
        <View style={styles.expandedFilters}>
          <View style={styles.filterInputRow}>
            <View style={styles.filterInputContainer}>
              <Text style={styles.filterLabel}>City</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Any city"
                value={filterCity}
                onChangeText={setFilterCity}
              />
            </View>
            
            <View style={styles.filterInputContainer}>
              <Text style={styles.filterLabel}>State</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Any state"
                value={filterState}
                onChangeText={setFilterState}
              />
            </View>
          </View>
          
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Favorites Only</Text>
            <Switch
              value={showOnlyFavorites}
              onValueChange={setShowOnlyFavorites}
              trackColor={{ false: colors.mediumGray, true: colors.secondaryLight }}
              thumbColor={showOnlyFavorites ? colors.secondary : colors.white}
            />
          </View>
          
          <View style={styles.filterFooter}>
            <Text style={styles.filterResults}>
              Showing {filteredShelters.length} of {shelters.length}
            </Text>
            
            {(filterCity || filterState || searchQuery || showOnlyFavorites) && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => {
                  setFilterCity('');
                  setFilterState('');
                  setSearchQuery('');
                  setShowOnlyFavorites(false);
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      
      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading shelters...</Text>
        </View>
      ) : filteredShelters.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="search" size={50} color={colors.mediumGray} />
          <Text style={styles.emptyText}>No shelters found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredShelters}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Map Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.mapHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setMapModalVisible(false)}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.mapTitle} numberOfLines={1}>
              {selectedShelter?.name || 'Shelter Location'}
            </Text>
          </View>
          
          {selectedShelter?.location?.coordinates && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: selectedShelter.location.coordinates[1],
                longitude: selectedShelter.location.coordinates[0],
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: selectedShelter.location.coordinates[1],
                  longitude: selectedShelter.location.coordinates[0],
                }}
                title={selectedShelter.name}
                description={selectedShelter.location.address}
              />
              
              {userLocation && (
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  title="Your Location"
                  pinColor={colors.primary}
                />
              )}
            </MapView>
          )}
          
          <View style={styles.mapFooter}>
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={() => openDirections(selectedShelter)}
            >
              <Ionicons name="navigate" size={20} color={colors.white} />
              <Text style={styles.buttonText}> Get Directions</Text>
            </TouchableOpacity>
            
            <View style={styles.addressContainer}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={styles.addressText} numberOfLines={2}>
                {selectedShelter?.location?.address}, {selectedShelter?.location?.city}, {selectedShelter?.location?.state}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
      
      {/* Add Shelter Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isCreateFormVisible}
        onRequestClose={() => {
          setCreateFormVisible(false);
          resetForm();
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView style={styles.formScrollContainer}>
            {renderForm()}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      {/* Services Modal */}
      <Modal
  animationType="slide"
  transparent={true}
  visible={servicesModalVisible}
  onRequestClose={() => setServicesModalVisible(false)}
>
  <View style={styles.servicesModalContainer}>
    <View style={styles.servicesModalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Available Services</Text>
        <TouchableOpacity 
          style={styles.closeModalButton}
          onPress={() => setServicesModalVisible(false)}
        >
          <Ionicons name="close" size={24} color={colors.darkGray} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.servicesList}>
        {currentServices.length > 0 ? (
          currentServices.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={colors.success} 
                style={styles.serviceIcon} 
              />
              <Text style={styles.serviceName}>{service}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noServicesText}>No services listed for this shelter</Text>
        )}
      </ScrollView>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  clearSearchButton: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  filterButtonText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  expandedFilters: {
    backgroundColor: colors.white,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 4,
    fontWeight: '500',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    marginVertical: 8,
  },
  toggleLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  filterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  filterResults: {
    fontSize: 12,
    color: colors.darkGray,
  },
  clearFiltersButton: {
    padding: 4,
  },
  clearFiltersText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shelterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 13,
    color: colors.darkGray,
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 6,
  },
  quickContact: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  contactIcon: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },
  formScrollContainer: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backButton: {
    marginRight: 16,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
  },
  map: {
    width: '100%',
    height: height * 0.7,
  },
  mapFooter: {
    padding: 16,
    backgroundColor: colors.white,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 14,
    color: colors.darkGray,
    marginLeft: 8,
    flex: 1,
  },
  formScrollContainer: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  formContainer: {
    backgroundColor: colors.white,
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
  closeFormButton: {
    padding: 8,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  coordinatesContainer: {
    marginBottom: 16,
  },
  coordinateLabel: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 4,
  },
  coordInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coordinateInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  coordLabel: {
    fontSize: 12,
    color: colors.darkGray,
  },
  coordInput: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  getLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
  },
  locationStatusText: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  servicesSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  serviceOption: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  selectedService: {
    backgroundColor: colors.primary,
  },
  serviceOptionText: {
    color: colors.primary,
    fontSize: 14,
  },
  selectedServiceText: {
    color: colors.white,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.darkGray,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  backButton: {
    marginRight: 16,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  map: {
    flex: 1,
  },
  mapDetailsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  mapShelterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  mapShelterAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mapAddressText: {
    fontSize: 16,
    color: colors.black,
    marginLeft: 8,
    flex: 1,
  },
  mapDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapDistanceText: {
    fontSize: 16,
    color: colors.darkGray,
    marginLeft: 8,
  },
   contactActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contactActionButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactActionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  contactDetails: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: colors.primary,
    marginRight: 4,
  },
  petThumbnail: {
    width: 100,
    marginRight: 12,
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  petName: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  petType: {
    color: colors.darkGray,
    fontSize: 12,
  },
  reviewItem: {
    marginBottom: 12,
  },
  reviewRating: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewComment: {
    fontStyle: 'italic',
    marginBottom: 2,
  },
  reviewAuthor: {
    color: colors.darkGray,
    fontSize: 12,
  },
  noReviewsText: {
    color: colors.mediumGray,
    fontStyle: 'italic',
  },
  helpText: {
    marginBottom: 10,
  },
  helpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helpButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donateButton: {
    backgroundColor: colors.secondary,
  },
  helpButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  compactHelpSection: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},
compactHelpButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.primary,
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  marginHorizontal: 4,
},
compactDonateButton: {
  backgroundColor: colors.secondary,
},
compactHelpButtonText: {
  color: colors.white,
  fontSize: 14,
  marginLeft: 5,
},
servicesModalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
servicesModalContent: {
  backgroundColor: colors.white,
  borderRadius: 12,
  width: '90%',
  maxHeight: '80%',
  padding: 16,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
  borderBottomWidth: 1,
  borderBottomColor: colors.lightGray,
  paddingBottom: 12,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: colors.black,
},
closeModalButton: {
  padding: 4,
},
servicesList: {
  maxHeight: '80%',
},
serviceItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: colors.lightGray,
},
serviceIcon: {
  marginRight: 12,
},
serviceName: {
  fontSize: 16,
  color: colors.black,
},
noServicesText: {
  fontSize: 16,
  color: colors.darkGray,
  textAlign: 'center',
  paddingVertical: 20,
},
servicesPreview: {
  marginBottom: 12,
},
sectionTitle: {
  fontSize: 14,
  fontWeight: 'bold',
  color: colors.black,
  marginBottom: 8,
},
serviceTags: {
  flexDirection: 'row',
  flexWrap: 'wrap',
},
serviceTag: {
  backgroundColor: colors.primaryLight,
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 6,
  marginRight: 8,
  marginBottom: 8,
},
serviceTagText: {
  fontSize: 12,
  color: colors.primary,
  fontWeight: '500',
},
moreServicesTag: {
  backgroundColor: colors.lightGray,
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 6,
  marginBottom: 8,
},
moreServicesText: {
  fontSize: 12,
  color: colors.darkGray,
},
});

export default ShelterScreen;