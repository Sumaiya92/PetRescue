import React, { useState } from 'react';
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
  Dimensions 
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

const ContactScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Your message has been sent!');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Contact error:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />
      
      {/* Enhanced Header with Background Pattern */}
      <View style={styles.headerContainer}>
        <ImageBackground 
          source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} // Replace with actual pattern image
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.backButtonContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Get in Touch</Text>
              <Text style={styles.headerSubtitle}>We'd love to hear from you about pet adoption!</Text>
            </View>
            
          
          </View>
        </ImageBackground>
        
        <View style={styles.headerCurve} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={colors.darkGray}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.darkGray}
              value={email}
              keyboardType="email-address"
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Question about adoption"
              placeholderTextColor={colors.darkGray}
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Type your message here..."
              placeholderTextColor={colors.darkGray}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>Send Message</Text>
            <Ionicons name="send" size={20} color={colors.white} style={styles.sendIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.contactInfoCard}>
          <Text style={styles.contactInfoTitle}>Other Ways to Reach Us</Text>
          
          <View style={styles.contactMethod}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.contactMethodLabel}>Email</Text>
              <Text style={styles.contactMethodValue}>contact@petadoption.com</Text>
            </View>
          </View>
          
          <View style={styles.contactMethod}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="call" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.contactMethodLabel}>Phone</Text>
              <Text style={styles.contactMethodValue}>(123) 456-7890</Text>
            </View>
          </View>
          
          <View style={styles.contactMethod}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="location" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.contactMethodLabel}>Address</Text>
              <Text style={styles.contactMethodValue}>123 Pet Avenue, Sydney, Australia</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>We typically respond within 24 hours</Text>
        </View>
      </ScrollView>
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
    height: 180,
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
    paddingTop: 10,
  },
  headerCurve: {
    height: 30,
    backgroundColor: colors.lightGray,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    zIndex: 10,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    paddingTop: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    maxWidth: '80%',
  },
  pawPrintDecoration: {
    position: 'absolute',
    top: 30,
    right: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 5,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: colors.primaryDark,
    marginBottom: 8,
    fontWeight: '500',
    paddingLeft: 2,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: colors.black,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  textArea: {
    height: 150,
    paddingTop: 15,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 25,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  sendIcon: {
    marginLeft: 5,
  },
  contactInfoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: colors.mediumGray,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  contactInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 15,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactMethodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 2,
  },
  contactMethodValue: {
    fontSize: 15,
    color: colors.black,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  footerText: {
    color: colors.darkGray,
    fontSize: 14,
  },
});

export default ContactScreen;