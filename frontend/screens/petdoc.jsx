import React, { useState, useEffect } from 'react';
import API_URL from './config';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate,
  Easing
} from 'react-native-reanimated';

// Professional color palette
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

const PetDoctorConsult = () => {
  // Animation values
  const animationProgress = useSharedValue(0);
  const resultOpacity = useSharedValue(0);
  
  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    petType: '',
    breed: '',
    age: '',
    weight: '',
    symptoms: '',
    symptomDuration: '',
    behavior: '',
    eatingHabits: '',
    previousConditions: '',
    petName: '',
  });

  // Results state
  const [vetResults, setVetResults] = useState(null);
  
  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', address: '' });

  // Pet type options
  const petTypes = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea pig', 'fish', 'reptile', 'other'];

  // Form steps configuration
  const formSteps = [
    {
      title: 'Pet Information',
      fields: [
        { key: 'petName', label: 'Pet Name', type: 'text' },
        { key: 'petType', label: 'Pet Type', type: 'picker', options: petTypes },
        { key: 'breed', label: 'Breed', type: 'text' },
        { key: 'age', label: 'Age', type: 'text' },
        { key: 'weight', label: 'Weight (lbs/kg)', type: 'text' },
      ],
    },
    {
      title: 'Symptoms',
      fields: [
        { key: 'symptoms', label: 'What symptoms is your pet showing?', type: 'textarea' },
        { key: 'symptomDuration', label: 'How long has this been happening?', type: 'text' },
      ],
    },
    {
      title: 'Additional Information',
      fields: [
        { key: 'behavior', label: 'Any behavior changes?', type: 'textarea' },
        { key: 'eatingHabits', label: 'Changes in eating or drinking?', type: 'textarea' },
        { key: 'previousConditions', label: 'Previous medical conditions', type: 'textarea' },
      ],
    },
  ];

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      // Load emergency contacts
      const contacts = await AsyncStorage.getItem('emergencyContacts');
      if (contacts) {
        setEmergencyContacts(JSON.parse(contacts));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  // Handle input changes
  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  // Next step handler
  const handleNextStep = () => {
    // Validate current step
    const currentFields = formSteps[currentStep].fields;
    const requiredFields = currentFields.filter(field => 
      (currentStep === 0 && (field.key === 'petType' || field.key === 'age' || field.key === 'petName')) || 
      (currentStep === 1 && field.key === 'symptoms')
    );
    
    const missingFields = requiredFields.filter(field => !formData[field.key]);
    
    if (missingFields.length > 0) {
      Alert.alert(
        "Missing Information",
        `Please fill in ${missingFields.map(f => f.label).join(', ')}`,
        [{ text: "OK" }]
      );
      return;
    }
    
    // Move to next step or submit
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      animationProgress.value = withTiming((currentStep + 1) / formSteps.length);
    } else {
      submitForm();
    }
  };

  // Go back to previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      animationProgress.value = withTiming((currentStep - 1) / formSteps.length);
    }
  };

  // Submit form to API using fetch
  const submitForm = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pet-doctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to get advice");
      }

      if (data.success) {
        setVetResults(data);
        resultOpacity.value = withTiming(1, { duration: 500 });
      } else {
        Alert.alert("Error", data.message || "Failed to get advice");
      }
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert(
        "Connection Error",
        "We couldn't connect to Dr. Paws. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset the consultation
  const handleReset = () => {
    setFormData({
      petType: '',
      breed: '',
      age: '',
      weight: '',
      symptoms: '',
      symptomDuration: '',
      behavior: '',
      eatingHabits: '',
      previousConditions: '',
      petName: '',
    });
    setCurrentStep(0);
    setVetResults(null);
    animationProgress.value = withTiming(0);
    resultOpacity.value = withTiming(0);
  };

  // Google search integration
  const searchOnGoogle = (query) => {
    let searchQuery = query || formData.symptoms;
    if (formData.petType) {
      searchQuery = `${formData.petType} ${searchQuery}`;
    }
    
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    Linking.canOpenURL(googleUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(googleUrl);
        } else {
          Alert.alert("Error", "Cannot open Google search");
        }
      })
      .catch(err => {
        console.error('Error opening Google search:', err);
        Alert.alert("Error", "Failed to open Google search");
      });
  };

  // Emergency contact functions
  const saveEmergencyContact = async () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert("Error", "Name and phone number are required");
      return;
    }
    
    const updatedContacts = [...emergencyContacts, { ...newContact, id: Date.now().toString() }];
    setEmergencyContacts(updatedContacts);
    await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    
    setNewContact({ name: '', phone: '', address: '' });
    setShowEmergencyModal(false);
  };

  const callEmergencyContact = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const deleteEmergencyContact = async (id) => {
    const updatedContacts = emergencyContacts.filter(contact => contact.id !== id);
    setEmergencyContacts(updatedContacts);
    await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
  };

  // Urgency level colors and labels
  const urgencyConfig = {
    low: { color: colors.success, icon: '✓', label: 'Low Urgency' },
    medium: { color: colors.warning, icon: '⚠️', label: 'Medium Urgency' },
    high: { color: colors.secondary, icon: '❗', label: 'High Urgency' },
    emergency: { color: colors.danger, icon: '🚨', label: 'Emergency' },
  };

  // Animation styles
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${interpolate(animationProgress.value, [0, 1], [0, 100], Extrapolate.CLAMP)}%`,
    };
  });

  const resultContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: resultOpacity.value,
      transform: [{ translateY: interpolate(resultOpacity.value, [0, 1], [50, 0], Extrapolate.CLAMP) }],
    };
  });

  // Render the current form step with a more conversational UI
  const renderFormStep = () => {
    const currentStepData = formSteps[currentStep];
    
    return (
      <View style={styles.conversationalContainer}>
        <Text style={styles.conversationTitle}>
          {currentStep === 0 ? "Tell me about your pet" : 
           currentStep === 1 ? "What's troubling your pet?" : 
           "Let's gather a bit more information"}
        </Text>
        
        {currentStepData.fields.map((field) => (
          <View key={field.key} style={styles.conversationField}>
            <Text style={styles.conversationQuestion}>{field.label}</Text>
            
            {field.type === 'picker' ? (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData[field.key]}
                  onValueChange={(value) => handleChange(field.key, value)}
                  style={styles.conversationPicker}
                >
                  <Picker.Item label="Select..." value="" color={colors.darkGray} />
                  {field.options.map((option) => (
                    <Picker.Item 
                      key={option} 
                      label={option.charAt(0).toUpperCase() + option.slice(1)} 
                      value={option} 
                      color={colors.black}
                    />
                  ))}
                </Picker>
              </View>
            ) : field.type === 'textarea' ? (
              <TextInput
                style={styles.conversationTextarea}
                value={formData[field.key]}
                onChangeText={(text) => handleChange(field.key, text)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                placeholderTextColor={colors.darkGray}
                multiline
                textAlignVertical="top"
              />
            ) : (
              <TextInput
                style={styles.conversationInput}
                value={formData[field.key]}
                onChangeText={(text) => handleChange(field.key, text)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                placeholderTextColor={colors.darkGray}
                keyboardType={field.key === 'age' || field.key === 'weight' ? 'numeric' : 'default'}
              />
            )}
          </View>
        ))}

        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handlePrevStep}>
              <Ionicons name="arrow-back" size={20} color={colors.white} />
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>
                {currentStep === formSteps.length - 1 ? 'Get Advice' : 'Continue'}
              </Text>
              {currentStep < formSteps.length - 1 && (
                <Ionicons name="arrow-forward" size={20} color={colors.white} style={styles.buttonIcon} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render results
  const renderResults = () => {
    if (!vetResults) return null;
    
    const urgency = urgencyConfig[vetResults.urgencyLevel] || urgencyConfig.medium;
    
    return (
      <Animated.View style={[styles.resultsContainer, resultContainerStyle]}>
        <View style={[styles.urgencyBanner, { backgroundColor: urgency.color }]}>
          <Text style={styles.urgencyText}>
            {urgency.icon} {urgency.label}
          </Text>
        </View>
        
        <View style={styles.resultCard}>
          <Text style={styles.resultHeading}>Dr. Paws' Assessment</Text>
          <View style={styles.resultContent}>
            <Text style={styles.resultText}>{vetResults.advice}</Text>
          </View>
        </View>
        
        <View style={styles.resultCard}>
          <Text style={styles.resultHeading}>Home Care Recommendations</Text>
          <View style={styles.resultContent}>
            {vetResults.homeRemedies.map((remedy, index) => (
              <View key={index} style={styles.remedyItem}>
                <Text style={styles.remedyBullet}>•</Text>
                <Text style={styles.remedyText}>{remedy}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.resultCard}>
          <Text style={styles.resultHeading}>Veterinary Recommendation</Text>
          <View style={styles.resultContent}>
            <Text style={styles.resultText}>{vetResults.vetRecommendation}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.googleButton]}
            onPress={() => searchOnGoogle(`${formData.petType} ${formData.symptoms} treatment`)}
          >
            <Ionicons name="search" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Google Symptoms</Text>
          </TouchableOpacity>
          
          {emergencyContacts.length > 0 && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.emergencyButton]}
              onPress={() => callEmergencyContact(emergencyContacts[0].phone)}
            >
              <Ionicons name="call" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Call Vet</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.newConsultButton} onPress={handleReset}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>New Consultation</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render emergency contacts modal
  const renderEmergencyContactsModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEmergencyModal}
        onRequestClose={() => setShowEmergencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Emergency Contacts</Text>
              <TouchableOpacity onPress={() => setShowEmergencyModal(false)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {emergencyContacts.map((contact) => (
                <View key={contact.id} style={styles.contactItem}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                    {contact.address && <Text style={styles.contactAddress}>{contact.address}</Text>}
                  </View>
                  
                  <View style={styles.contactActions}>
                    <TouchableOpacity 
                      style={styles.contactActionButton}
                      onPress={() => callEmergencyContact(contact.phone)}
                    >
                      <Ionicons name="call" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.contactActionButton}
                      onPress={() => deleteEmergencyContact(contact.id)}
                    >
                      <Ionicons name="trash" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              <View style={styles.addContactForm}>
                <Text style={styles.addContactTitle}>Add New Contact</Text>
                
                <TextInput
                  style={styles.input}
                  value={newContact.name}
                  onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                  placeholder="Name"
                  placeholderTextColor={colors.darkGray}
                />
                
                <TextInput
                  style={styles.input}
                  value={newContact.phone}
                  onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                  placeholder="Phone Number"
                  placeholderTextColor={colors.darkGray}
                  keyboardType="phone-pad"
                />
                
                <TextInput
                  style={styles.input}
                  value={newContact.address}
                  onChangeText={(text) => setNewContact({ ...newContact, address: text })}
                  placeholder="Address (optional)"
                  placeholderTextColor={colors.darkGray}
                />
                
                <TouchableOpacity 
                  style={styles.addContactButton}
                  onPress={saveEmergencyContact}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>Save Contact</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <Image
                  source={{ uri: 'https://img.freepik.com/premium-photo/clipart-picture-doctor-dog-cartoon-character_977617-78931.jpg' }}
                  style={styles.logo}
                />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Dr. Paws</Text>
                  <Text style={styles.headerSubtitle}>Virtual Pet Consultation</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.actionStrip}>
            <TouchableOpacity 
              style={styles.actionStripButton}
              onPress={() => setShowEmergencyModal(true)}
            >
              <Ionicons name="medical" size={20} color={colors.primary} />
              <Text style={styles.actionStripText}>Emergency Contacts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionStripButton}
              onPress={() => searchOnGoogle("emergency vet near me")}
            >
              <Ionicons name="search" size={20} color={colors.primary} />
              <Text style={styles.actionStripText}>Find Vet</Text>
            </TouchableOpacity>
          </View>

          {!vetResults && (
            <View style={styles.progressIndicator}>
              <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, progressBarStyle]} />
              </View>
              <Text style={styles.progressText}>
                Step {currentStep + 1} of {formSteps.length}
              </Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Consulting Dr. Paws...</Text>
            </View>
          ) : vetResults ? (
            renderResults()
          ) : (
            renderFormStep()
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      {renderEmergencyContactsModal()}
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  
  // Header Styles
  headerContainer: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    marginRight: 15,
    borderWidth: 2,
    borderColor: colors.white,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.primaryLight,
  },
  
  // Action Strip
  actionStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderRadius: 15,
    marginHorizontal: 15,
    marginTop: -15,
    padding: 10,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionStripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  actionStripText: {
    marginLeft: 5,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Progress Indicator
  progressIndicator: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.mediumGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    color: colors.darkGray,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  
  // Conversational UI
  conversationalContainer: {
    backgroundColor: colors.white,
    borderRadius: 15,
    marginTop: 20,
    marginHorizontal: 15,
    padding: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  conversationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 20,
  },
  conversationField: {
    marginBottom: 20,
  },
  conversationQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  conversationInput: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.black,
  },
  conversationTextarea: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.black,
    minHeight: 100,
  },
  pickerWrapper: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 10,
    overflow: 'hidden',
  },
  conversationPicker: {
    width: '100%',
    height: 50,
  },
  
  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  nextButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonIcon: {
    marginLeft: 5,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Results
  resultsContainer: {
    marginTop: 20,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
urgencyBanner: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  urgencyText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    marginTop: 15,
    padding: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  resultHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  resultContent: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 15,
  },
  resultText: {
    fontSize: 16,
    color: colors.black,
    lineHeight: 22,
  },
  remedyItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  remedyBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    fontWeight: 'bold',
  },
  remedyText: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  googleButton: {
    backgroundColor: colors.info,
  },
  emergencyButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 5,
  },
  newConsultButton: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
  modalContent: {
    padding: 20,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  contactPhone: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 4,
  },
  contactAddress: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 4,
  },
  contactActions: {
    flexDirection: 'row',
  },
  contactActionButton: {
    padding: 8,
    marginLeft: 10,
  },
  addContactForm: {
    marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  addContactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 15,
  },
  input: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  addContactButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
});
export default PetDoctorConsult;