import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Animated,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  FontAwesome5,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { FadeIn, FadeInRight, FadeInUp } from "react-native-reanimated";
import BASE_URL from "./config";

import { useNavigation } from "@react-navigation/native";
// Modern color palette with vibrant accents
export const colors = {
  primary: "#5D8BF4", // Vibrant blue
  primaryLight: "#E8F0FE",
  primaryDark: "#2D46B9",

  secondary: "#FF7E67", // Coral
  secondaryLight: "#FFE8E2",

  white: "#FFFFFF",
  lightGray: "#F8FAFC",
  mediumGray: "#E2E8F0",
  darkGray: "#64748B",
  black: "#1E293B",

  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",

  accentPurple: "#A78BFA",
  accentPink: "#F472B6",
  rewardGold: "#D97706",
};
const AUTO_SCROLL_INTERVAL = 5000; // 5 seconds

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.65;
const CARD_HEIGHT = CARD_WIDTH * 1.2;
const ACTION_SIZE = 70;
const defaultImage =
  "https://images.unsplash.com/photo-1453227588063-bb302b62f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";

// Daily inspirational quotes about pets
const dailyQuotes = [
  "Until one has loved an animal, a part of one's soul remains unawakened.",
  "Pets are not our whole life, but they make our lives whole.",
  "The world would be a nicer place if everyone had the ability to love as unconditionally as a dog.",
  "Animals are such agreeable friends—they ask no questions; they pass no criticisms.",
  "Some angels don't have wings, they have paws.",
  "Pets leave paw prints forever on our hearts.",
  "The love of a pet is a pure and simple gift.",
];

const HomeScreen = () => {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [missingPets, setMissingPets] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingMissing, setLoadingMissing] = useState(true);
  const [dailyQuote, setDailyQuote] = useState("");
  const featuredScrollRef = useRef();
  const missingScrollRef = useRef();
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [currentMissingIndex, setCurrentMissingIndex] = useState(0);
  const navigation = useNavigation();

  // For auto-scrolling
  const featuredTimerRef = useRef(null);
  const missingTimerRef = useRef(null);

  // Set random daily quote on mount
  useEffect(() => {
    setDailyQuote(dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]);
    fetchFeaturedPets();
    fetchMissingPets();

    // Cleanup timers on unmount
    return () => {
      if (featuredTimerRef.current) clearInterval(featuredTimerRef.current);
      if (missingTimerRef.current) clearInterval(missingTimerRef.current);
    };
  }, []);

  // Start auto-scrolling when data is loaded
  useEffect(() => {
    if (featuredPets.length > 0 && !loadingFeatured) {
      startFeaturedAutoScroll();
    }
  }, [featuredPets, loadingFeatured]);

  useEffect(() => {
    if (missingPets.length > 0 && !loadingMissing) {
      startMissingAutoScroll();
    }
  }, [missingPets, loadingMissing]);

  const startFeaturedAutoScroll = () => {
    if (featuredTimerRef.current) clearInterval(featuredTimerRef.current);

    featuredTimerRef.current = setInterval(() => {
      if (featuredPets.length <= 1) return;

      const nextIndex = (currentFeaturedIndex + 1) % featuredPets.length;
      scrollToIndex(featuredScrollRef, nextIndex, CARD_WIDTH + 15);
      setCurrentFeaturedIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);
  };

  const startMissingAutoScroll = () => {
    if (missingTimerRef.current) clearInterval(missingTimerRef.current);

    missingTimerRef.current = setInterval(() => {
      if (missingPets.length <= 1) return;

      const nextIndex = (currentMissingIndex + 1) % missingPets.length;
      scrollToIndex(missingScrollRef, nextIndex, CARD_WIDTH + 15);
      setCurrentMissingIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);
  };

  const scrollToIndex = (scrollRef, index, itemWidth) => {
    scrollRef.current?.scrollTo({
      x: index * itemWidth,
      animated: true,
    });
  };

  const fetchFeaturedPets = async () => {
    setLoadingFeatured(true);
    try {
      const response = await fetch(`${BASE_URL}/pet/all`);
      const data = await response.json();

      let featured = data.filter((pet) => pet.isFeatured);
      if (featured.length === 0) featured = data;

      featured = featured.map((pet) => ({
        ...pet,
        image: pet.imageUrls?.[0] || defaultImage,
      }));

      setFeaturedPets(getRandomItems(featured, 6));
    } catch (error) {
      console.error("Error fetching featured pets:", error);
      setFeaturedPets([]);
    } finally {
      setLoadingFeatured(false);
    }
  };

 const fetchMissingPets = async () => {
  setLoadingMissing(true);
  try {
    const response = await fetch(`${BASE_URL}/lostfound`);
    const data = await response.json();
    
    // Client-side filtering for lost pets
    const lostPets = data.filter(pet => 
      pet.status && pet.status.toLowerCase() === "lost"
    );
    
    // Process the data as before
    const processedData = lostPets.map(pet => ({
      ...pet,
      _id: pet._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
    }));
    
    setMissingPets(getRandomItems(processedData, 5));
  } catch (error) {
    console.error("Error fetching missing pets:", error);
    setMissingPets([]);
  } finally {
    setLoadingMissing(false);
  }
};

  const getRandomItems = (array, count) => {
    if (!array || array.length === 0) return [];
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  // Handle manual scrolling with arrow buttons
  const handleScrollPrev = (
    scrollRef,
    currentIndex,
    setCurrentIndex,
    dataLength
  ) => {
    // Reset auto-scroll timer
    if (scrollRef === featuredScrollRef) {
      if (featuredTimerRef.current) clearInterval(featuredTimerRef.current);
      startFeaturedAutoScroll();
    } else {
      if (missingTimerRef.current) clearInterval(missingTimerRef.current);
      startMissingAutoScroll();
    }

    const newIndex = currentIndex === 0 ? dataLength - 1 : currentIndex - 1;
    scrollToIndex(scrollRef, newIndex, CARD_WIDTH + 15);
    setCurrentIndex(newIndex);
    handlePress(); // Haptic feedback
  };

  const handleScrollNext = (
    scrollRef,
    currentIndex,
    setCurrentIndex,
    dataLength
  ) => {
    // Reset auto-scroll timer
    if (scrollRef === featuredScrollRef) {
      if (featuredTimerRef.current) clearInterval(featuredTimerRef.current);
      startFeaturedAutoScroll();
    } else {
      if (missingTimerRef.current) clearInterval(missingTimerRef.current);
      startMissingAutoScroll();
    }

    const newIndex = (currentIndex + 1) % dataLength;
    scrollToIndex(scrollRef, newIndex, CARD_WIDTH + 15);
    setCurrentIndex(newIndex);
    handlePress(); // Haptic feedback
  };

  // Handle scroll end for each section
  const handleFeaturedScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + 15));
    if (index !== currentFeaturedIndex) {
      setCurrentFeaturedIndex(index);
      // Reset auto-scroll timer when user manually scrolls
      if (featuredTimerRef.current) clearInterval(featuredTimerRef.current);
      startFeaturedAutoScroll();
    }
  };

  const handleMissingScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + 15));
    if (index !== currentMissingIndex) {
      setCurrentMissingIndex(index);
      // Reset auto-scroll timer when user manually scrolls
      if (missingTimerRef.current) clearInterval(missingTimerRef.current);
      startMissingAutoScroll();
    }
  };

  const navigateToLostPetDetails = (pet) => {
    // Only navigate if pet and pet._id exist
    if (pet && pet._id) {
      handlePress();
      navigation.navigate("LostPetDetails", { petId: pet._id });
    } else {
      console.warn("Cannot navigate to pet details: Missing pet ID");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with quote */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Pet Lover</Text>
            <Text style={styles.headerTitle}>Find Your Perfect Companion</Text>
          </View>
          <View style={styles.quoteContainer}>
            <Feather name="heart" size={16} color={colors.secondary} />
            <Text style={styles.quoteText}>{dailyQuote}</Text>
          </View>
        </View>

        {/* Search Bar */}
     <TouchableOpacity
  style={styles.searchContainer}
  activeOpacity={0.8}
  onPress={() => navigation.navigate("Search")}
>
  <Ionicons name="search" size={20} color={colors.darkGray} />
  <Text style={styles.searchText}>
    Search pets, shelters, or breeds...
  </Text>
</TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            {
              icon: "paw",
              label: "Adopt",
              action: "Adoption",
              color: colors.primary,
              iconLib: "FontAwesome5",
            },
            {
              icon: "search",
              label: "Lost",
              action: "LostFoundTab",
              color: colors.warning,
              iconLib: "Ionicons",
            },
           {
  icon: "gift",
  label: "Donate",
  action: "Donation", // or "DonationTab" if it's in tabs
  color: colors.accentPink,
  iconLib: "FontAwesome5",
},

            {
              icon: "qr-code",
              label: "Scan",
              action: "ScannerTab",
              color: colors.secondary,
              iconLib: "Ionicons",
            },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={() => navigation.navigate(item.action)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[item.color, `${item.color}DD`]}
                style={styles.iconContainer}
              >
                {item.iconLib === "FontAwesome5" ? (
                  <FontAwesome5 name={item.icon} size={18} color="white" />
                ) : (
                  <Ionicons name={item.icon} size={18} color="white" />
                )}
              </LinearGradient>
              <Text style={styles.actionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pawsome Companions (Featured Pets) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Pawsome Companions</Text>
              <Text style={styles.sectionSubtitle}>
                Meet our most lovable friends
              </Text>
            </View>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate("AdoptionTab")}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>View All</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {loadingFeatured ? (
            renderLoading()
          ) : featuredPets.length > 0 ? (
            <View style={styles.sliderContainer}>
              <View style={styles.navigationControls}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() =>
                    handleScrollPrev(
                      featuredScrollRef,
                      currentFeaturedIndex,
                      setCurrentFeaturedIndex,
                      featuredPets.length
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="chevron-back-circle"
                    size={30}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() =>
                    handleScrollNext(
                      featuredScrollRef,
                      currentFeaturedIndex,
                      setCurrentFeaturedIndex,
                      featuredPets.length
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="chevron-forward-circle"
                    size={30}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                ref={featuredScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
                snapToInterval={CARD_WIDTH + 15}
                decelerationRate={0.85}
                pagingEnabled={false}
                snapToAlignment="center"
                onMomentumScrollEnd={handleFeaturedScroll}
              >
                {featuredPets.map((pet, index) => (
                  <Animated.View
                    key={pet._id || `feat-${index}`}
                    style={styles.sliderCardWrapper}
                  >
                    <TouchableOpacity
                      style={styles.featuredCard}
                      onPress={() => {
                        handlePress();
                        navigation.navigate("PetDetails", {
                          petId: pet._id,
                          petName: pet.name,
                          petBreed: pet.breed,
                          petImage: pet.image,
                        });
                      }}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{ uri: pet.image }}
                        style={styles.featuredImage}
                        onError={() =>
                          setFeaturedPets((current) =>
                            current.map((p) =>
                              p._id === pet.id
                                ? { ...p, image: defaultImage }
                                : p
                            )
                          )
                        }
                      />

                      <LinearGradient
                        colors={[
                          "transparent",
                          "rgba(0,0,0,0.7)",
                          "rgba(0,0,0,0.85)",
                        ]}
                        style={styles.featuredGradient}
                      />

                      <View style={styles.featuredInfo}>
                        <View>
                          <Text style={styles.featuredName}>{pet.name}</Text>
                          <Text style={styles.featuredType}>
                            {pet.breed || "Mixed Breed"}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.detailsButton}
                          onPress={() => {
                            handlePress();
                            navigation.navigate("PetDetails", {
                              petId: pet._id,
                              petName: pet.name,
                              petBreed: pet.breed || "Mixed Breed",
                              petImage: pet.image,
                            });
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.detailsButtonText}>Meet Me</Text>
                        </TouchableOpacity>
                      </View>

                      {pet.urgent && (
                        <Animated.View
                          style={styles.urgentTag}
                          entering={FadeIn.duration(400).delay(100)}
                        >
                          <Ionicons name="flash" size={12} color="white" />
                          <Text style={styles.urgentText}>NEEDS HOME</Text>
                        </Animated.View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>

              {/* Centered Pagination Indicators */}
              <View style={styles.paginationContainer}>
                {featuredPets.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.paginationDot,
                      currentFeaturedIndex === index &&
                        styles.paginationDotActive,
                    ]}
                    onPress={() => {
                      scrollToIndex(featuredScrollRef, index, CARD_WIDTH + 15);
                      setCurrentFeaturedIndex(index);
                      handlePress();
                    }}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                No pets available at the moment
              </Text>
            </View>
          )}
        </View>

        {/* Success Story Section */}
        <View style={styles.successStoryContainer}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.successStoryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.successStoryTitle}>Success Story</Text>
            <Text style={styles.successStoryName}>Meet Luna</Text>
            <Text style={styles.successStoryText}>
              Luna was found abandoned in a park last winter. After 2 months in
              foster care, she found her forever home with the Thompson family.
              Now she enjoys long walks and cuddles on the couch!
            </Text>
            <TouchableOpacity
              style={styles.successStoryButton}
              onPress={() => navigation.navigate("SuccessStories")}
              activeOpacity={0.8}
            >
              <Text style={styles.successStoryButtonText}>
                Read More Stories
              </Text>
              <Feather name="arrow-right" size={16} color={colors.white} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Lost & Loved (Missing Pets) - Enhanced */}
   {/* Lost & Loved (Missing Pets) - Matching Pawsome Companions Style */}
<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>Lost & Loved</Text>
      <Text style={styles.sectionSubtitle}>
        Help reunite these pets with their families
      </Text>
    </View>
    <TouchableOpacity
      style={styles.seeAllButton}
      onPress={() =>
        navigation.navigate("ReportTab", {
          screen: "LostFoundScreen",
        })
      }
      activeOpacity={0.7}
    >
      <Text style={styles.seeAllText}>View All</Text>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={colors.primary}
      />
    </TouchableOpacity>
  </View>

  {loadingMissing ? (
    renderLoading()
  ) : missingPets.length > 0 ? (
    <View style={styles.sliderContainer}>
      <View style={styles.navigationControls}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() =>
            handleScrollPrev(
              missingScrollRef,
              currentMissingIndex,
              setCurrentMissingIndex,
              missingPets.length
            )
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back-circle"
            size={30}
            color={colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() =>
            handleScrollNext(
              missingScrollRef,
              currentMissingIndex,
              setCurrentMissingIndex,
              missingPets.length
            )
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-forward-circle"
            size={30}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={missingScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
        snapToInterval={CARD_WIDTH + 15}
        decelerationRate={0.85}
        pagingEnabled={false}
        snapToAlignment="center"
        onMomentumScrollEnd={handleMissingScroll}
      >
        {missingPets.map((pet, index) => (
          <Animated.View
            key={pet._id || `missing-${index}`}
            style={styles.sliderCardWrapper}
          >
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => navigateToLostPetDetails(pet)}
              activeOpacity={0.9}
            >
              <Image
                source={{
                  uri: pet.image || pet.imageUrl || pet.imageUrls?.[0] || defaultImage,
                }}
                style={styles.featuredImage}
                onError={() => {
                  // Handle image error if needed
                }}
              />

              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(0,0,0,0.7)",
                  "rgba(0,0,0,0.85)",
                ]}
                style={styles.featuredGradient}
              />

              <View style={styles.featuredInfo}>
                <View>
                  <Text style={styles.featuredName}>
                    {pet.name || "Unknown Pet"}
                  </Text>
                  <Text style={styles.featuredType}>
                    {pet.breed || "Unknown Breed"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => navigateToLostPetDetails(pet)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.detailsButtonText}>Help Find</Text>
                </TouchableOpacity>
              </View>

              {pet.reward && (
                <Animated.View
                  style={styles.rewardTag}
                  entering={FadeIn.duration(400).delay(100)}
                >
                  <FontAwesome5 name="award" size={12} color="white" />
                  <Text style={styles.rewardText}>REWARD</Text>
                </Animated.View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Centered Pagination Indicators */}
      <View style={styles.paginationContainer}>
        {missingPets.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              currentMissingIndex === index && styles.paginationDotActive,
            ]}
            onPress={() => {
              scrollToIndex(missingScrollRef, index, CARD_WIDTH + 15);
              setCurrentMissingIndex(index);
              handlePress();
            }}
          />
        ))}
      </View>
    </View>
  ) : (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>
        No missing pets reported recently
      </Text>
    </View>
  )}
</View>

        {/* Pet Parenting Guide (Adoption Tips) - Enhanced */}
        <View style={[styles.section, { marginBottom: 30 }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Pet Parenting Guide</Text>
              <Text style={styles.sectionSubtitle}>
                Essential tips for new pet owners
              </Text>
            </View>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate("Resources")}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>View All</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.tipsContainer}>
            {[
              {
                title: "First Night Home",
                desc: "Make your pet's transition smooth and stress-free",
                icon: "moon",
                color: colors.accentPurple,
              },
              {
                title: "Training Basics",
                desc: "Essential commands every pet should know",
                icon: "graduation-cap",
                color: colors.primary,
              },
              {
                title: "Health Check",
                desc: "Signs your pet needs veterinary attention",
                icon: "heartbeat",
                color: colors.secondary,
              },
            ].map((tip, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.duration(400).delay(index * 100)}
              >
                <TouchableOpacity
                  style={styles.tipCard}
                  onPress={() =>
                    navigation.navigate("TipDetails", { id: index + 1 })
                  }
                  activeOpacity={0.9}
                >
                  <View
                    style={[
                      styles.tipIconContainer,
                      { backgroundColor: `${tip.color}20` },
                    ]}
                  >
                    <FontAwesome5 name={tip.icon} size={20} color={tip.color} />
                  </View>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipText}>{tip.desc}</Text>
                  <View style={styles.readMoreContainer}>
                    <Text style={styles.readMore}>Learn More</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={colors.primary}
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
    color: colors.darkGray,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.black,
  },
  quoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  quoteText: {
    fontSize: 14,
    color: colors.black,
    marginLeft: 8,
    fontStyle: "italic",
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.darkGray,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: ACTION_SIZE,
    height: ACTION_SIZE + 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.black,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.black,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.darkGray,
    marginTop: 4,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  loadingContainer: {
    height: CARD_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    marginHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noDataText: {
    color: colors.darkGray,
    fontSize: 16,
    fontWeight: "500",
  },
  sliderContainer: {
    position: "relative",
  },
  horizontalScroll: {
    paddingLeft: 24,
    paddingRight: 60,
  },
  sliderCardWrapper: {
    width: CARD_WIDTH,
    marginRight: 15,
  },
  featuredCard: {
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredImage: {
    width: "100%",
    height: "60%",
    resizeMode: "cover",
  },
  featuredGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "30%",
  },
  featuredInfo: {
    padding: 16,
    height: "40%",
    justifyContent: "space-between",
  },
  featuredName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
    marginBottom: 4,
  },
  featuredType: {
    fontSize: 14,
    color: colors.darkGray,
  },
  detailsButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  detailsButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  urgentTag: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.danger,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  urgentText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginLeft: 4,
  },
  nextButton: {
    position: "absolute",
    right: 20,
    top: "40%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  successStoryContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  successStoryGradient: {
    padding: 20,
  },
  successStoryTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  successStoryName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 8,
  },
  successStoryText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 22,
    marginBottom: 16,
  },
  successStoryButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  successStoryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
  },
  lostCard: {
    height: CARD_HEIGHT * 0.9,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lostImage: {
    width: "100%",
    height: "50%",
    resizeMode: "cover",
  },
  lostInfo: {
    padding: 16,
    height: "50%",
    justifyContent: "space-between",
  },
  lostName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
    marginBottom: 4,
  },
  lostType: {
    fontSize: 14,
    color: colors.darkGray,
  },
  lostMeta: {
    marginVertical: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 6,
  },
  rewardTag: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.rewardGold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginLeft: 4,
  },
  helpButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  helpButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  tipsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    overflow: "visible",
  },
  tipCard: {
    width: width * 0.6,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.black,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.darkGray,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  readMore: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginRight: 4,
  },
  sliderContainer: {
    position: "relative",
    marginTop: 12,
  },

  // Navigation controls (left/right arrows)
  navigationControls: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    top: "50%",
    marginTop: -15, // Half of the button height
    zIndex: 10,
  },
  navButton: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  // Centered pagination dots
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 10,
    height: 10,
    backgroundColor: colors.primary,
  },

  // Enhanced card styling for better presentation
  featuredCard: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 8,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  featuredName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  featuredType: {
    color: "#fff",
    fontSize: 14,
    marginTop: 2,
    opacity: 0.9,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featuredGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },

  // Enhanced lost pet card styling
  lostCard: {
    width: CARD_WIDTH,
    height: 230,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 8,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  lostImage: {
    width: "100%",
    height: 130,
    resizeMode: "cover",
  },
  lostInfo: {
    padding: 12,
  },
  lostName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
  },
  lostType: {
    fontSize: 14,
    color: colors.textGray,
    marginBottom: 8,
  },
  lostMeta: {
    marginVertical: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textGray,
    marginLeft: 6,
  },

  // Tags & Badges
  urgentTag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  urgentText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  rewardTag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  rewardText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },

  // Improved buttons
  detailsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  helpButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  helpButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default HomeScreen;

