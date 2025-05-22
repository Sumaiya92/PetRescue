import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Linking, ScrollView,Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { RefreshControl } from 'react-native-gesture-handler';


const colors = {
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
  furLight: '#F6AD55',
  furMedium: '#C05621',
  furDark: '#723F13',
  highlight: '#FEFCBF',
  rewardGold: '#D69E2E',
};
const { width: windowWidth } = Dimensions.get('window');

// Enhanced mock data with more tips and videos
const fetchPetTips = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
  {
    id: '1',
    title: 'Brushing Your Dog\'s Teeth',
    source: 'PetMD',
    description: 'Regular brushing prevents dental disease. Use pet-specific toothpaste and start slow.',
    category: 'Health',
    url: 'https://www.petmd.com/dog/grooming/how-to-brush-your-dogs-teeth',
    icon: 'tooth',
    difficulty: 'Intermediate',
    time: '5 mins',
  },
  {
    id: '2',
    title: 'Enrichment for Indoor Cats',
    source: 'ASPCA',
    description: 'Keep indoor cats stimulated with puzzle feeders, cat trees, and interactive play sessions.',
    category: 'Behavior',
    url: 'https://www.aspca.org/pet-care/cat-care/enrichment-indoor-cats',
    icon: 'cat',
    difficulty: 'Easy',
    time: '10 mins',
  },
  {
    id: '3',
    title: 'Puppy Socialization Guide',
    source: 'AKC',
    description: 'Proper socialization helps puppies grow into well-adjusted dogs. Start early with positive experiences.',
    category: 'Training',
    url: 'https://www.akc.org/expert-advice/training/puppy-socialization',
    icon: 'dog',
    difficulty: 'Beginner',
    time: '15 mins',
  },
  {
    id: '4',
    title: 'Pet-Safe Houseplants',
    source: 'AVMA',
    description: 'Create a pet-friendly home with these non-toxic plant alternatives to common dangerous plants.',
    category: 'Safety',
    url: 'https://www.avma.org/resources/pet-owners/petcare/household-hazards',
    icon: 'leaf',
    difficulty: 'Easy',
    time: '5 mins',
  },
  {
    id: '5',
    title: 'Senior Dog Nutrition',
    source: 'VCA',
    description: 'Adjust your older dog\'s diet to support joint health, digestion, and overall vitality.',
    category: 'Nutrition',
    url: 'https://vcahospitals.com/know-your-pet/nutrition-for-the-senior-dog',
    icon: 'food-apple',
    difficulty: 'Intermediate',
    time: '10 mins',
  },
  {
    id: '6',
    title: 'Understanding Cat Body Language',
    source: 'Cat Behavior Associates',
    description: 'Learn to interpret your cat\'s tail positions, ear movements, and vocalizations.',
    category: 'Behavior',
    url: 'https://catbehaviorassociates.com/cat-body-language',
    icon: 'ear-hearing',
    difficulty: 'Beginner',
    time: '8 mins',
  },
  {
    id: '7',
    title: 'DIY Pet First Aid Kit',
    source: 'Red Cross',
    description: 'Essential items every pet owner should have for emergencies and minor injuries.',
    category: 'Health',
    url: 'https://www.redcross.org/store/pet-first-aid-kits',
    icon: 'first-aid',
    difficulty: 'Easy',
    time: '15 mins',
  },
  {
    id: '8',
    title: 'How to Trim Your Pet’s Nails',
    source: 'PetMD',
    description: 'Learn safe and effective nail trimming techniques to avoid injuries or stress.',
    category: 'Grooming',
    url: 'https://www.petmd.com/dog/grooming/how-trim-dogs-nails',
    icon: 'scissors',
    difficulty: 'Intermediate',
    time: '10 mins',
  },
  {
    id: '9',
    title: 'Tips for Safe Car Travel with Pets',
    source: 'ASPCA',
    description: 'Make travel with pets safe and stress-free using proper restraints and planning.',
    category: 'Safety',
    url: 'https://www.aspca.org/pet-care/general-pet-care/travel-safety-tips',
    icon: 'car',
    difficulty: 'Beginner',
    time: '5 mins',
  },
  {
    id: '10',
    title: 'How to Train Your Dog to Sit',
    source: 'AKC',
    description: 'Teach your dog to sit using positive reinforcement and consistency.',
    category: 'Training',
    url: 'https://www.akc.org/expert-advice/training/train-dog-to-sit/',
    icon: 'dog-service',
    difficulty: 'Beginner',
    time: '5 mins',
  },
  {
    id: '11',
    title: 'Feeding Guidelines for Cats',
    source: 'VCA',
    description: 'Understand how much and how often you should feed your cat based on age and health.',
    category: 'Nutrition',
    url: 'https://vcahospitals.com/know-your-pet/feeding-your-cat',
    icon: 'bowl-food',
    difficulty: 'Easy',
    time: '7 mins',
  },
  {
    id: '12',
    title: 'Common Dog Poisons',
    source: 'Pet Poison Helpline',
    description: 'Know the top toxic substances that can harm dogs and how to react in emergencies.',
    category: 'Health',
    url: 'https://www.petpoisonhelpline.com/pet-owners/basics/top-10-dog-poisons/',
    icon: 'alert-triangle',
    difficulty: 'Intermediate',
    time: '6 mins',
  },
  {
    id: '13',
    title: 'Litter Box Training for Kittens',
    source: 'Humane Society',
    description: 'Help kittens learn to use the litter box with patience, cleanliness, and proper placement.',
    category: 'Training',
    url: 'https://www.humanesociety.org/resources/litter-box-training-kittens',
    icon: 'box',
    difficulty: 'Beginner',
    time: '8 mins',
  },
  {
    id: '14',
    title: 'Keeping Pets Safe During Disasters',
    source: 'Red Cross',
    description: 'Emergency prep for your pets during natural disasters like floods and fires.',
    category: 'Safety',
    url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/pet-disaster-preparedness.html',
    icon: 'alert-octagon',
    difficulty: 'Intermediate',
    time: '12 mins',
  },
  {
    id: '15',
    title: 'Mental Stimulation for Dogs',
    source: 'AKC',
    description: 'Use brain games, scent work, and interactive toys to keep your dog mentally sharp.',
    category: 'Behavior',
    url: 'https://www.akc.org/expert-advice/lifestyle/mental-stimulation-for-dogs/',
    icon: 'brain',
    difficulty: 'Intermediate',
    time: '10 mins',
  },
   {
    id: '16',
    title: 'Preventing Pet Obesity',
    source: 'PetMD',
    description: 'Monitor your pet’s weight from a young age to prevent obesity-related health issues.',
    category: 'Health',
    url: 'https://www.petmd.com/dog/general-health/pet-care-tasks-easily-overlooked-by-pet-parents',
    icon: 'scale-balance',
    difficulty: 'Intermediate',
    time: '5 mins',
  },
  {
    id: '17',
    title: 'Regular Dental Care for Pets',
    source: 'PetMD',
    description: 'Brushing your pet’s teeth can prevent dental diseases and improve overall health.',
    category: 'Health',
    url: 'https://www.petmd.com/dog/general-health/pet-care-tasks-easily-overlooked-by-pet-parents',
    icon: 'tooth',
    difficulty: 'Intermediate',
    time: '5 mins',
  },
  {
    id: '18',
    title: 'Keeping Your Dog Healthy',
    source: 'AKC',
    description: 'Maintain your dog’s health with proper diet, exercise, grooming, and regular vet visits.',
    category: 'Health',
    url: 'https://www.akc.org/expert-advice/health/how-to-keep-your-dog-healthy/',
    icon: 'heartbeat',
    difficulty: 'Beginner',
    time: '7 mins',
  },
  {
    id: '19',
    title: 'Back-to-School Tips for Pets',
    source: 'VCA Animal Hospitals',
    description: 'Ease your pet into new routines with enrichment toys and consistent schedules.',
    category: 'Behavior',
    url: 'https://vcahospitals.com/shop/articles/7-back-to-school-tips',
    icon: 'calendar-clock',
    difficulty: 'Easy',
    time: '6 mins',
  },
  {
    id: '20',
    title: 'General Pet Care Guidelines',
    source: 'AVMA',
    description: 'Educate yourself on pet care and health problems using reliable sources.',
    category: 'Health',
    url: 'https://www.avma.org/resources-tools/pet-owners/petcare',
    icon: 'book-open',
    difficulty: 'Beginner',
    time: '10 mins',
  },
  {
    id: '21',
    title: 'Vaccination Importance for Dogs',
    source: 'PetMD',
    description: 'Stay up to date on your dog’s vaccinations to prevent common diseases.',
    category: 'Health',
    url: 'https://www.petmd.com/dog/general-health/tips-for-a-healthy-dog',
    icon: 'syringe',
    difficulty: 'Intermediate',
    time: '5 mins',
  },
  {
    id: '22',
    title: 'Dog Grooming Basics',
    source: 'ASPCA',
    description: 'Regular brushing helps keep your dog’s coat clean and reduces shedding.',
    category: 'Grooming',
    url: 'https://www.aspca.org/pet-care/dog-care/dog-grooming-tips',
    icon: 'brush',
    difficulty: 'Easy',
    time: '5 mins',
  },
  {
    id: '23',
    title: 'First Aid Tips for Pet Owners',
    source: 'AVMA',
    description: 'Keep a kit of basic first aid supplies for your pets and know how to use them.',
    category: 'Health',
    url: 'https://www.avma.org/resources-tools/pet-owners/emergencycare/first-aid-tips-pet-owners',
    icon: 'first-aid',
    difficulty: 'Intermediate',
    time: '10 mins',
  },
];

};

const fetchPetVideos = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));

  return [
    {
      id: 'v6',
      title: 'Pet Photography Tips & Posing Tricks',
      channel: 'Westcott Lighting',
      thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
      views: '78K',
      duration: '18:45',
      url: 'https://www.youtube.com/watch?v=h_IOAkXdf-A',
    },
    {
      id: 'v1',
      title: 'The 5 Essential Dog Commands (and HOW to teach them)',
      channel: 'Dog Training Academy',
      thumbnail: 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80',
      views: '1.2M',
      duration: '8:32',
      url: 'https://www.youtube.com/watch?v=lqd4-q7B4Jg',
    },
    {
      id: 'v2',
      title: 'FULL CAT GROOMING',
      channel: 'National Cat Groomers Institute',
      thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
      views: '890K',
      duration: '12:15',
      url: 'https://www.youtube.com/watch?v=aew425tNxAU',
    },
    {
      id: 'v3',
      title: 'DIY Dog Toys Made From Common Household Items',
      channel: 'Pet DIY Channel',
      thumbnail: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01',
      views: '450K',
      duration: '6:45',
      url: 'https://www.youtube.com/watch?v=jEYUsjkZqvI',
    },
    {
      id: 'v4',
      title: 'Get Your Senior Dog Moving with These Simple Exercises',
      channel: 'Golden Years Pets',
      thumbnail: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
      views: '320K',
      duration: '9:18',
      url: 'https://www.youtube.com/watch?v=2KrSsRSlnZE',
    },
    {
      id: 'v5',
      title: ' Build a DREAM Cat Room ',
      channel: 'Feline Design',
      thumbnail: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce',
      views: '610K',
      duration: '14:22',
      url: 'https://www.youtube.com/watch?v=l8NcHWX5BVY',
    },
      {
      id: 'v14',
      title: 'How to Brush Your Dog’s Teeth - AKC Vet’s Corner',
      channel: 'American Kennel Club',
      thumbnail: 'https://img.youtube.com/vi/F6S50BZU1D0/hqdefault.jpg',
      views: '180K',
      duration: '5:03',
      url: 'https://www.youtube.com/watch?v=F6S50BZU1D0',
    },
    {
      id: 'v7',
      title: 'Puzzle Toys for Cats: Everything You Need to Know!',
      channel: 'Jackson Galaxy',
      thumbnail: 'https://img.youtube.com/vi/mxSGIbfqprA/hqdefault.jpg',
      views: '170K',
      duration: '10:15',
      url: 'https://www.youtube.com/watch?v=mxSGIbfqprA',
    },
    {
      id: 'v8',
      title: 'How to Get Started in Dog Agility | Dog Tips and Tricks',
      channel: 'American Kennel Club',
      thumbnail: 'https://img.youtube.com/vi/vkxggodZzqc/hqdefault.jpg',
      views: '250K',
      duration: '6:10',
      url: 'https://www.youtube.com/watch?v=vkxggodZzqc',
    },
    {
      id: 'v9',
      title: 'Cat Body Language | Cats Protection Behaviour Guides',
      channel: 'Cats Protection',
      thumbnail: 'https://img.youtube.com/vi/ZI-usLLWerI/hqdefault.jpg',
      views: '90K',
      duration: '4:35',
      url: 'https://www.youtube.com/watch?v=ZI-usLLWerI',
    },
    {
      id: 'v10',
      title: 'How to Crate Train Your Puppy (Kennel Up)',
      channel: 'McCann Dog Training',
      thumbnail: 'https://img.youtube.com/vi/7SR45Va0Pvg/hqdefault.jpg',
      views: '1.1M',
      duration: '9:18',
      url: 'https://www.youtube.com/watch?v=7SR45Va0Pvg',
    },
    
  ];
};


const categories = ['All', 'Health', 'Behavior', 'Training', 'Safety', 'Nutrition'];

const PetTipsAndTricks = () => {
  const [tips, setTips] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('tips');
  const [bookmarkedTips, setBookmarkedTips] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tipsData, videosData] = await Promise.all([
        fetchPetTips(),
        fetchPetVideos()
      ]);
      setTips(tipsData);
      setVideos(videosData);
    } catch (error) {
      console.error('Error fetching pet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [tipsData, videosData] = await Promise.all([
        fetchPetTips(),
        fetchPetVideos()
      ]);
      setTips(tipsData);
      setVideos(videosData);
    } catch (error) {
      console.error('Error refreshing pet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (tipId) => {
    if (bookmarkedTips.includes(tipId)) {
      setBookmarkedTips(bookmarkedTips.filter(id => id !== tipId));
    } else {
      setBookmarkedTips([...bookmarkedTips, tipId]);
    }
  };

  const filteredTips = selectedCategory === 'All' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

 const renderTipItem = ({ item }) => (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <MaterialCommunityIcons 
          name={item.icon} 
          size={24} 
          color={colors.primary} 
          style={styles.tipIcon}
        />
        <View style={styles.tipTitleContainer}>
          <Text style={styles.tipTitle}>{item.title}</Text>
          <View style={styles.metaContainer}>
            <View style={[styles.metaPill, { backgroundColor: colors.secondaryLight }]}>
              <Text style={[styles.metaText, { color: colors.secondary }]}>{item.difficulty}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
          <Feather 
            name={bookmarkedTips.includes(item.id) ? "bookmark" : "bookmark"} 
            size={20} 
            color={bookmarkedTips.includes(item.id) ? colors.secondary : colors.mediumGray} 
          />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.tipDescription}>{item.description}</Text>
      
      <View style={styles.tipFooter}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.categoryText, { color: colors.primaryDark }]}>{item.category}</Text>
        </View>
        <TouchableOpacity 
          style={styles.sourceButton}
          onPress={() => openLink(item.url)}
        >
          <Text style={styles.sourceText}>Read on {item.source}</Text>
          <Feather name="external-link" size={14} color={colors.info} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVideoItem = ({ item }) => (
    <View style={styles.videoCard}>
      <Image 
        source={{ uri: item.thumbnail }} 
        style={styles.thumbnail}
        resizeMode="cover"
      />
     
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.channelName}>{item.channel}</Text>
        <View style={styles.videoStats}>
          <View style={styles.statItem}>
            <Feather name="eye" size={14} color={colors.darkGray} />
            <Text style={styles.statText}>{item.views} views</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.watchButton}
          onPress={() => openLink(item.url)}
        >
          <Feather name="play-circle" size={16} color={colors.white} />
          <Text style={styles.watchButtonText}>Watch Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryButton, 
        selectedCategory === item && styles.selectedCategory
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item && styles.selectedCategoryText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading pet resources...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Pet Care Resources</Text>
          <Text style={styles.headerSubtitle}>Expert tips and videos for your furry friends</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Feather 
            name="refresh-cw" 
            size={20} 
            color={colors.primary} 
            style={refreshing ? styles.refreshingIcon : null}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'tips' && styles.activeTab
          ]} 
          onPress={() => setActiveTab('tips')}
          disabled={activeTab === 'tips'}
        >
          <MaterialCommunityIcons 
            name="book-open-page-variant" 
            size={20} 
            color={activeTab === 'tips' ? colors.white : colors.primary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'tips' && styles.activeTabText
          ]}>
            Tips & Guides
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'videos' && styles.activeTab
          ]} 
          onPress={() => setActiveTab('videos')}
          disabled={activeTab === 'videos'}
        >
          <Feather 
            name="video" 
            size={20} 
            color={activeTab === 'videos' ? colors.white : colors.primary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'videos' && styles.activeTabText
          ]}>
            Video Tutorials
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'tips' ? (
        <FlatList
          data={filteredTips}
          keyExtractor={item => item.id}
          renderItem={renderTipItem}
          contentContainerStyle={styles.tipsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <>
              {/* Categories */}
              <View style={styles.categorySection}>
                <Text style={styles.sectionTitle}>Browse by Category</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={categories}
                  keyExtractor={item => item}
                  renderItem={renderCategoryButton}
                  contentContainerStyle={styles.categoryList}
                />
              </View>

              {/* Tips Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'All' ? 'All Tips' : `${selectedCategory} Tips`}
                </Text>
                <Text style={styles.resultsCount}>{filteredTips.length} results</Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="info" size={24} color={colors.mediumGray} />
              <Text style={styles.emptyStateText}>No tips found for this category</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={item => item.id}
          renderItem={renderVideoItem}
          contentContainerStyle={styles.videosListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Recommended Videos</Text>
          }
          ListFooterComponent={<View style={{ height: 24 }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.black,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  refreshingIcon: {
    transform: [{ rotate: '360deg' }],
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    padding: 6,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    marginLeft: 8,
    fontWeight: '600',
    color: colors.primary,
    fontSize: 14,
  },
  activeTabText: {
    color: colors.white,
  },
  categorySection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    paddingHorizontal: 16,
  },
  categoryList: {
    paddingTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.darkGray,
    fontWeight: '500',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  resultsCount: {
    fontSize: 13,
    color: colors.darkGray,
  },
  tipsListContent: {
    paddingBottom: 24,
  },
  videosListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  tipCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipTitleContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipDescription: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 13,
    color: colors.darkGray,
    marginRight: 6,
    fontStyle: 'italic',
  },
  videoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnail: {
    width: '100%',
    height: windowWidth * 0.56, // 16:9 aspect ratio
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 6,
  },
  channelName: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
  },
  videoStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 13,
    color: colors.darkGray,
    marginLeft: 4,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  watchButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  loadingText: {
    marginTop: 16,
    color: colors.darkGray,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  emptyStateText: {
    marginTop: 12,
    color: colors.mediumGray,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PetTipsAndTricks;