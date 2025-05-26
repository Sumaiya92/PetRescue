import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Modal,
  Animated,
  Platform,
  Keyboard,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BASE_URL from './config';

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

const SCREEN_WIDTH = Dimensions.get('window').width;
const MESSAGE_MAX_LENGTH = 500;

const ContactScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isOffline, setIsOffline] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState(null);
  const [validFields, setValidFields] = useState({});
  
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Auto-save draft (simulation - in real app would use AsyncStorage)
  const [draftSaved, setDraftSaved] = useState(false);
  
  useEffect(() => {
    // Simulate checking network status
    const checkConnection = () => {
      setIsOffline(false); // Simulate online for demo
    };
    checkConnection();
  }, []);
  
  // Auto-save draft every 10 seconds if there's content
  useEffect(() => {
    const timer = setTimeout(() => {
      if (name || email || subject || message) {
        setDraftSaved(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }, 2000);
        });
        setTimeout(() => setDraftSaved(false), 2500);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [name, email, subject, message]);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};
    const valid = {};
    
    if (!name.trim()) {
      errors.name = 'Name required';
    } else if (name.trim().length < 2) {
      errors.name = 'Min 2 characters';
    } else {
      valid.name = true;
    }
    
    if (!email.trim()) {
      errors.email = 'Email required';
    } else if (!validateEmail(email)) {
      errors.email = 'Invalid email';
    } else {
      valid.email = true;
    }
    
    if (!subject.trim()) {
      errors.subject = 'Subject required';
    } else if (subject.trim().length < 3) {
      errors.subject = 'Min 3 characters';
    } else {
      valid.subject = true;
    }
    
    if (!message.trim()) {
      errors.message = 'Message required';
    } else if (message.trim().length < 10) {
      errors.message = 'Min 10 characters';
    } else {
      valid.message = true;
    }
    
    setFieldErrors(errors);
    setValidFields(valid);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPress = () => {
    Keyboard.dismiss();
    if (!validateForm()) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    
    if (isOffline) {
      Alert.alert(
        'No Connection', 
        'Check your internet and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    
    setLastSentMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim()
    });

    try {
      const response = await fetch(`${BASE_URL}/send-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          subject: subject.trim(), 
          message: message.trim() 
        }),
        timeout: 15000
      });

      if (response.ok) {
        setIsLoading(false);
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
          setFieldErrors({});
          setValidFields({});
        }, 3000);
      } else {
        const errorData = await response.json();
        setIsLoading(false);
        Alert.alert(
          'Send Failed', 
          errorData.error || 'Failed to send. Try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Contact error:', error);
      
      let errorMessage = 'Something went wrong. Try again.';
      if (error.name === 'TimeoutError') {
        errorMessage = 'Request timed out. Check connection.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Check connection.';
      }
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:contact@petadoption.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+61234567890');
  };

  const getCharacterCountColor = () => {
    const remaining = MESSAGE_MAX_LENGTH - message.length;
    if (remaining < 50) return colors.danger;
    if (remaining < 100) return colors.warning;
    return colors.darkGray;
  };

  const renderInput = (value, onChangeText, placeholder, label, error, isValid, options = {}) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {isValid && (
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
        )}
      </View>
      <TextInput
        style={[
          styles.input, 
          error && styles.inputError,
          isValid && styles.inputValid,
          options.multiline && styles.textArea
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.darkGray}
        value={value}
        onChangeText={onChangeText}
        accessible={true}
        accessibilityLabel={label}
        accessibilityHint={error || `Enter your ${label.toLowerCase()}`}
        {...options}
      />
      {error && (
        <Text style={styles.errorText}>
          <Ionicons name="warning" size={12} color={colors.danger} /> {error}
        </Text>
      )}
      {options.showCharCount && (
        <Text style={[styles.charCount, { color: getCharacterCountColor() }]}>
          {value.length}/{MESSAGE_MAX_LENGTH}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />
      
      {/* Compact Header */}
      <View style={styles.headerContainer}>
        <ImageBackground 
          source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                accessible={true}
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
              
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Contact Us</Text>
                <Text style={styles.headerSubtitle}>Get help with pet adoption</Text>
              </View>
              
              {isOffline && (
                <View style={styles.offlineIndicator}>
                  <Ionicons name="cloud-offline" size={16} color={colors.white} />
                </View>
              )}
            </View>
          </View>
        </ImageBackground>
        <View style={styles.headerCurve} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Draft saved indicator */}
          {draftSaved && (
            <Animated.View style={[styles.draftSavedIndicator, { opacity: fadeAnim }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.draftSavedText}>Draft saved</Text>
            </Animated.View>
          )}

          {renderInput(
            name, 
            setName, 
            "Your full name", 
            "Name", 
            fieldErrors.name,
            validFields.name,
            { autoCapitalize: 'words' }
          )}

          {renderInput(
            email, 
            setEmail, 
            "your@email.com", 
            "Email", 
            fieldErrors.email,
            validFields.email,
            { 
              keyboardType: 'email-address',
              autoCapitalize: 'none',
              autoCompleteType: 'email'
            }
          )}

          {renderInput(
            subject, 
            setSubject, 
            "What's this about?", 
            "Subject", 
            fieldErrors.subject,
            validFields.subject
          )}

          {renderInput(
            message, 
            (text) => {
              if (text.length <= MESSAGE_MAX_LENGTH) {
                setMessage(text);
              }
            }, 
            "Tell us how we can help...", 
            "Message", 
            fieldErrors.message,
            validFields.message,
            { 
              multiline: true,
              numberOfLines: 4,
              textAlignVertical: 'top',
              maxLength: MESSAGE_MAX_LENGTH,
              showCharCount: true
            }
          )}

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
            onPress={handleSubmitPress}
            activeOpacity={0.85}
            disabled={isLoading}
            accessible={true}
            accessibilityLabel="Send message"
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.submitButtonText}>Sending...</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Send Message</Text>
                <Ionicons name="send" size={18} color={colors.white} style={styles.sendIcon} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Compact Contact Info */}
        <View style={styles.contactInfoCard}>
          <Text style={styles.contactInfoTitle}>Quick Contact</Text>
          
          <TouchableOpacity 
            style={styles.contactMethod} 
            onPress={handleEmailPress}
            accessible={true}
            accessibilityLabel="Send email"
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail" size={20} color={colors.primary} />
            </View>
            <View style={styles.contactMethodContent}>
              <Text style={styles.contactMethodLabel}>Email</Text>
              <Text style={styles.contactMethodValue}>contact@petadoption.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactMethod} 
            onPress={handlePhonePress}
            accessible={true}
            accessibilityLabel="Make phone call"
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="call" size={20} color={colors.primary} />
            </View>
            <View style={styles.contactMethodContent}>
              <Text style={styles.contactMethodLabel}>Phone</Text>
              <Text style={styles.contactMethodValue}>(123) 456-7890</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.darkGray} />
          </TouchableOpacity>
          
          <View style={styles.contactMethod}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.contactMethodContent}>
              <Text style={styles.contactMethodLabel}>Visit Us</Text>
              <Text style={styles.contactMethodValue}>123 Pet Ave, Sydney</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Response within 24 hours</Text>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="mail" size={40} color={colors.primary} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Send Message?</Text>
            <Text style={styles.modalText}>
              Send this message to our support team?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonCancel} 
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonConfirm} 
                onPress={handleConfirmSubmit}
              >
                <Text style={styles.modalButtonConfirmText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Ionicons name="checkmark-circle" size={56} color={colors.success} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Message Sent!</Text>
            <Text style={styles.modalText}>
              We've got your message and will respond within 24 hours.
            </Text>
            
            {lastSentMessage && (
              <View style={styles.messageSummary}>
                <Text style={styles.messageSummaryTitle}>Your Message:</Text>
                <Text style={styles.messageSummaryText}>
                  <Text style={styles.messageSummaryLabel}>From:</Text> {lastSentMessage.name}
                </Text>
                <Text style={styles.messageSummaryText}>
                  <Text style={styles.messageSummaryLabel}>Subject:</Text> {lastSentMessage.subject}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.modalButtonConfirm} 
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonConfirmText}>Done</Text>
            </TouchableOpacity>
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
  headerContainer: {
    position: 'relative',
    height: 140, // Reduced from 180
    zIndex: 1,
  },
  headerBackground: {
    width: '100%',
    height: '100%',
  },
  headerBackgroundImage: {
    opacity: 0.1,
  },
  headerOverlay: {
    backgroundColor: colors.primary,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20, // Added proper spacing from status bar
  },
  headerCurve: {
    height: 25, // Reduced curve
    backgroundColor: colors.lightGray,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24, // Reduced from 28
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4, // Reduced spacing
  },
  headerSubtitle: {
    fontSize: 14, // Reduced from 16
    color: colors.white,
    opacity: 0.9,
  },
  offlineIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: 30, // Reduced
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 5,
  },
  draftSavedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success + '20',
    borderRadius: 6,
    padding: 6,
    marginBottom: 12,
  },
  draftSavedText: {
    color: colors.success,
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 12, // Reduced spacing
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 15, // Reduced from 16
    color: colors.primaryDark,
    fontWeight: '500',
    paddingLeft: 2,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 10, // Slightly reduced
    padding: 12, // Reduced padding
    fontSize: 15, // Reduced from 16
    color: colors.black,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  inputValid: {
    borderColor: colors.success,
    borderWidth: 1.5,
  },
  textArea: {
    height: 120, // Reduced from 150
    paddingTop: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 4,
    paddingLeft: 2,
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
    paddingRight: 2,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 15, // Reduced padding
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.darkGray,
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    marginRight: 6,
  },
  sendIcon: {
    marginLeft: 4,
  },
  contactInfoCard: {
    backgroundColor: colors.white,
    borderRadius: 12, // Reduced from 16
    padding: 16, // Reduced from 20
    marginHorizontal: 20,
    shadowColor: colors.mediumGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  contactInfoTitle: {
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Reduced from 15
    paddingVertical: 4,
  },
  contactIconContainer: {
    width: 36, // Reduced from 40
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactMethodContent: {
    flex: 1,
  },
  contactMethodLabel: {
    fontSize: 12, // Reduced from 14
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 1,
  },
  contactMethodValue: {
    fontSize: 14, // Reduced from 15
    color: colors.black,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  footerText: {
    color: colors.darkGray,
    fontSize: 12, // Reduced from 14
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20, // Reduced from 24
    alignItems: 'center',
    minWidth: SCREEN_WIDTH * 0.75, // Reduced from 0.8
    maxWidth: 350,
  },
  successModalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: SCREEN_WIDTH * 0.75,
    maxWidth: 350,
    maxHeight: SCREEN_WIDTH * 1.0,
  },
  modalIcon: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18, // Reduced from 20
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14, // Reduced from 16
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    alignItems: 'center',
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    color: colors.darkGray,
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonConfirmText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  messageSummary: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  messageSummaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  messageSummaryText: {
    fontSize: 12,
    color: colors.black,
    marginBottom: 3,
  },
  messageSummaryLabel: {
    fontWeight: '600',
    color: colors.primaryDark,
  },
});

export default ContactScreen;