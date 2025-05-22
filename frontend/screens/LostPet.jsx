import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import BASE_URL from "./config";

// Beautiful color palette for pet application
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

const defaultImage = 'https://via.placeholder.com/300';

const LostPetDetails = ({ route, navigation }) => {
  const { petId, petData } = route.params || {};
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (petData) {
      setPet(petData);
      setLoading(false);
    } else if (petId) {
      fetchPetDetails();
    } else {
      setError('No pet data available.');
      setLoading(false);
    }
  }, [petId]);

  const fetchPetDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/lostfound/${petId}`);
      if (!response.ok) throw new Error('Pet not found');
      const data = await response.json();
      setPet(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching lost pet details:', error);
      setError('Failed to load pet details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading pet details...</Text>
      </View>
    );
  }

  if (error || !pet) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={50} color={colors.danger} />
        <Text style={styles.errorText}>{error || 'Pet not found'}</Text>
        <TouchableOpacity 
          style={styles.tryAgainButton}
          onPress={() => petId && fetchPetDetails()}
        >
          <Text style={styles.tryAgainButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format the last seen date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine status color based on pet status
  const getStatusColor = () => {
    if (pet.status === 'found' || pet.isFound) {
      return colors.success;
    } else if (pet.isClaimed) {
      return colors.info;
    } else {
      return colors.warning;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        {/* Pet Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ 
              uri: pet.image?.startsWith('http') || pet.image?.startsWith('https')
                ? pet.image 
                : pet.image ? `${BASE_URL}/${pet.image.replace(/\\/g, '/')}` : defaultImage
            }} 
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <View style={[styles.statusBadgeTop, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
              {pet.status === 'found' ? 'FOUND' : 'LOST'}
              {pet.isFound && pet.status === 'lost' && ' (FOUND)'}
              {pet.isClaimed && pet.status === 'found' && ' (CLAIMED)'}
            </Text>
          </View>
        </View>

        {/* Pet Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.header}>
            <Text style={styles.name}>{pet.name || 'Unknown Name'}</Text>
            <View style={styles.pawIconContainer}>
              <MaterialIcons name="pets" size={24} color={colors.primary} />
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="category" size={20} color={colors.white} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoText}>{pet.type || 'Unknown'}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="pets" size={20} color={colors.white} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Breed</Text>
                <Text style={styles.infoText}>{pet.breed || 'Unknown breed'}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="cake" size={20} color={colors.white} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoText}>{pet.age || 'Unknown age'}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="wc" size={20} color={colors.white} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoText}>{pet.gender || 'Unknown'}</Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="description" size={22} color={colors.primary} />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <View style={styles.sectionContentContainer}>
              <Text style={styles.sectionContent}>
                {pet.description || 'No description provided.'}
              </Text>
            </View>
          </View>

          {/* Last Seen Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={22} color={colors.primary} />
              <Text style={styles.sectionTitle}>Last Seen</Text>
            </View>
            <View style={styles.sectionContentContainer}>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Location:</Text>
                <Text style={styles.locationValue}>
                  {pet.lastSeenLocation || pet.location || 'Unknown location'}
                </Text>
              </View>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Date:</Text>
                <Text style={styles.locationValue}>
                  {pet.lastSeenDate ? formatDate(pet.lastSeenDate) : 'Unknown date'}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="contact-phone" size={22} color={colors.primary} />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            <View style={styles.sectionContentContainer}>
              <Text style={styles.sectionContent}>
                {pet.status === 'lost' 
                  ? pet.OwnercontactInfo || 'No contact information provided.'
                  : pet.findercontactInfo || 'No contact information provided.'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {pet.status === 'lost' && !pet.isFound && (
            <TouchableOpacity 
              style={styles.foundButton}
              onPress={() => navigation.navigate('ReportFound', { lostPet: pet })}
            >
              <MaterialIcons name="search" size={20} color={colors.white} style={styles.buttonIcon} />
              <Text style={styles.foundButtonText}>I Found This Pet</Text>
            </TouchableOpacity>
          )}

          {/* Share Button */}
         
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  statusBadgeTop: {
    position: 'absolute',
    top: 40,
    right: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 3,
  },
  detailsCard: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: -50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
  },
  pawIconContainer: {
    padding: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 30,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  statusText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  infoItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIconContainer: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 15,
    color: colors.black,
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sectionContentContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 16,
  },
  sectionContent: {
    color: colors.black,
    lineHeight: 22,
    fontSize: 15,
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  locationLabel: {
    fontWeight: '600',
    color: colors.black,
    fontSize: 15,
    width: 80,
  },
  locationValue: {
    flex: 1,
    color: colors.black,
    fontSize: 15,
  },
  foundButton: {
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
  },
  foundButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  shareButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.lightGray,
  },
  loadingText: {
    marginTop: 16,
    color: colors.darkGray,
    fontSize: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  tryAgainButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  tryAgainButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollContent: {
  paddingBottom: 100, // Enough space above tab bar
},
});

export default LostPetDetails;