import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
  ImageBackground,
  Share,
 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Camera, 
  Gift, 
  Heart, 
  Plus, 
  ArrowRight, 
  RefreshCw, 
  Calendar, 
  Award, 
  Zap,
  Share2,
  Clock
} from 'react-native-feather';

const PetActivitySuggester = ({ petType = 'dog', petAge = 'adult' }) => {
  // List of activities based on pet type
  const activities = {
    dog: [
      'Take a walk in a new park',
      'Practice a new trick together',
      'Set up a doggy playdate',
      'Try a puzzle toy',
      'Go for a swim together',
      'Set up a small agility course',
      'Make homemade frozen treats',
      'Have a fetch tournament',
      'Take a trip to a pet-friendly café',
      'Practice nose work with hidden treats',
    ],
    cat: [
      'Create a new climbing space',
      'Try a new interactive toy',
      'Set up a bird watching station',
      'Make a DIY scratching post',
      'Have a laser pointer play session',
      'Create a catnip toy together',
      'Set up a cozy sun-bathing spot',
      'Try clicker training for a simple trick',
      'Rotate toys to keep things interesting',
      'Create a cardboard box castle',
    ],
    bird: [
      'Teach a new word or whistle',
      'Create a foraging toy',
      'Set up a bird bath',
      'Try target training',
      'Play music and dance together',
      'Introduce a new puzzle toy',
      'Have outside cage time together',
      'Create a new perch setup',
      'Try introducing new safe foods',
      'Set up a mirror play station',
    ],
    fish: [
      'Rearrange tank decorations',
      'Introduce a new plant',
      'Watch them interact with a floating toy',
      'Try target training your fish',
      'Add a new safe hiding spot',
      'Create a bubble curtain',
      'Draw on the tank with a dry erase marker',
      'Install a new LED light effect',
      'Add new tank mates (after research)',
      'Install a moving decoration',
    ],
    rabbit: [
      'Create a cardboard tunnel system',
      'Set up a foraging area',
      'Try clicker training',
      'Build a bunny playground',
      'Have supervised outdoor time',
      'Create a digging box',
      'Introduce a new chew toy',
      'Make a treat puzzle',
      'Play with rolling toys together',
      'Set up a jumping course',
    ],
    other: [
      'Research enrichment for your specific pet',
      'Create a custom play area',
      'Try target training',
      'Introduce a new toy',
      'Have dedicated handling time',
      'Make a homemade treat',
      'Take photos together',
      'Set up a comfortable viewing area',
      'Research and try positive reinforcement training',
      'Create a safe outdoor experience',
    ],
  };

  // Activity difficulty levels
  const activityDifficulty = {
    dog: [1, 2, 3, 2, 3, 3, 1, 2, 1, 3],
    cat: [2, 1, 1, 2, 1, 2, 1, 3, 1, 2],
    bird: [3, 2, 1, 3, 1, 2, 2, 2, 2, 1],
    fish: [2, 2, 1, 3, 2, 2, 1, 1, 3, 1],
    rabbit: [2, 2, 3, 3, 2, 1, 1, 2, 1, 3],
    other: [2, 2, 3, 1, 1, 2, 1, 1, 3, 2],
  };

  // Activity categories with icons
  const categories = {
    exercise: { icon: <Zap width={24} height={24} color="#ffffff" />, label: 'Exercise', color: '#10B981' },
    mental: { icon: <Award width={24} height={24} color="#ffffff" />, label: 'Mental Stimulation', color: '#3B82F6' },
    bonding: { icon: <Heart width={24} height={24} color="#ffffff" />, label: 'Bonding', color: '#EC4899' },
    play: { icon: <Gift width={24} height={24} color="#ffffff" />, label: 'Play', color: '#F59E0B' },
    photo: { icon: <Camera width={24} height={24} color="#ffffff" />, label: 'Photography', color: '#8B5CF6' }
  };

  // Assign categories to activities
  const activityCategories = {
    dog: [
      'exercise', 'mental', 'bonding', 'mental', 
      'exercise', 'exercise', 'bonding', 'play', 
      'bonding', 'mental'
    ],
    cat: [
      'exercise', 'play', 'mental', 'play', 
      'play', 'bonding', 'bonding', 'mental', 
      'mental', 'play'
    ],
    bird: [
      'mental', 'mental', 'play', 'mental', 
      'bonding', 'mental', 'bonding', 'play', 
      'bonding', 'play'
    ],
    fish: [
      'mental', 'mental', 'mental', 'mental', 
      'bonding', 'mental', 'bonding', 'play', 
      'mental', 'mental'
    ],
    rabbit: [
      'play', 'mental', 'mental', 'exercise', 
      'exercise', 'play', 'mental', 'mental', 
      'play', 'exercise'
    ],
    other: [
      'mental', 'play', 'mental', 'play', 
      'bonding', 'bonding', 'photo', 'bonding', 
      'mental', 'exercise'
    ],
  };

  // Pet icons and colors
  const petDetails = {
    dog: { 
      emoji: '🐕',
      colors: {
        primary: '#D97706',
        gradientStart: '#F59E0B',
        gradientEnd: '#FBBF24',
        text: '#92400E',
      }
    },
    cat: { 
      emoji: '🐈',
      colors: {
        primary: '#EA580C',
        gradientStart: '#F97316',
        gradientEnd: '#F87171',
        text: '#9A3412',
      }
    },
    bird: { 
      emoji: '🦜',
      colors: {
        primary: '#0284C7',
        gradientStart: '#0EA5E9',
        gradientEnd: '#60A5FA',
        text: '#075985',
      }
    },
    fish: { 
      emoji: '🐠',
      colors: {
        primary: '#2563EB',
        gradientStart: '#3B82F6',
        gradientEnd: '#818CF8',
        text: '#1E40AF',
      }
    },
    rabbit: { 
      emoji: '🐇',
      colors: {
        primary: '#57534E',
        gradientStart: '#78716C',
        gradientEnd: '#9CA3AF',
        text: '#44403C',
      }
    },
    other: { 
      emoji: '🐾',
      colors: {
        primary: '#9333EA',
        gradientStart: '#A855F7',
        gradientEnd: '#E879F9',
        text: '#6B21A8',
      }
    },
  };

  // State
  const [currentActivity, setCurrentActivity] = useState('');
  const [previousActivities, setPreviousActivities] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activityIndex, setActivityIndex] = useState(0);
  const [savedActivities, setSavedActivities] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [completedActivities, setCompletedActivities] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  
  // Animation values
  const flipAnim = useState(new Animated.Value(0))[0];
  const shakeAnim = useState(new Animated.Value(0))[0];

  // Get age-appropriate activities
  const getAgeAppropriateActivities = () => {
    const allActivities = activities[petType] || activities.other;
    if (petAge === 'senior') {
      return allActivities.filter((_, index) => 
        activityDifficulty[petType][index] < 3
      );
    }
    if (petAge === 'young') {
      return allActivities.filter((_, index) => 
        activityDifficulty[petType][index] > 1
      );
    }
    return allActivities;
  };

  // Get current category based on activity
  const getCurrentCategory = () => {
    if (!currentActivity) return 'play';
    const index = activities[petType].indexOf(currentActivity);
    if (index === -1) return 'play';
    return activityCategories[petType][index] || 'play';
  };

  // Get random activity that hasn't been suggested recently
  const getRandomActivity = () => {
    const petActivities = getAgeAppropriateActivities();
    let availableActivities = petActivities.filter(activity => !previousActivities.includes(activity));
    
    // Reset if all activities have been used
    if (availableActivities.length === 0) {
      availableActivities = petActivities;
      setPreviousActivities([]);
    }
    
    const randomIndex = Math.floor(Math.random() * availableActivities.length);
    const newActivity = availableActivities[randomIndex];
    const newIndex = activities[petType].indexOf(newActivity);
    
    // Keep track of suggested activities
    setPreviousActivities(prev => [...prev, newActivity].slice(-5));
    setActivityIndex(newIndex);
    return newActivity;
  };

  // Generate a new activity with animations
  const generateNewActivity = () => {
    setIsGenerating(true);
    
    // Flip out animation
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      const newActivity = getRandomActivity();
      setCurrentActivity(newActivity);
      setActivityHistory(prev => [
        { activity: newActivity, timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);
      
      // Flip in animation
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        setIsGenerating(false);
        animateShake();
      });
    });
  };

  // Save current activity
  const saveActivity = async () => {
    if (currentActivity && !savedActivities.includes(currentActivity)) {
      const newSaved = [...savedActivities, currentActivity];
      setSavedActivities(newSaved);
      try {
        await AsyncStorage.setItem(`@savedActivities_${petType}`, JSON.stringify(newSaved));
      } catch (e) {
        console.error('Error saving activities', e);
      }
    }
  };

  // Load saved activities
  const loadSavedActivities = async () => {
    try {
      const value = await AsyncStorage.getItem(`@savedActivities_${petType}`);
      if (value !== null) {
        setSavedActivities(JSON.parse(value));
      }
    } catch (e) {
      console.error('Error loading activities', e);
    }
  };

  // Share activity
  const shareActivity = async () => {
    try {
      await Share.share({
        message: `Try this activity with your ${petType}: ${currentActivity}`,
      });
    } catch (error) {
      console.error('Error sharing activity', error);
    }
  };

  // Toggle activity completion
  const toggleComplete = (activity) => {
    if (completedActivities.includes(activity)) {
      setCompletedActivities(completedActivities.filter(a => a !== activity));
    } else {
      setCompletedActivities([...completedActivities, activity]);
    }
  };

  // Toggle timer
  const toggleTimer = () => {
    setTimerActive(!timerActive);
    if (!timerActive && timeLeft === 0) {
      setTimeLeft(1800); // Reset to 30 minutes
    }
  };

  // Animate shake
  const animateShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Toggle activity details
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Initialize with a random activity and load saved activities
  useEffect(() => {
    loadSavedActivities();
    setCurrentActivity(getRandomActivity());
  }, [petType]);

  // Get the current pet's details
  const currentPetDetails = petDetails[petType] || petDetails.other;
  const currentCategory = getCurrentCategory();
  const categoryDetails = categories[currentCategory] || categories.play;

  // Interpolate animation values
  const flipInterpolation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg']
  });
  
  const shakeInterpolation = shakeAnim.interpolate({
    inputRange: [-5, 0, 5],
    outputRange: ['-3deg', '0deg', '3deg']
  });

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={currentPetDetails.colors.bgPattern}
        style={styles.cardBackground}
        imageStyle={styles.bgImageStyle}
      >
        {/* Top decoration bar */}
        <View style={[styles.topBar, {
          backgroundColor: currentPetDetails.colors.primary,
        }]}>
          <View style={[styles.gradientBar, {
            backgroundColor: currentPetDetails.colors.gradientStart,
          }]} />
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pet Inspiration</Text>
          <Text style={styles.petEmoji}>{currentPetDetails.emoji}</Text>
        </View>
        <Text style={[styles.subtitle, { color: currentPetDetails.colors.text }]}>
          Discover amazing activities for your {petType}
        </Text>
        
        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Activity card */}
          <Animated.View 
            style={[
              styles.activityCard,
              {
                transform: [
                  { rotateX: flipInterpolation },
                  { rotateZ: shakeInterpolation }
                ],
                opacity: flipAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0.5, 0]
                })
              }
            ]}
          >
            {/* Category badge */}
            <View style={[styles.categoryBadge, { backgroundColor: categoryDetails.color }]}>
              {categoryDetails.icon}
              <Text style={styles.categoryText}>{categoryDetails.label}</Text>
            </View>
            
            {/* Activity content */}
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>{currentActivity}</Text>
              
              {showDetails && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.difficultyText}>
                    Difficulty: {'★'.repeat(activityDifficulty[petType][activityIndex])}
                  </Text>
                  <Text style={styles.detailsText}>
                    This activity is great for your {petType}'s {currentCategory === 'exercise' ? 'physical health' : currentCategory === 'mental' ? 'cognitive development' : currentCategory === 'bonding' ? 'emotional connection' : currentCategory === 'photo' ? 'memory making' : 'entertainment'}.
                  </Text>
                  <Text style={styles.detailsText}>
                    Try to schedule this activity for about 20-30 minutes for best results!
                  </Text>
                </View>
              )}
              
              {/* Action buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  onPress={toggleDetails}
                  style={styles.actionButton}
                >
                  <ArrowRight width={16} height={16} color="#374151" style={{
                    transform: [{ rotate: showDetails ? '90deg' : '0deg' }]
                  }} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={saveActivity}
                  style={styles.actionButton}
                  disabled={savedActivities.includes(currentActivity)}
                >
                  <Heart 
                    width={16} 
                    height={16} 
                    color="#374151" 
                    fill={savedActivities.includes(currentActivity) ? "#374151" : "none"} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={shareActivity}
                  style={styles.actionButton}
                >
                  <Share2 width={16} height={16} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
          
          {/* Generate button */}
          <View style={styles.generateButtonContainer}>
            <TouchableOpacity
              onPress={generateNewActivity}
              disabled={isGenerating}
              style={[styles.generateButton, {
                backgroundColor: currentPetDetails.colors.primary,
              }]}
            >
              {isGenerating ? (
                <RefreshCw width={18} height={18} color="#ffffff" style={{ transform: [{ rotate: '0deg' }] }} />
              ) : (
                <Plus width={18} height={18} color="#ffffff" />
              )}
              <Text style={styles.generateButtonText}>
                {isGenerating ? "Generating..." : "New Activity"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Saved activities */}
        {savedActivities.length > 0 && (
          <View style={styles.savedActivitiesContainer}>
            <Text style={styles.savedActivitiesTitle}>
              <Heart width={14} height={14} color="#4B5563" /> Saved Activities
            </Text>
            <ScrollView style={styles.savedActivitiesList}>
              {savedActivities.map((activity, index) => (
                <View key={index} style={styles.savedActivityItem}>
                  <TouchableOpacity onPress={() => toggleComplete(activity)}>
                    <Text style={[
                      styles.savedActivityText,
                      completedActivities.includes(activity) && styles.completedActivity
                    ]}>
                      {activity}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setSavedActivities(savedActivities.filter(a => a !== activity))}
                  >
                    <Text style={styles.removeActivityButton}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Activity history */}
        {activityHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>
              <Clock width={14} height={14} color="#4B5563" /> Recent Activities
            </Text>
            <ScrollView style={styles.historyList}>
              {activityHistory.map((item, index) => (
                <Text key={index} style={styles.historyItem}>
                  {item.timestamp.toLocaleTimeString()}: {item.activity}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: 'white',
    marginVertical: 20,
  },
  cardBackground: {
    width: '100%',
  },
  bgImageStyle: {
    resizeMode: 'repeat',
    opacity: 0.1,
  },
  topBar: {
    height: 2,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  petEmoji: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingBottom: 16,
  },
  mainContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 24,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 24,
    position: 'relative',
  },
  categoryBadge: {
    position: 'absolute',
    top: -12,
    left: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  activityContent: {
    paddingTop: 16,
    alignItems: 'center',
  },
  activityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsContainer: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#374151',
  },
  generateButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  savedActivitiesContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  savedActivitiesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedActivitiesList: {
    maxHeight: 150,
  },
  savedActivityItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  savedActivityText: {
    fontSize: 14,
    color: '#374151',
  },
  completedActivity: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  removeActivityButton: {
    fontSize: 20,
    color: '#9CA3AF',
    paddingHorizontal: 8,
  },
  historyContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyList: {
    maxHeight: 100,
  },
  historyItem: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
});

export default PetActivitySuggester;