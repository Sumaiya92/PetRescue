import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const DonationComponent = ({ onDonationRedirect }) => {
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const organizations = [
    {
      id: 'hsus',
      name: 'Humane Society',
      url: 'https://www.humanesociety.org/donate',
      icon: 'paw',
      description: 'Fighting for all animals through rescue, advocacy, and education.'
    },
    {
      id: 'aspca',
      name: 'ASPCA',
      url: 'https://www.aspca.org/donate',
      icon: 'dog',
      description: 'Provides life-saving protection to animals in need.'
    },
    {
      id: 'bestfriends',
      name: 'Best Friends',
      url: 'https://bestfriends.org/donate',
      icon: 'heart',
      description: 'Working to end the killing of dogs and cats in shelters by 2025.'
    },
    {
      id: 'worldanimal',
      name: 'World Animal Protection',
      url: 'https://www.worldanimalprotection.org/donate',
      icon: 'earth',
      description: 'Protecting animals globally from disaster and cruelty.'
    },
    {
      id: 'animalrescue',
      name: 'Animal Rescue Foundation',
      url: 'https://www.arflife.org/donate',
      icon: 'home',
      description: 'Saving dogs and cats who have run out of time at shelters.'
    },
    {
      id: 'ifaw',
      name: 'International Fund for Animal Welfare',
      url: 'https://www.ifaw.org/donate',
      icon: 'globe-model',
      description: 'Rescues and rehabilitates animals worldwide.'
    }
  ];

  const handleDonationRedirect = () => {
    const organization = organizations.find(org => org.id === selectedOrganization);
    
    if (!organization) {
      Alert.alert("Please select an organization");
      return;
    }
    
    setIsRedirecting(true);
    
    if (onDonationRedirect) {
      onDonationRedirect({
        organization: organization.name,
        date: new Date().toISOString(),
      });
    }
    
    Linking.canOpenURL(organization.url).then(supported => {
      if (supported) {
        return Linking.openURL(organization.url);
      } else {
        Alert.alert("Cannot open URL", "Unable to open the donation page.");
      }
    }).catch(err => {
      console.error('Error opening URL:', err);
      Alert.alert("Error", "There was an error opening the donation page.");
    }).finally(() => {
      setIsRedirecting(false);
      setShowThankYou(true);
    });
  };

  const resetForm = () => {
    setSelectedOrganization('');
    setShowThankYou(false);
  };

  if (showThankYou) {
    return (
      <View style={styles.thankYouContainer}>
        <MaterialCommunityIcons name="heart-circle" color={colors.secondary} size={80} />
        <Text style={styles.thankYouTitle}>Thank You for Your Generosity!</Text>
        <Text style={styles.thankYouText}>
          Your support makes a life-changing difference for animals in need. 
          Each donation helps rescue, rehabilitate, and find forever homes.
        </Text>
        <TouchableOpacity
          style={styles.donateAgainButton}
          onPress={resetForm}
        >
          <Text style={styles.donateAgainButtonText}>Support Another Cause</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Text style={styles.heroTitle}>Be Their Hero Today</Text>
        <Text style={styles.heroQuote}>
          "Saving one animal won't change the world, but for that one animal, 
          the world changes forever."
        </Text>
      </View>

      {/* Impact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Impact</Text>
        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <MaterialCommunityIcons name="shield-search" size={28} color={colors.primary} />
            <Text style={styles.impactCardText}>Rescues animals from danger</Text>
          </View>
          <View style={styles.impactCard}>
            <MaterialCommunityIcons name="medical-bag" size={28} color={colors.success} />
            <Text style={styles.impactCardText}>Provides medical care</Text>
          </View>
          <View style={styles.impactCard}>
            <MaterialCommunityIcons name="home-heart" size={28} color={colors.secondary} />
            <Text style={styles.impactCardText}>Finds loving homes</Text>
          </View>
          <View style={styles.impactCard}>
            <MaterialCommunityIcons name="food-apple" size={28} color={colors.furLight} />
            <Text style={styles.impactCardText}>Offers nutrition</Text>
          </View>
        </View>
      </View>

      {/* Success Story */}
      <View style={styles.storyContainer}>
        <Text style={styles.storyTitle}>Success Story</Text>
        <Text style={styles.storyText}>
          Luna was found shivering in a storm drain, scared and malnourished. 
          Thanks to donors like you, she received care and found her forever family.
        </Text>
      </View>

      {/* Organization Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Cause</Text>
        <Text style={styles.sectionSubtitle}>
          Select an organization to support their mission
        </Text>
        
        <View style={styles.organizationList}>
          {organizations.map((org) => (
            <TouchableOpacity
              key={org.id}
              style={[
                styles.organizationCard,
                selectedOrganization === org.id && styles.organizationCardSelected
              ]}
              onPress={() => setSelectedOrganization(org.id)}
            >
              <MaterialCommunityIcons 
                name={org.icon} 
                size={24} 
                color={selectedOrganization === org.id ? colors.white : colors.primary} 
              />
              <View style={styles.orgTextContainer}>
                <Text style={[
                  styles.orgName,
                  selectedOrganization === org.id && styles.orgNameSelected
                ]}>
                  {org.name}
                </Text>
                <Text style={[
                  styles.orgDesc,
                  selectedOrganization === org.id && styles.orgDescSelected
                ]}>
                  {org.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Donation Button */}
      <TouchableOpacity
        style={[
          styles.donateButton,
          !selectedOrganization && styles.donateButtonDisabled
        ]}
        onPress={handleDonationRedirect}
        disabled={!selectedOrganization || isRedirecting}
      >
        <Text style={styles.donateButtonText}>
          {isRedirecting ? 'Processing...' : 'Continue to Donate'}
        </Text>
      </TouchableOpacity>

      {/* Security Assurance */}
      <View style={styles.securityContainer}>
        <MaterialCommunityIcons name="shield-check" size={18} color={colors.darkGray} />
        <Text style={styles.securityText}>
          Secure connection to the organization's official donation page
        </Text>
      </View>
    </ScrollView>
  );
};

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  contentContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  heroContainer: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroQuote: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 16,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impactCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  impactCardText: {
    fontSize: 14,
    color: colors.black,
    marginTop: 8,
    textAlign: 'center',
  },
  storyContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  storyText: {
    fontSize: 15,
    color: colors.black,
    lineHeight: 22,
  },
  organizationList: {
    marginTop: 8,
  },
  organizationCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  organizationCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  orgTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 4,
  },
  orgNameSelected: {
    color: colors.white,
  },
  orgDesc: {
    fontSize: 13,
    color: colors.darkGray,
    lineHeight: 18,
  },
  orgDescSelected: {
    color: colors.mediumGray,
  },
  donateButton: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  donateButtonDisabled: {
    backgroundColor: colors.mediumGray,
    shadowColor: 'transparent',
  },
  donateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 13,
    color: colors.darkGray,
    marginLeft: 6,
  },
  thankYouContainer: {
    flex: 1,
    padding: 32,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  thankYouText: {
    fontSize: 16,
    color: colors.black,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  donateAgainButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  donateAgainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default DonationComponent;