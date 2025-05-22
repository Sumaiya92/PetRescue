import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// Refined color palette with professional tones
const colors = {
  primary: '#4A6FA5',
  primaryLight: '#E8F0FE',
  primaryDark: '#2C4A7A',
  accent: '#3E7BFA',     // New blue accent color instead of orange
  accentLight: '#E5EDFF', // Light version of accent
  white: '#FFFFFF',
  lightGray: '#F5F7FA',
  mediumGray: '#E1E5EB',
  darkGray: '#6B7C93',
  black: '#2D3748',
};

const FloatingButtonGroup = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // Get safe area insets
  
  return (
    <>
      {/* Transparent Scanner Button */}
      <TouchableOpacity
        style={[
          styles.transparentButton,
          { top: insets.top + 8 }
        ]}
        onPress={() => {
          console.log('Scanner pressed');
          navigation.navigate('PetScanner');
        }}
      >
        <View style={styles.scannerButtonInner}>
          <Ionicons name="scan" size={26} color={colors.white} />
        </View>
      </TouchableOpacity>
      
      {/* Enhanced Chat Button - Larger and more polished */}
      <TouchableOpacity
        style={[styles.button, styles.chatButton]}
        onPress={() => {
          console.log('Chat pressed');
          navigation.navigate('SupportTab', { screen: 'Chatbot' });
        }}
      >
        <View style={styles.chatButtonInner}>
          <View style={styles.avatarContainer}>
            <Image
                source={require('../assets/hey.png')}
                style={styles.avatarImage}
                resizeMode="contain"

              />
          
          </View>
        </View>
        
        {/* Optional subtle pulse animation effect */}
        <View style={styles.pulseEffect} />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 72, // Increased from 64
    height: 72, // Increased from 64
    borderRadius: 36, // Half of width/height
    justifyContent: 'center',
    alignItems: 'center',
    right: 20,
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  transparentButton: {
    position: 'absolute',
    right: 20,
    zIndex: 9999,
  },
scannerButtonInner: {
  width: 48,
  height: 48,
  borderRadius: 24,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent', // ✅ Fully transparent background
  borderWidth: 0,                 // ✅ No border
  elevation: 0,                   // ✅ Optional: remove shadow if not needed
  shadowColor: 'transparent',    // ✅ Optional: remove shadow for full transparency
},

  chatButton: {
    bottom: 70,
    backgroundColor: colors.primary, // Using our new accent blue
    borderWidth: 3,
    borderColor: colors.white,
    // Adding a gradient-like effect with box-shadow
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  chatButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarContainer: {
    width: 62, // Increased
    height: 62, // Increased
    borderRadius: 31,
    backgroundColor: 'rgba(62, 123, 250, 0.15)', // Using accent color
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: 54, // Increased from 42
    height: 54, // Increased from 42
    borderRadius: 27,
    backgroundColor: colors.white, // White background for clean look
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures image stays within bounds
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarImage: {
    width: 100,
    height: 70,
    borderRadius: 28,
  },
  pulseEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(62, 123, 250, 0.4)', // Subtle pulse ring
    opacity: 0.7,
  },
  notification: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent, // Changed from orange/secondary
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  notificationText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default FloatingButtonGroup; 