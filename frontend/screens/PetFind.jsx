import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Animated, 
  Easing, 
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView,
  I18nManager,
  FlatList
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BASE_URL from './config';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;

export const colors = {
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
};

const ImprovedPetFinder = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(Array(12).fill([]));
  const [matchedPets, setMatchedPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoadingStatus, setImageLoadingStatus] = useState({});
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    slideAnim.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [currentQuestion, currentStep]);

  const questions = [
    {
      question: "What kind of furry (or feathery) friend are you looking for?",
      options: ["Dog", "Cat", "Bird", "Rabbit", "Other"],
      field: "type",
      icons: ["dog", "cat", "kiwi-bird", "rabbit", "paw"],
      multiple: true
    },
    {
      question: "How much space do you have at home?",
      options: ["Apartment/Small Space", "Average Home", "Large Home with Yard"],
      field: "size",
      icons: ["home", "home", "home"],
      mapping: {
        "Apartment/Small Space": "Small",
        "Average Home": "Medium",
        "Large Home with Yard": "Large"
      }
    },
    {
      question: "What stage of life are you comfortable with?",
      options: ["Baby (needs lots of training)", "Young Adult (some energy)", "Mature Adult (steady companion)", "Senior (calm & loving)"],
      field: "age",
      icons: ["baby", "child", "user", "user-tie"],
      mapping: {
        "Baby (needs lots of training)": "Puppy/Kitten (0-1 year)",
        "Young Adult (some energy)": "Young (1-3 years)",
        "Mature Adult (steady companion)": "Adult (3-8 years)",
        "Senior (calm & loving)": "Senior (8+ years)"
      },
      multiple: true
    },
    {
      question: "Do you have a preference on boy or girl?",
      options: ["Boy", "Girl", "No preference"],
      field: "gender",
      icons: ["mars", "venus", "venus-mars"],
      mapping: {
        "Boy": "Male",
        "Girl": "Female",
        "No preference": "No preference"
      }
    },
    {
      question: "How experienced are you as a pet parent?",
      options: ["First-time pet parent", "Some experience", "Very experienced"],
      field: "trainingLevel",
      icons: ["seedling", "pagelines", "tree"],
      mapping: {
        "First-time pet parent": "I want a well-trained pet",
        "Some experience": "I can do some training",
        "Very experienced": "Training not important"
      }
    },
    {
      question: "What's your daily energy level like?",
      options: ["Relaxed & laid-back", "Moderate activity", "Active & adventurous"],
      field: "behavior",
      icons: ["couch", "walking", "running"],
      mapping: {
        "Relaxed & laid-back": "Mostly calm/quiet",
        "Moderate activity": "Moderately active",
        "Active & adventurous": "Very active (lots of exercise)"
      }
    },
    {
      question: "What personality traits are important to you?",
      options: ["Affectionate & Cuddly", "Playful & Energetic", "Independent & Low-maintenance", "Calm & Gentle"],
      field: "temperament",
      icons: ["heart", "futbol", "user-secret", "dove"],
      mapping: {
        "Affectionate & Cuddly": "Friendly",
        "Playful & Energetic": "Playful",
        "Independent & Low-maintenance": "Independent",
        "Calm & Gentle": "Calm"
      },
      multiple: true
    },
    {
      question: "How important is it that your pet is up-to-date on vaccinations?",
      options: ["Very important", "Somewhat important", "I can handle vaccinations myself"],
      field: "vaccinationStatus",
      icons: ["syringe", "check-circle", "user-md"],
      mapping: {
        "Very important": "Must be fully vaccinated",
        "Somewhat important": "Partially vaccinated is okay",
        "I can handle vaccinations myself": "Not important"
      }
    },
    {
      question: "Would you prefer a pet that's already spayed/neutered?",
      options: ["Yes, definitely", "No, I'd prefer not", "No preference"],
      field: "spayedNeutered",
      icons: ["clinic-medical", "times-circle", "question-circle"],
      mapping: {
        "Yes, definitely": "Yes",
        "No, I'd prefer not": "No",
        "No preference": "Doesn't matter"
      }
    },
    {
      question: "Do you have children in your home?",
      options: ["Yes, young children", "Yes, older children", "No children"],
      field: "goodWithKids",
      icons: ["child", "child", "user"],
      mapping: {
        "Yes, young children": "Must be good with kids",
        "Yes, older children": "Should be good with kids",
        "No children": "Not applicable"
      }
    },
    {
      question: "Do you have other pets at home?",
      options: ["Yes, dogs", "Yes, cats", "Yes, other pets", "No other pets"],
      field: "goodWithPets",
      icons: ["dog", "cat", "crow", "home"],
      mapping: {
        "Yes, dogs": "Must be good with dogs",
        "Yes, cats": "Must be good with cats",
        "Yes, other pets": "Must be good with other pets",
        "No other pets": "Not applicable"
      },
      multiple: true
    },
    {
      question: "How much time can you dedicate to your new pet daily?",
      options: ["Limited (4 hours or less)", "Average (4-8 hours)", "Lots of time (8+ hours)"],
      field: "timeCommitment",
      icons: ["clock", "clock", "clock"],
      mapping: {
        "Limited (4 hours or less)": "Low",
        "Average (4-8 hours)": "Medium",
        "Lots of time (8+ hours)": "High"
      }
    }
  ];

  const handleOptionSelect = (questionIndex, optionIndex) => {
    Haptics.selectionAsync();
    const newSelectedOptions = [...selectedOptions];
    const currentQuestionData = questions[questionIndex];
    
    if (currentQuestionData.multiple) {
      const currentSelections = [...newSelectedOptions[questionIndex]];
      const optionIndexInSelections = currentSelections.indexOf(optionIndex);
      
      if (optionIndexInSelections === -1) {
        currentSelections.push(optionIndex);
      } else {
        currentSelections.splice(optionIndexInSelections, 1);
      }
      
      newSelectedOptions[questionIndex] = currentSelections;
    } else {
      newSelectedOptions[questionIndex] = [optionIndex];
    }
    
    setSelectedOptions(newSelectedOptions);
  };

  const isOptionSelected = (questionIndex, optionIndex) => {
    return selectedOptions[questionIndex].includes(optionIndex);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getValidImageUrl = (pet) => {
    if (pet.imageUrls && pet.imageUrls.length > 0) {
      const imageUrl = pet.imageUrls[0];
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        return `https://${imageUrl}`;
      }
      return imageUrl;
    }
    return null;
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    const answers = {};
    const personalityFactors = {};
    
    questions.forEach((question, index) => {
      const selectedIndices = selectedOptions[index];
      if (selectedIndices.length > 0) {
        const selectedValues = selectedIndices.map(idx => question.options[idx]);
        
        if (question.mapping) {
          const mappedValues = selectedValues.map(val => question.mapping[val]);
          
          switch (question.field) {
            case 'spayedNeutered':
              answers[question.field] = mappedValues.includes('Yes') ? true : 
                (mappedValues.includes('No') ? false : { $exists: true });
              break;
              
            case 'temperament':
              answers[question.field] = { $in: mappedValues };
              break;
              
            case 'vaccinationStatus':
              if (mappedValues.includes('Must be fully vaccinated')) {
                answers[question.field] = 'Fully Vaccinated';
              } else if (mappedValues.includes('Partially vaccinated is okay')) {
                answers[question.field] = { $in: ['Partially Vaccinated', 'Fully Vaccinated'] };
              }
              break;
              
            case 'age':
              const ageRegexParts = [];
              if (mappedValues.includes('Puppy/Kitten (0-1 year)')) {
                ageRegexParts.push('0|1|puppy|kitten|baby');
              }
              if (mappedValues.includes('Young (1-3 years)')) {
                ageRegexParts.push('1|2|3|young|adolescent');
              }
              if (mappedValues.includes('Adult (3-8 years)')) {
                ageRegexParts.push('3|4|5|6|7|8|adult');
              }
              if (mappedValues.includes('Senior (8+ years)')) {
                ageRegexParts.push('8|9|10|senior|old|elder');
              }
              if (ageRegexParts.length > 0) {
                answers[question.field] = { $regex: new RegExp(ageRegexParts.join('|'), 'i') };
              }
              break;
              
            case 'goodWithKids':
              personalityFactors.goodWithKids = mappedValues;
              if (mappedValues.includes('Must be good with kids')) {
                answers.description = { $regex: /kid|child|children|family/i };
              }
              break;
              
            case 'goodWithPets':
              personalityFactors.goodWithPets = mappedValues;
              if (mappedValues.some(val => val.includes('Must be good with'))) {
                answers.description = answers.description || {};
                if (answers.description.$regex) {
                  answers.description.$regex = new RegExp(
                    answers.description.$regex.source + '|' + /dog|cat|animal|pet/i.source, 
                    'i'
                  );
                } else {
                  answers.description = { $regex: /dog|cat|animal|pet/i };
                }
              }
              break;
              
            case 'timeCommitment':
              personalityFactors.timeCommitment = mappedValues[0];
              break;
              
            default:
              if (mappedValues.includes('No preference') || mappedValues.includes('Doesn\'t matter') || 
                  mappedValues.includes('Not applicable')) {
                // Skip this filter
              } else {
                answers[question.field] = mappedValues.length > 1 ? { $in: mappedValues } : mappedValues[0];
              }
          }
        } else {
          answers[question.field] = selectedValues.length > 1 ? { $in: selectedValues } : selectedValues[0];
        }
      }
    });

    answers.availableForAdoption = true;
    answers.adopted = false;
    answers.personalityFactors = personalityFactors;

    try {
      const response = await fetch(`${BASE_URL}/pet/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filters: answers,
          personalityScore: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const petsWithImages = data.map(pet => ({
        ...pet,
        imageUrls: pet.imageUrls || []
      }));
      
      const initImageStatus = {};
      petsWithImages.forEach(pet => {
        initImageStatus[pet._id] = getValidImageUrl(pet) ? 'loading' : 'error';
      });
      
      setImageLoadingStatus(initImageStatus);
      setMatchedPets(petsWithImages);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error fetching matched pets:', error);
      alert('Error finding pets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityPercentage = (pet) => {
    if (!pet.matchScore) return "98%";
    const percentage = Math.min(100, Math.max(80, Math.round(pet.matchScore * 100)));
    return `${percentage}%`;
  };

  const renderOptionIcon = (questionIndex, optionIndex) => {
    const question = questions[questionIndex];
    if (question.icons && question.icons[optionIndex]) {
      return question.icons[optionIndex];
    }
    return "paw";
  };

  const renderIntro = () => (
    <Animated.View 
      style={[
        styles.stepContainer, 
        { 
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim }
          ] 
        }
      ]}
    >
      <View style={styles.introContent}>
        <Image
          source={require('../assets/pet-matching.png')}
          style={styles.introAnimation}
          resizeMode="contain"
        />
        <Text style={styles.title}>Meet Your Purr-fect Match</Text>
        <Text style={styles.description}>Find the pet that fits your life — in just a few taps.</Text>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => setCurrentStep(1)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Start Matching</Text>
          <MaterialCommunityIcons 
            name="heart-pulse" 
            size={24} 
            color="white" 
            style={styles.buttonIcon} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderQuestions = () => (
    <Animated.View 
      style={[
        styles.stepContainer, 
        { 
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim }
          ] 
        }
      ]}
    >
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Step {currentQuestion + 1} of {questions.length}
        </Text>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              { 
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }
            ]}
          />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {questions[currentQuestion].question}
          </Text>
          
          <View style={styles.optionsGrid}>
            {questions[currentQuestion].options.map((option, index) => {
              const selected = isOptionSelected(currentQuestion, index);
              const iconName = renderOptionIcon(currentQuestion, index);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    selected && styles.selectedOptionCard
                  ]}
                  onPress={() => handleOptionSelect(currentQuestion, index)}
                  activeOpacity={0.7}
                >
                  <Animated.View 
                    style={[
                      styles.optionIconContainer,
                      selected && styles.selectedOptionIconContainer
                    ]}
                  >
                    <FontAwesome5 
                      name={iconName} 
                      size={20} 
                      color={selected ? "white" : "#FF6B6B"} 
                    />
                  </Animated.View>
                  
                  <Text style={[
                    styles.optionText,
                    selected && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentQuestion > 0 ? (
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={prevQuestion}
          >
            <Ionicons name="arrow-back" size={20} color="#FF6B6B" />
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => setCurrentStep(0)}
          >
            <Ionicons name="home" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
        
        {currentQuestion < questions.length - 1 ? (
          <TouchableOpacity 
            style={[
              styles.primaryButton,
              selectedOptions[currentQuestion].length === 0 && styles.disabledButton
            ]}
            onPress={nextQuestion}
            disabled={selectedOptions[currentQuestion].length === 0}
          >
            <LinearGradient
              colors={['rgb(40, 84, 151)', '#4A6FA5']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.primaryButton,
              selectedOptions[currentQuestion].length === 0 && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={selectedOptions[currentQuestion].length === 0 || loading}
          >
            <LinearGradient
              colors={['rgb(40, 84, 151)', '#4A6FA5']}
              style={styles.gradientBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Find Matches</Text>
                  <MaterialCommunityIcons 
                    name="heart-pulse" 
                    size={20} 
                    color="white" 
                    style={styles.buttonIcon} 
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const renderResults = () => (
    <Animated.View 
      style={[
        styles.stepContainer, 
        { 
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim }
          ]
        }
      ]}
    >
      <View style={styles.resultsHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            setCurrentStep(0);
            setCurrentQuestion(0);
            setSelectedOptions(Array(12).fill([]));
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FF6B6B" />
        </TouchableOpacity>
        <Text style={styles.resultsTitle}>Your Perfect Matches</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {matchedPets.length > 0 ? (
        <FlatList
          data={matchedPets}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item: pet, index }) => (
            <Animated.View 
              style={[
                styles.petCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    { 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10 * index]
                      }) 
                    }
                  ]
                }
              ]}
            >
              <View style={styles.petImageContainer}>
                {imageLoadingStatus[pet._id] === 'loading' && (
                  <View style={styles.imageLoadingContainer}>
                    <ActivityIndicator color="#FF6B6B" size="small" />
                  </View>
                )}
                
                {getValidImageUrl(pet) ? (
                  <Image 
                    source={{ uri: getValidImageUrl(pet) }} 
                    style={[
                      styles.petImage,
                      imageLoadingStatus[pet._id] === 'error' && styles.petImageError
                    ]}
                    resizeMode="cover"
                    onLoadStart={() => {
                      const newStatus = {...imageLoadingStatus};
                      newStatus[pet._id] = 'loading';
                      setImageLoadingStatus(newStatus);
                    }}
                    onLoad={() => {
                      const newStatus = {...imageLoadingStatus};
                      newStatus[pet._id] = 'success';
                      setImageLoadingStatus(newStatus);
                    }}
                    onError={(error) => {
                      const newStatus = {...imageLoadingStatus};
                      newStatus[pet._id] = 'error';
                      setImageLoadingStatus(newStatus);
                    }}
                  />
                ) : null}
                
                {(imageLoadingStatus[pet._id] === 'error' || !getValidImageUrl(pet)) && (
                  <View style={styles.fallbackImageContainer}>
                    <MaterialCommunityIcons 
                      name={pet.type === 'Cat' ? 'cat' : pet.type === 'Dog' ? 'dog' : 'paw'} 
                      size={40} 
                      color="#FF6B6B" 
                    />
                    <Text style={styles.fallbackImageText}>{pet.type || 'Pet'}</Text>
                  </View>
                )}
                
                <View style={styles.matchBadge}>
                  <MaterialCommunityIcons name="heart" size={16} color="white" />
                  <Text style={styles.matchText}>{getCompatibilityPercentage(pet)}</Text>
                </View>
                
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                  style={styles.imageOverlay}
                >
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petBreed}>{pet.breed || 'Mixed Breed'}</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.petDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="paw" size={16} color="#FF6B6B" />
                    <Text style={styles.detailText}>{pet.type || 'Pet'}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar" size={16} color="#FF6B6B" />
                    <Text style={styles.detailText}>{pet.age || 'Unknown'}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    {pet.gender === 'Male' ? (
                      <Ionicons name="male" size={16} color="#FF6B6B" />
                    ) : pet.gender === 'Female' ? (
                      <Ionicons name="female" size={16} color="#FF6B6B" />
                    ) : (
                      <Ionicons name="help-circle" size={16} color="#FF6B6B" />
                    )}
                    <Text style={styles.detailText}>{pet.gender || 'Unknown'}</Text>
                  </View>
                </View>
                
                {pet.description && (
                  <Text style={styles.petDescription} numberOfLines={3}>
                    {pet.description}
                  </Text>
                )}
                
                {pet.temperament && (
                  <View style={styles.tagsContainer}>
                    {Array.isArray(pet.temperament) ? (
                      pet.temperament.slice(0, 3).map((trait, i) => (
                        <View key={i} style={styles.tag}>
                          <Text style={styles.tagText}>{trait}</Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{pet.temperament}</Text>
                      </View>
                    )}
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => navigation.navigate('PetDetails', { petId: pet._id })}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgb(40, 84, 151)', '#4A6FA5']}
                    style={styles.gradientBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Text style={styles.viewButtonText}>Meet {pet.name.split(' ')[0]}</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsTitle}>No Matches Found</Text>
          <Text style={styles.noResultsText}>
            Try adjusting your preferences or check back later for new pets
          </Text>
          
          <TouchableOpacity 
            style={styles.tryAgainButton}
            onPress={() => {
              setCurrentStep(0);
              setCurrentQuestion(0);
              setSelectedOptions(Array(12).fill([]));
            }}
          >
            <Text style={styles.tryAgainButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {currentStep === 0 && renderIntro()}
      {currentStep === 1 && renderQuestions()}
      {currentStep === 2 && renderResults()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },

gradientButton: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 30,
  borderRadius: 30,
},

  // Intro Screen Styles
  introContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  introAnimation: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Helvetica Neue',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 40,
    lineHeight: 24,
  },
  startButton: {
    width: '100%',
    backgroundColor: '#4A6FA5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  gradientBackground: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',

  },
  buttonIcon: {
    marginLeft: 10,
  },

  // Question Screen Styles
  progressContainer: {
    marginBottom: 25,
  },
  progressText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#EEE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4A6FA5',
    borderRadius: 3,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  selectedOptionCard: {
    backgroundColor: '#4A6FA5',
    borderColor: '#4A6FA5',
    transform: [{ scale: 1.03 }],
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4A6FA5',
  },
  selectedOptionIconContainer: {
    backgroundColor: '#4A6FA5',
    borderColor: 'white',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#4A6FA5',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  homeButton: {
    padding: 12,
    borderRadius: 30,
    backgroundColor: '#F9F9F9',
  },
  primaryButton: {
    flex: 1,
    marginLeft: 15,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#4A6FA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Results Screen Styles
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  resultsList: {
    paddingBottom: 20,
  },
  petCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  petImageContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  petImageError: {
    opacity: 0,
  },
  fallbackImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackImageText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  matchBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(22, 19, 19, 0.9)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  matchText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 5,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
  },
  petName: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 5,
  },
  petBreed: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  petDetails: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  petDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: '#E8F0FE',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#4A6FA5',
    fontWeight: '500',
  },
  viewButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },

  // No Results Styles
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noResultsAnimation: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  noResultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  tryAgainButton: {
    backgroundColor: '#4A6FA5',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  tryAgainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
export default ImprovedPetFinder;