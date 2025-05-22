
import 'react-native-get-random-values';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import screens
import HomeScreen from './screens/Home';
import AdoptionScreen from './screens/Adoption';
import PetDetailsScreen from './screens/PetDetails';
import LostFoundScreen from './screens/lostandfound';
import ReportPetScreen from './screens/PetReport';
import CommunityScreen from './screens/Community';
import CreatePostScreen from './screens/createPost';
import PetScannerScreen from './screens/petScanneer';
import ChatbotScreen from './screens/chatbox';
import VetSupportScreen from './screens/Vet';
import PostDetailScreen from './screens/postDetails';
import ProfileScreen from './screens/profile';
import AddPetScreen from './screens/AddPet';
import ShelterScreen from './screens/ShelterScreen';
import ChatbotButton from './screens/ChatbotButton';
import Sidebar from './screens/SideBar';
import PetFind from './screens/PetFind';
import Donation from './screens/Donation';
import PetDoc from './screens/petdoc';
import PetTips from './screens/Tips';
import PetSearch from './screens/petSearch';
import LostPetDetails from './screens/LostPet';
import PetActivityRoulette from './screens/PetActivityRoulette';
import FloatingButtonGroup from "./components/FloatingButtonGroup";
import SearchScreen from './screens/SearchResults';
import HelpScreen from './screens/HelpScreen';
import ContactScreen from './screens/Contact';
import AboutScreen from "./screens/AboutScreen";

// Import colors
const colors = {
  primary: '#4A6FA5',       // Soft blue (like Aussie eyes)
  primaryLight: '#E8F0FE',  // Very light blue for backgrounds
  primaryDark: '#2C4A7A',   // Darker blue for text/accents
  secondary: '#FF7E5F',     // Coral accent (paws/noses)
  secondaryLight: '#FFE8E2', // Light coral for highlights
  white: '#FFFFFF',
  lightGray: '#F5F7FA',     // Background color
  mediumGray: '#E1E5EB',    // Borders
  darkGray: '#6B7C93',      // Secondary text
  black: '#2D3748',         // Primary text
  success: '#48BB78',       // Green (for available pets)
  warning: '#ED8936',       // Orange (urgent notices)
  danger: '#E53E3E',        // Red (important alerts)
  info: '#4299E1',          // Blue (information)
  furLight: '#F6AD55',      // Light fur tones
  furMedium: '#C05621',     // Medium fur tones
  furDark: '#723F13',       // Dark fur tones
  highlight: '#FEFCBF',     // Yellow highlight
  rewardGold: '#D69E2E',    // Gold for reward badges
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabBarIcon = ({ name, focused, size, color }) => {
  return (
    <View style={[
      styles.tabIconContainer,
      focused ? styles.tabIconContainerFocused : {}
    ]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
};

const TabBarLabel = ({ children, focused }) => {
  return (
    <Text style={[
      styles.tabBarLabel,
      focused ? styles.tabBarLabelFocused : {}
    ]}>
      {children}
    </Text>
  );
};

const HeaderBackButton = ({ navigation }) => (
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color={colors.white} />
  </TouchableOpacity>
);

// Stacks
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false,
    animation: 'slide_from_right',

   }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
    <Stack.Screen name="LostPetDetails" component={LostPetDetails} />
    <Stack.Screen name="Search" component={SearchScreen} />
  </Stack.Navigator>
);

const AdoptionStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdoptionMain" component={AdoptionScreen} />
    <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
    <Stack.Screen name="AddPet" component={AddPetScreen} />
  </Stack.Navigator>
);

const ReportStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ReportMain" component={LostFoundScreen} />
    <Stack.Screen name="ReportPet" component={ReportPetScreen} />
    <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
    <Stack.Screen name="LostPetDetails" component={LostPetDetails} />
  </Stack.Navigator>
);

const CommunityStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CommunityMain" component={CommunityScreen} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
  </Stack.Navigator>
);

const SupportStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SupportMain" component={VetSupportScreen} />
    <Stack.Screen name="Chatbot" component={ChatbotScreen} />
  </Stack.Navigator>
);

const ScannerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PetScanner" component={PetScannerScreen} />
  </Stack.Navigator>
);

const ShelterStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Shelter" component={ShelterScreen} />
  </Stack.Navigator>
);

const createSecondaryStack = (ScreenComponent, name, title) => {
  return () => (
    <Stack.Navigator>
      <Stack.Screen
        name={name}
        component={ScreenComponent}
        options={{
          title,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
};

const PetFindStack = createSecondaryStack(PetFind, "PetFind", "Pet Match");
const PetTipsStack = createSecondaryStack(PetTips, "PetTips", "Pet Tips");
const PetSearchStack = createSecondaryStack(PetSearch, "PetSearch", "Find Lost Pet");
const DonationStack = createSecondaryStack(Donation, "Donation", "Donate");
const PetDocStack = createSecondaryStack(PetDoc, "QuickDoc", "Quick Doc");

const TabBarComponent = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={[colors.white, colors.primaryLight]}
        style={styles.tabBarGradient}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          let iconName;
          let iconSize = 22;
          
          switch (route.name) {
            case 'HomeTab':
              iconName = isFocused ? 'home' : 'home-outline';
              iconSize = 26;
              break;
            case 'AdoptionTab':
              iconName = isFocused ? 'paw' : 'paw-outline';
              break;
            case 'ReportTab':
              iconName = isFocused ? 'alert-circle' : 'alert-circle-outline';
              break;
            case 'CommunityTab':
              iconName = isFocused ? 'people' : 'people-outline';
              break;
            case 'SupportTab':
              iconName = isFocused ? 'medkit' : 'medkit-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Navigate to the specific route
              if (route.name === 'HomeTab') {
                navigation.navigate(route.name, { screen: 'Home' });
              } else if (route.name === 'ReportTab') {
                navigation.navigate(route.name, { screen: 'ReportMain' });
              } else {
                navigation.navigate(route.name);
              }
            }
          };

          const isHomeTab = route.name === 'HomeTab';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                isHomeTab ? styles.homeTabItem : {},
              ]}
              activeOpacity={0.7}
            >
              {isHomeTab ? (
                <View style={styles.homeTabIconWrapper}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.homeTabIconContainer}
                  >
                    <Ionicons 
                      name={iconName} 
                      size={iconSize} 
                      color={colors.white} 
                    />
                  </LinearGradient>
                </View>
              ) : (
                <TabBarIcon 
                  name={iconName} 
                  focused={isFocused} 
                  size={iconSize} 
                  color={isFocused ? colors.primary : colors.darkGray} 
                />
              )}
              
              {!isHomeTab && (
                <TabBarLabel focused={isFocused}>
                  {label}
                </TabBarLabel>
              )}
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="HomeTab"
    tabBar={props => <TabBarComponent {...props} />}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tab.Screen name="AdoptionTab" component={AdoptionStack} options={{ title: 'Adopt' }} />
    <Tab.Screen name="ReportTab" component={ReportStack} options={{ title: 'Report' }} />
    <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
    <Tab.Screen name="CommunityTab" component={CommunityStack} options={{ title: 'Community' }} />
    <Tab.Screen name="SupportTab" component={SupportStack} options={{ title: 'Vet' }} />
  </Tab.Navigator>
);

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <View style={{ flex: 1 }}>
            <FloatingButtonGroup />
            <Stack.Navigator
              initialRouteName="MainTabs"
              screenOptions={{
                headerStyle: {
                  backgroundColor: colors.primary,
                  elevation: 0,
                  shadowOpacity: 0,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                },
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => setSidebarOpen(true)}
                    style={{ marginLeft: 15 }}
                  >
                    <Ionicons name="menu" size={28} color={colors.white} />
                  </TouchableOpacity>
                ),
              }}
            >
            <Stack.Screen 
  name="MainTabs" 
  component={MainTabs} 
  options={{ 
    title: '',
    headerTitle: () => (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 20 }}>PawSafe</Text>
        <Ionicons name="paw" size={22} color={colors.white} style={{ marginLeft: 5 }} />
      </View>
    ),
  }} 
/>
              <Stack.Screen name="PetScanner" component={PetScannerScreen} options={{ title: 'Scan Pet' }} />
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Your Profile' }} />
              <Stack.Screen name="Shelter" component={ShelterStack} options={{ headerShown: false }} />
              <Stack.Screen name="PetFind" component={PetFindStack} options={{ headerShown: false }} />
              <Stack.Screen name="Tips" component={PetTipsStack} options={{ headerShown: false }} />
              <Stack.Screen name="PetSearch" component={PetSearchStack} options={{ headerShown: false }} />
              <Stack.Screen name="Donate" component={DonationStack} options={{ headerShown: false }} />
              <Stack.Screen name="QuickDoc" component={PetDocStack} options={{ headerShown: false }} />
              <Stack.Screen name="PetActivityRoulette" component={PetActivityRoulette} options={{ title: 'Fun Activities' }} />
  
              <Stack.Screen name='ContactScreen' component={ContactScreen} options={{ headerShown: false }} />
              <Stack.Screen name='AboutScreen' component={AboutScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
          </View>
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  tabBarGradient: {
    flex: 1,
    flexDirection: 'row',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 15,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  homeTabItem: {
    marginTop: -25,
  },
  homeTabIconWrapper: {
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeTabIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.white,
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  tabIconContainerFocused: {
    backgroundColor: colors.primaryLight,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    color: colors.darkGray,
  },
  tabBarLabelFocused: {
    color: colors.primary,
    fontWeight: '700',
  },
  backButton: {
    marginLeft: 15,
    padding: 5,
  },
  profileButton: {
    marginRight: 15,
    padding: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;