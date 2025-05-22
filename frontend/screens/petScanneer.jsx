import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import API_URL from './config';

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


const { width } = Dimensions.get('window');

export default function PetScannerApp() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(width));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Fade in animation on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (loading) {
      // Pulse animation during loading
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading]);

  const pickImage = async () => {
    setError(null);
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      setError('Permission to access camera roll is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      animateTransition();
      setImage(pickerResult.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    setError(null);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      setError('Permission to access camera is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      animateTransition();
      setImage(pickerResult.assets[0].uri);
      setResult(null);
    }
  };

  const animateTransition = () => {
    slideAnim.setValue(width);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

 const analyzeImage = async () => {
  if (!image) {
    setError('Please select an image first');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const formData = new FormData();
    formData.append('image', {
      uri: image,
      type: 'image/jpeg',
      name: 'pet_image.jpg',
    });

    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Simulate analysis delay for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setResult(data);
  } catch (err) {
    console.error('Error analyzing image:', err);
    setError('Failed to analyze the image. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const resetScanner = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setImage(null);
      setResult(null);
      setError(null);
      fadeAnim.setValue(1);
    });
  };

  const renderWelcomeScreen = () => (
    <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[colors.primaryLight, colors.white]}
        style={styles.gradientBackground}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="paw" 
            size={80} 
            color={colors.primary} 
          />
        </View>
        
        <Text style={styles.welcomeTitle}>Pet Scanner</Text>
        <Text style={styles.welcomeSubtitle}>
          Take or select a photo to analyze pet details for adoption
        </Text>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={takePhoto}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Ionicons name="images" size={24} color="white" />
            <Text style={styles.buttonText}>Choose Photo</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderImagePreview = () => (
    <Animated.View 
      style={[
        styles.imagePreviewContainer, 
        { transform: [{ translateX: slideAnim }] }
      ]}
    >
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: image }} 
          style={styles.imagePreview} 
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={analyzeImage}
          activeOpacity={0.8}
        >
          <Ionicons name="scan" size={24} color="white" />
          <Text style={styles.buttonText}>Analyze Pet</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={resetScanner}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color="white" />
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderLoading = () => (
    <Animated.View 
      style={[
        styles.loadingContainer, 
        { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Analyzing pet image...</Text>
    </Animated.View>
  );

  const renderResult = () => (
    <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>Analysis Results</Text>
        <Text style={styles.resultSubtitle}>Here's what we found about this pet</Text>
      </View>
      
      <View style={styles.resultImageWrapper}>
        <Image source={{ uri: image }} style={styles.resultImage} />
      </View>
      
      <View style={styles.petInfoCard}>
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="paw" size={24} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Species</Text>
              <Text style={styles.infoValue}>{result.species}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <FontAwesome5 name="dog" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Breed</Text>
              <Text style={styles.infoValue}>{result.breed}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="calendar" size={24} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Age Estimate</Text>
              <Text style={styles.infoValue}>{result.age_estimate}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Health Indicators</Text>
          </View>
          
          {result.health_indicators.length > 0 ? (
            result.health_indicators.map((indicator, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listItemText}>{indicator}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No health indicators found</Text>
          )}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="comment-text" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Behavior Notes</Text>
          </View>
          <Text style={styles.infoParagraph}>
            {result.behavior_notes || "No behavior notes available"}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="lightbulb-on" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Recommendations</Text>
          </View>
          {result.recommendations.length > 0 ? (
            result.recommendations.map((rec, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listItemText}>{rec}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No recommendations available</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, styles.fullWidthButton]} 
        onPress={resetScanner}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Scan Another Pet</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderError = () => (
    <Animated.View 
      style={[styles.errorContainer, { opacity: fadeAnim }]}
      entering={FadeIn.duration(500)}
    >
      <MaterialCommunityIcons name="alert-circle" size={24} color={colors.danger} />
      <Text style={styles.errorText}>{error}</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <LinearGradient
        colors={[colors.white, colors.lightGray]}
        style={styles.background}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {!image && !result && renderWelcomeScreen()}
          {image && !result && !loading && renderImagePreview()}
          {loading && renderLoading()}
          {result && renderResult()}
          {error && renderError()}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 40,
  },
  gradientBackground: {
    borderRadius: 20,
    padding: 30,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: colors.primaryLight,
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 6,
    flex: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 11,
    marginLeft: 8,
  },
  fullWidthButton: {
    marginTop: 24,
    paddingVertical: 16,
    width: '100%',
  },
  imagePreviewContainer: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 40,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
  },
  imagePreview: {
    width: '100%',
    height: 300,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '500',
  },
  resultContainer: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  resultHeader: {
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 15,
    color: colors.darkGray,
  },
  resultImageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resultImage: {
    width: '100%',
    height: 220,
  },
  petInfoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryDark,
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '600',
  },
  infoParagraph: {
    fontSize: 15,
    color: colors.black,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.mediumGray,
    marginVertical: 16,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: 10,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    color: colors.black,
    lineHeight: 22,
  },
  noDataText: {
    fontSize: 15,
    color: colors.darkGray,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryLight,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 20,
  },
  errorText: {
    marginLeft: 10,
    color: colors.danger,
    fontSize: 15,
    fontWeight: '500',
  },
});