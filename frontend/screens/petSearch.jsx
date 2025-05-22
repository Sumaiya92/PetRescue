import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import API_URL from './config'; // Adjust the import based on your project structure

// Constants
const petTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Reptile', 'Other'];
const petSizes = ['Small', 'Medium', 'Large', 'X-Large'];
const encouragingQuotes = [
  "Don't lose hope! Many pets are reunited with their owners.",
  "Stay positive. Your furry friend might be just around the corner.",
  "Keep searching and spreading the word. Community helps find pets!",
  "Many pets have been found weeks after going missing. Stay strong!",
  "Your love and persistence make all the difference in finding your pet."
];

// Mock data for testing when API is not available
const mockResults = [
  {
    _id: '1',
    type: 'Dog',
    breed: 'Labrador',
    description: 'Friendly yellow lab with a blue collar. Responds to the name Max.',
    date: new Date().toISOString(),
    location: 'Central Park',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    score: 95
  },
  {
    _id: '2',
    type: 'Cat',
    breed: 'Tabby',
    description: 'Orange tabby cat with white paws. Very shy.',
    date: new Date().toISOString(),
    location: 'Downtown',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    score: 87
  }
];

const PetSearchComponent = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // To detect when screen comes into focus
  
  const [formData, setFormData] = useState({
    description: '',
    type: '',
    breed: '',
    location: '',
    color: '',
    size: '',
    distinctive_features: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [quote, setQuote] = useState(encouragingQuotes[Math.floor(Math.random() * encouragingQuotes.length)]);

  // Check if the screen is in focus to preserve search results
  useEffect(() => {
    if (isFocused) {
      // You could restore any saved search state here if needed
    }
  }, [isFocused]);

  const handleSearch = async () => {
    if (!formData.description && !formData.type && !formData.breed) {
      Alert.alert(
        "Missing Information", 
        "Please enter at least a description, type, or breed to search"
      );
      return;
    }

    setIsLoading(true);
    
    try {
      // Attempt the actual API call
      let data = [];
      
      try {
        const response = await fetch(`${API_URL}/lostfound/search-matches`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          data = await response.json();
          data = data.matches || [];
        } else {
          console.warn('API returned an error status:', response.status);
          // Fallback to mock data if API call fails
          data = mockResults;
        }
      } catch (error) {
        console.warn('API call failed, using mock data:', error);
        // Use mock data if API call fails
        data = mockResults;
      }
      
      // Add default image URLs for any pets without images
      const resultsWithImages = data.map(pet => ({
        ...pet,
        imageUrl: pet.imageUrl || pet.image || getDefaultPetImage(pet.type)
      }));
      
      setSearchResults(resultsWithImages);
      setHasSearched(true);
      
      // Refresh the quote when search is performed
      setQuote(encouragingQuotes[Math.floor(Math.random() * encouragingQuotes.length)]);
    } catch (error) {
      console.error('Error searching for pets:', error);
      Alert.alert(
        "Search Failed",
        "Unable to search for matching pets. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get default images based on pet type
  const getDefaultPetImage = (petType) => {
    const type = (petType || '').toLowerCase();
    
    switch(type) {
      case 'dog':
        return 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
      case 'cat':
        return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
      case 'bird':
        return 'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
      case 'rabbit':
        return 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
      case 'reptile':
        return 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
      default:
        return 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
    }
  };

  const navigateToAllFoundPets = () => {
    // Navigate to the Found Pets tab
    navigation.navigate('ReportTab', {
      screen: 'ReportMain',
      params: { initialTab: 'found' }
    });
  };

const navigateToPetDetails = (pet) => {
  // Correctly navigate to LostPetDetails with the pet data
  navigation.navigate('ReportTab', {
    screen: 'ReportMain',
    params: { 
      screen: 'LostPetDetails',
      params: { petData: pet }
    }
  });
}

  const resetForm = () => {
    setFormData({
      description: '',
      type: '',
      breed: '',
      location: '',
      color: '',
      size: '',
      distinctive_features: ''
    });
    setSearchResults([]);
    setHasSearched(false);
  };

  // Handler for image loading errors
  const handleImageError = (pet) => {
    // Replace failed image URL with a default one based on pet type
    const updatedResults = searchResults.map(item => {
      if (item._id === pet._id) {
        return {
          ...item,
          imageUrl: getDefaultPetImage(item.type)
        };
      }
      return item;
    });
    
    setSearchResults(updatedResults);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="paw" size={28} color="#4A80F0" />
          <Text style={styles.headerText}>Find Your Pet</Text>
        </View>

        {/* View All Found Pets Button - Positioned at top for better accessibility */}
        <View style={styles.viewAllButtonContainer}>
          <TouchableOpacity 
            style={styles.viewAllButton} 
            onPress={navigateToAllFoundPets}
          >
            <MaterialIcons name="pets" size={20} color="#FFFFFF" />
            <Text style={styles.viewAllButtonText}>
              View All Found Pets
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formLabel}>Pet Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe your pet (color, patterns, etc)"
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            multiline
          />

          <Text style={styles.formLabel}>Pet Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.type}
              onValueChange={(value) => setFormData({...formData, type: value})}
              style={styles.picker}
            >
              <Picker.Item label="Select pet type" value="" />
              {petTypes.map((type) => (
                <Picker.Item key={type} label={type} value={type.toLowerCase()} />
              ))}
            </Picker>
          </View>

          <Text style={styles.formLabel}>Breed</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter breed (if known)"
            value={formData.breed}
            onChangeText={(text) => setFormData({...formData, breed: text})}
          />

          <View style={styles.formRow}>
            <View style={styles.formHalfColumn}>
              <Text style={styles.formLabel}>Color</Text>
              <TextInput
                style={styles.input}
                placeholder="Main color(s)"
                value={formData.color}
                onChangeText={(text) => setFormData({...formData, color: text})}
              />
            </View>
            
            <View style={styles.formHalfColumn}>
              <Text style={styles.formLabel}>Size</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.size}
                  onValueChange={(value) => setFormData({...formData, size: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="Select size" value="" />
                  {petSizes.map((size) => (
                    <Picker.Item key={size} label={size} value={size.toLowerCase()} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <Text style={styles.formLabel}>Last Seen Location</Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter neighborhood or area"
              value={formData.location}
              onChangeText={(text) => setFormData({...formData, location: text})}
            />
          </View>

          <Text style={styles.formLabel}>Distinctive Features</Text>
          <TextInput
            style={styles.inputLarge}
            placeholder="Any unique markings, behaviors, or identifiers"
            value={formData.distinctive_features}
            onChangeText={(text) => setFormData({...formData, distinctive_features: text})}
            multiline
            numberOfLines={3}
          />

          <View style={styles.buttonGroupContainer}>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <MaterialIcons name="search" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Search Matches</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A80F0" />
            <Text style={styles.loadingText}>Searching for your pet...</Text>
          </View>
        )}

        {/* Results Section */}
        {hasSearched && !isLoading && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>
              {searchResults.length > 0 
                ? `Found ${searchResults.length} potential matches` 
                : "No matches found"}
            </Text>
            
            {/* Encouraging quote */}
            <View style={styles.quoteContainer}>
              <MaterialIcons name="info" size={20} color="#4A80F0" />
              <Text style={styles.quoteText}>{quote}</Text>
            </View>

            {searchResults.length > 0 ? (
              searchResults.map((pet, index) => (
                <View key={pet._id || index} style={styles.petCard}>
                  <View style={styles.petCardHeader}>
                    <Text style={styles.petCardTitle}>{pet.type || 'Unknown'} {pet.breed ? `(${pet.breed})` : ''}</Text>
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreText}>Match: {pet.score}%</Text>
                    </View>
                  </View>
                  
                  {pet.imageUrl ? (
                    <Image 
                      source={{ uri: pet.imageUrl }} 
                      style={styles.petImage}
                      resizeMode="cover"
                      onError={() => handleImageError(pet)}
                    />
                  ) : (
                    <View style={styles.noImageContainer}>
                      <MaterialCommunityIcons name="paw" size={40} color="#CCCCCC" />
                      <Text style={styles.noImageText}>No image available</Text>
                    </View>
                  )}
                  
                  <View style={styles.petCardContent}>
                    <View style={styles.petInfoRow}>
                      <Text style={styles.petInfoLabel}>Found:</Text>
                      <Text style={styles.petInfoValue}>{new Date(pet.date).toLocaleDateString()}</Text>
                    </View>
                    
                    <View style={styles.petInfoRow}>
                      <Text style={styles.petInfoLabel}>Location:</Text>
                      <Text style={styles.petInfoValue}>{pet.location || 'Unknown'}</Text>
                    </View>
                    
                    <Text style={styles.petDescription}>{pet.description}</Text>
                    
                    <TouchableOpacity 
                      style={styles.contactButton}
                      onPress={() => navigateToPetDetails(pet)}
                    >
                      <Text style={styles.contactButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No matching pets found. Try broadening your search criteria.</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Bottom padding to ensure content doesn't get hidden by tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120, // Extra padding at bottom to account for tab bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#4A6FA5',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6FA5',
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  formHalfColumn: {
    width: '48%',
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E1E5EB',
  },
  inputLarge: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E1E5EB',
  },
  pickerContainer: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E1E5EB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  locationContainer: {
    marginBottom: 16,
  },
  buttonGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  searchButton: {
    backgroundColor: '#4A80F0',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 3,
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E5EB',
    flex: 1,
  },
  resetButtonText: {
    color: '#6B7C93',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4A80F0',
    marginTop: 10,
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2D3748',
  },
  quoteContainer: {
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 14,
    color: '#4A6FA5',
    marginLeft: 8,
    flex: 1,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  petCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EB',
  },
  petCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  scoreContainer: {
    backgroundColor: '#E8F0FE',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  scoreText: {
    fontSize: 14,
    color: '#4A80F0',
    fontWeight: '600',
  },
  petImage: {
    width: '100%',
    height: 200,
  },
  noImageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  noImageText: {
    marginTop: 8,
    color: '#6B7C93',
  },
  petCardContent: {
    padding: 12,
  },
  petInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  petInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7C93',
    width: 70,
  },
  petInfoValue: {
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
  },
  petDescription: {
    fontSize: 14,
    color: '#2D3748',
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: '#4A80F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7C93',
    textAlign: 'center',
  },
  viewAllButtonContainer: {
    marginBottom: 16,
  },
  viewAllButton: {
    backgroundColor: '#FF7E5F',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 80, // Extra padding at the bottom to prevent content being hidden by tab bar
  }
});

export default PetSearchComponent;