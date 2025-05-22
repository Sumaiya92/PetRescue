import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Keyboard,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BASE_URL from "./config";

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

const { width } = Dimensions.get("window");
const defaultImage = "https://images.unsplash.com/photo-1453227588063-bb302b62f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    pets: [],
    shelters: [],
    lostFoundPets: [],
    veterinarians: [],
    posts: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setErrorMessage("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    Keyboard.dismiss();

    try {
      const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data);
      setSearchPerformed(true);
    } catch (error) {
      console.error("Search error:", error);
      setErrorMessage("Failed to fetch search results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredResults = () => {
    if (activeCategory === "all") {
      return [
        ...searchResults.pets.map(item => ({ ...item, type: "pet" })),
        ...searchResults.shelters.map(item => ({ ...item, type: "shelter" })),
        ...searchResults.lostFoundPets.map(item => ({ ...item, type: "lostFound" })),
        ...searchResults.veterinarians.map(item => ({ ...item, type: "vet" })),
        ...searchResults.posts.map(item => ({ ...item, type: "post" })),
      ];
    } else {
      return searchResults[activeCategory]?.map(item => ({ ...item, type: activeCategory })) || [];
    }
  };

  const filteredResults = getFilteredResults();

  const hasDetailPage = (itemType) => {
    return itemType === "pet" || itemType === "lostFound";
  };

  const navigateToDetails = (item) => {
    switch (item.type) {
      case "pet":
        navigation.navigate("PetDetails", {
          petId: item._id,
          petName: item.name,
          petBreed: item.breed,
        });
        break;
      case "lostFound":
        navigation.navigate("LostPetDetails", { petId: item._id });
        break;
      default:
        break;
    }
  };

  const formatLocation = (location) => {
    if (!location) return "";
    if (typeof location === "string") return location;
    if (typeof location === "object") {
      if (location.city) return location.city;
      if (location.address) return typeof location.address === 'string' ? location.address : 'Address available';
      return 'Location available';
    }
    return "";
  };

  const renderItem = ({ item }) => {
    const title = item.name || item.hospitalName || item.username || "Unknown";
    const subtitle = item.breed || formatLocation(item.location) || item.caption || "";
    
    let icon;
    let iconColor;
    
    switch (item.type) {
      case "pet":
        icon = "paw";
        iconColor = colors.primary;
        break;
      case "shelter":
        icon = "home";
        iconColor = colors.secondary;
        break;
      case "lostFound":
        icon = "search";
        iconColor = colors.warning;
        break;
      case "vet":
        icon = "medkit";
        iconColor = colors.success;
        break;
      case "post":
        icon = "image";
        iconColor = colors.info;
        break;
      default:
        icon = "information-circle";
        iconColor = colors.darkGray;
    }

    const canNavigate = hasDetailPage(item.type);

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => canNavigate ? navigateToDetails(item) : null}
        activeOpacity={canNavigate ? 0.7 : 1}
      >
        <View style={[
          styles.iconContainer, 
          { backgroundColor: `${iconColor}20` }
        ]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.resultSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          
          <View style={styles.resultMeta}>
            <View style={[styles.resultBadge, { backgroundColor: `${iconColor}20` }]}>
              <Ionicons name={icon} size={12} color={iconColor} />
              <Text style={[styles.resultBadgeText, { color: iconColor }]}>
                {item.type === "lostFound" ? "Lost Pet" : 
                 item.type === "vet" ? "Veterinarian" : 
                 item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        {canNavigate && (
          <Ionicons name="chevron-forward" size={20} color={colors.darkGray} />
        )}
      </TouchableOpacity>
    );
  };

  const renderCategoryFilter = () => {
    const categories = [
      { id: "all", label: "All", count: filteredResults.length },
      { id: "pets", label: "Pets", count: searchResults.pets?.length || 0 },
      { id: "shelters", label: "Shelters", count: searchResults.shelters?.length || 0 },
      { id: "lostFoundPets", label: "Lost Pets", count: searchResults.lostFoundPets?.length || 0 },
      { id: "veterinarians", label: "Vets", count: searchResults.veterinarians?.length || 0 },
      { id: "posts", label: "Posts", count: searchResults.posts?.length || 0 },
    ];

    return (
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryPill,
                activeCategory === item.id && styles.activeCategoryPill,
              ]}
              onPress={() => setActiveCategory(item.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === item.id && styles.activeCategoryText,
                ]}
              >
                {item.label} {item.count > 0 && `(${item.count})`}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (!searchPerformed) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={60} color={colors.mediumGray} />
          <Text style={styles.emptyTitle}>Search for pets, shelters, and more</Text>
          <Text style={styles.emptySubtitle}>
            Type something in the search bar to begin
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome5 name="sad-tear" size={50} color={colors.mediumGray} />
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptySubtitle}>
          Try different keywords or check your spelling
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pets, shelters and more"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="close-circle" size={18} color={colors.darkGray} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.8}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Loading Indicator */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <>
          {/* Category Filter */}
          {searchPerformed && renderCategoryFilter()}

          {/* Results List */}
          <FlatList
            data={filteredResults}
            keyExtractor={(item, index) => `${item.type}-${item._id || index}`}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.resultsContainer,
              filteredResults.length === 0 && styles.emptyResultsContainer
            ]}
            ListEmptyComponent={renderEmptyState}
            ListHeaderComponent={
              searchPerformed && filteredResults.length > 0 ? (
                <Text style={styles.resultsHeader}>
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
                </Text>
              ) : null
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: colors.black,
  },
  searchBarContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.black,
  },
  clearButton: {
    padding: 6,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "#FFE8E8",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.darkGray,
  },
  categoriesWrapper: {
    backgroundColor: colors.white,
    paddingVertical: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  activeCategoryPill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.darkGray,
  },
  activeCategoryText: {
    color: colors.white,
  },
  resultsContainer: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyResultsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  resultsHeader: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.darkGray,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  resultItem: {
    flexDirection: "row",
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 2,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 8,
    textAlign: "center",
  },
});

export default SearchScreen;