import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from './config';

// Color palette
const colors = {
  primary: '#4A6FA5',
  primaryLight: '#E8F0FE',
  primaryDark: '#2C4A7A',
  secondary: '#FF7E5F',
  secondaryLight: '#FFE8E2',
  white: '#FFFFFF',
  lightGray: '#F5F7FA',
  mediumGray: '#E1E5EB',
  darkGray: '#6B7C93',
  black: '#2D3748',
  success: '#48BB78',
  warning: '#ED8936',
  danger: '#E53E3E',
  info: '#4299E1',
  furLight: '#F6AD55',
  furMedium: '#C05621',
  furDark: '#723F13',
  highlight: '#FEFCBF',
  rewardGold: '#D69E2E',
};

const VeterinaryFinder = () => {
  const [veterinarians, setVeterinarians] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('distance');
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Cache keys
  const CACHE_KEY = 'veterinarians_cache';
  const LOCATION_CACHE_KEY = 'user_location_cache';

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Check network status
        const networkState = await Network.getNetworkStateAsync();
        setIsOffline(!networkState.isInternetReachable);
        
        // Load cached data
        await loadCachedData();
        
        // Fetch fresh data if online
        if (networkState.isInternetReachable) {
          await requestLocationPermission();
          await fetchVeterinarians(false);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Error', 'Failed to initialize application');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);


  const loadCachedData = async () => {
    try {
      // Load cached veterinarians
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setVeterinarians(parsedData.data);
        setFilteredVets(parsedData.data);
        setLastUpdated(new Date(parsedData.timestamp));
      }
      
      // Load cached location
      const cachedLocation = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
      if (cachedLocation) {
        setUserLocation(JSON.parse(cachedLocation));
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };
  const toggleSortMethod = () => {
    const newSort = sortBy === 'distance' ? 'name' : 'distance';
    setSortBy(newSort);

    const sorted = [...filteredVets].sort((a, b) => {
      if (newSort === 'name') {
        const nameA = a.hospitalName || a.name || '';
        const nameB = b.hospitalName || b.name || '';
        return nameA.localeCompare(nameB);
      }
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    setFilteredVets(sorted);
  };
  const cacheData = async (data) => {
    try {
      const cacheObject = {
        data: data,
        timestamp: new Date().toISOString()
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required for nearby features.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(locationData);
      
      // Cache the location
      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
    } catch (error) {
      console.error('Location error:', error);
      throw new Error('Location services unavailable');
    }
  };

  const fetchVeterinarians = async (nearbyOnly = false) => {
    try {
      setLoading(true);
      setIsNearbyMode(nearbyOnly);
      
      let url = `${API_URL}/vet`;

      if (nearbyOnly && userLocation) {
        url = `${API_URL}/vet/nearby?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      processVeterinarianData(data, nearbyOnly);
      
      // Cache the data
      await cacheData(data);
    } catch (error) {
      console.error('Fetch error:', error);
      
      if (isOffline) {
        Alert.alert('Offline Mode', 'Showing cached data. Some features may be limited.');
      } else {
        Alert.alert('Error', 'Failed to fetch veterinarians. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const processVeterinarianData = (data, nearbyOnly) => {
    let vetList = [];
    
    // Handle different response structures
    if (Array.isArray(data)) {
      vetList = data;
    } else if (data.veterinarians) {
      vetList = data.veterinarians;
    } else if (data.vets) {
      vetList = data.vets;
    } else if (data.data) {
      vetList = data.data;
    }

    // Calculate distances if location is available
    const processedVets = vetList.map(vet => {
      let distance = null;
      
      if (userLocation && vet.location?.coordinates) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          vet.location.coordinates[1],
          vet.location.coordinates[0]
        );
      }

      return { ...vet, distance };
    });

    // Filter by distance if in nearby mode and we have location
    let finalVets = processedVets;
    if (nearbyOnly && userLocation) {
      // Only include vets with valid distance and within 10km
      finalVets = processedVets.filter(vet => 
        vet.distance !== null && vet.distance <= 10
      );
    }

    // Sort by distance if available
    const sortedVets = finalVets.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    setVeterinarians(sortedVets);
    setFilteredVets(sortedVets);
    
    // Clear search when switching modes
    setSearch('');
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  useEffect(() => {
    const filtered = veterinarians.filter(vet => {
      const searchLower = search.toLowerCase();
      const name = vet.hospitalName?.toLowerCase() || vet.name?.toLowerCase() || '';
      const address = vet.location?.address?.toLowerCase() || vet.address?.toLowerCase() || '';
      
      return name.includes(searchLower) || address.includes(searchLower);
    });

    setFilteredVets(filtered);
  }, [search, veterinarians]);



  const handleSeeAllPress = () => {
    fetchVeterinarians(false);
  };

  const handleNearbyPress = async () => {
    if (!userLocation) {
      try {
        await requestLocationPermission();
        if (!userLocation) {
          Alert.alert('Location Required', 'We need your location to show nearby clinics');
          return;
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to get location. Please check your settings.');
        return;
      }
    }
    
    fetchVeterinarians(true);
  };

  const formatDistance = (dist) => {
    if (dist === null || dist === undefined) return 'N/A';
    return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
  };

  const handleOpenMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not open maps app');
      console.error('Error opening maps:', err);
    });
  };

  const handleCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not initiate phone call');
      console.error('Error calling:', err);
    });
  };

  const renderVetItem = ({ item }) => (
    <View style={styles.card}>
   <View style={styles.cardHeader}>
  <Text style={styles.clinicName} numberOfLines={1}>
    {item.hospitalName || item.name}
  </Text>
  <View style={styles.metaContainer}>
    <View style={styles.ratingPill}>
      <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.5'}</Text>
      <MaterialIcons name="star" size={12} color={colors.white} />
    </View>
    <View style={styles.distancePill}>
      <MaterialIcons name="directions-walk" size={12} color={colors.white} />
      <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
    </View>
  </View>
</View>
      
     <View style={styles.infoRow}>
  <MaterialIcons name="location-on" size={14} color={colors.darkGray} />
  <Text 
    style={styles.infoText} 
    numberOfLines={1}
    ellipsizeMode="tail"
  >
    {item.location?.address || item.address}
  </Text>
</View>
      
      <View style={styles.infoRow}>
        <MaterialIcons name="phone" size={16} color={colors.darkGray} />
        <TouchableOpacity 
          onPress={() => item.contactNumber && handleCall(item.contactNumber)}
          style={styles.infoTextContainer}
        >
          <Text style={styles.infoText}>
            {item.contactNumber || 'Phone not available'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoRow}>
        <MaterialIcons name="access-time" size={16} color={colors.darkGray} />
        <Text style={styles.infoText}>
          {item.openHours || 'Hours not specified'}
        </Text>
      </View>
      
      {item.doctors?.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="user-md" size={14} color={colors.primaryDark} />
            <Text style={styles.sectionTitle}>Available Doctors</Text>
          </View>
          <View style={styles.doctorsContainer}>
            {item.doctors.slice(0, 2).map((doc, index) => (
              <View key={index} style={styles.doctorBadge}>
                <Text style={styles.doctorName}>{doc.name || 'Doctor'}</Text>
                {doc.specialty && (
                  <Text style={styles.doctorSpecialty}>{doc.specialty}</Text>
                )}
              </View>
            ))}
            {item.doctors.length > 2 && (
              <View style={styles.moreDoctorsBadge}>
                <Text style={styles.moreDoctorsText}>+{item.doctors.length - 2} more</Text>
              </View>
            )}
          </View>
        </>
      )}
      
      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => setShowMap(!showMap)}
        >
          <MaterialIcons 
            name={showMap ? 'map' : 'map'} 
            size={16} 
            color={colors.primary} 
          />
          <Text style={styles.mapButtonText}>
            {showMap ? 'Hide Map' : 'View Map'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.directionsButton}
          onPress={() => item.location?.coordinates && handleOpenMaps(
            item.location.coordinates[1],
            item.location.coordinates[0]
          )}
        >
          <MaterialIcons name="directions" size={16} color={colors.white} />
          <Text style={styles.directionsButtonText}>Directions</Text>
        </TouchableOpacity>
      </View>
      
      {showMap && item.location?.coordinates && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: item.location.coordinates[1],
              longitude: item.location.coordinates[0],
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            liteMode={true}
          >
            <Marker
              coordinate={{
                latitude: item.location.coordinates[1],
                longitude: item.location.coordinates[0],
              }}
              title={item.hospitalName || item.name}
            />
            {userLocation && (
              <Marker
                coordinate={userLocation}
                pinColor={colors.primary}
                title="Your Location"
              />
            )}
          </MapView>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <FontAwesome5 name="clinic-medical" size={48} color={colors.mediumGray} />
      </View>
      <Text style={styles.emptyTitle}>
        {search 
          ? "No matching veterinarians found" 
          : isNearbyMode 
            ? "No nearby clinics found" 
            : "No clinics available"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {search 
          ? "Try a different search term" 
          : isNearbyMode 
            ? "We couldn't find any clinics near your location" 
            : "There are currently no clinics in our database"}
      </Text>
      
      {isOffline && (
        <View style={styles.offlineNotice}>
          <MaterialIcons name="wifi-off" size={16} color={colors.danger} />
          <Text style={styles.offlineText}>You're currently offline</Text>
        </View>
      )}
      
      {lastUpdated && (
        <Text style={styles.lastUpdatedText}>Last updated: {new Date(lastUpdated).toLocaleString()}</Text>
      )}
      
      <TouchableOpacity 
        onPress={() => fetchVeterinarians(isNearbyMode)} 
        style={styles.retryButton}
      >
        <Text style={styles.retryButtonText}>Refresh Data</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header with search */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Find a Veterinarian</Text>
        </View>
        {isOffline && (
          <View style={styles.offlineBadge}>
            <MaterialIcons name="wifi-off" size={14} color={colors.white} />
            <Text style={styles.offlineBadgeText}>Offline</Text>
          </View>
        )}
      </View>
      
      {/* Search and filter bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color={colors.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clinics..."
            placeholderTextColor={colors.darkGray}
            value={search}
            onChangeText={setSearch}
            editable={!isOffline}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={toggleSortMethod}
          disabled={isOffline}
        >
          <MaterialIcons
            name={sortBy === 'distance' ? 'sort-by-alpha' : 'place'}
            size={20}
            color={isOffline ? colors.mediumGray : colors.primary}
          />
        </TouchableOpacity>
      </View>
      
      {/* Mode tabs */}
      <View>
  <View style={styles.tabContainer}>
    <TouchableOpacity 
      style={[styles.tabButton, !isNearbyMode && styles.activeTabButton]} 
      onPress={handleSeeAllPress}
    >
      <Text style={[styles.tabText, !isNearbyMode && styles.activeTabText]}>
        All Clinics
      </Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={[styles.tabButton, isNearbyMode && styles.activeTabButton]} 
      onPress={handleNearbyPress}
    >
      <MaterialIcons 
        name="near-me" 
        size={16} 
        color={isNearbyMode ? colors.white : colors.primary} 
      />
      <Text style={[styles.tabText, isNearbyMode && styles.activeTabText]}>
        Nearby
      </Text>
    </TouchableOpacity>
  </View>

  {/* Divider line below tabs */}
  <View style={styles.divider} />
</View>

      
      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {isNearbyMode ? 'Finding nearby veterinarians...' : 'Loading clinics...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredVets}
          renderItem={renderVetItem}
          keyExtractor={(item, index) => item._id || `vet-${index}`}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchVeterinarians(isNearbyMode).finally(() => setRefreshing(false));
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    backgroundColor: colors.primary,
   paddingTop: Platform.OS === 'ios' ? 50 : 5,
  paddingHorizontal: 16,
  paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.primaryLight,
  },
  offlineBadge: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: colors.white,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.black,
  },
  filterButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.darkGray,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.white,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
cardHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},
clinicName: {
  flex: 1,
  fontSize: 16,
  fontWeight: '600',
  color: colors.black,
  marginRight: 8,
},
metaContainer: {
  flexDirection: 'row',
  gap: 6,
},
ratingPill: {
  backgroundColor: colors.furLight,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 6,
  paddingVertical: 3,
  borderRadius: 10,
  minWidth: 40,
  justifyContent: 'center',
},
distancePill: {
  backgroundColor: colors.primary,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 6,
  paddingVertical: 3,
  borderRadius: 10,
},
ratingText: {
  color: colors.white,
  fontSize: 12,
  marginRight: 2,
},
distanceText: {
  color: colors.white,
  fontSize: 12,
  marginLeft: 2,
},
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginRight: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
infoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 6,
  gap: 6,
},
infoText: {
  flex: 1,
  color: colors.darkGray,
  fontSize: 13,
},
  infoText: {
    color: colors.darkGray,
    fontSize: 14,
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  doctorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  doctorBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  doctorName: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  doctorSpecialty: {
    color: colors.darkGray,
    fontSize: 10,
  },
  moreDoctorsBadge: {
    backgroundColor: colors.mediumGray,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  moreDoctorsText: {
    color: colors.darkGray,
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  mapButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  directionsButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  mapContainer: {
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: colors.primary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIllustration: {
    backgroundColor: colors.lightGray,
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  offlineText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  divider: {
  height: 1,
  backgroundColor: colors.mediumGray,
  marginHorizontal: 16,
  marginBottom: 8,
},
});
export default VeterinaryFinder;