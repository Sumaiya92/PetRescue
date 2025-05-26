import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, ScrollView, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const colors = {
  primary: '#4A6FA5',
  secondary: '#E74C3C',
  accent: '#3498DB',
  white: '#FFFFFF',
  lightGray: '#ECF0F1',
  darkGray: '#95A5A6',
  black: '#1A1A1A',
};

const { width } = Dimensions.get('window');

// Optimized sidebar width calculation
const getSidebarWidth = () => {
  if (width <= 320) return width * 0.75; // 75% for very small screens
  if (width <= 375) return width * 0.70; // 70% for small screens
  if (width <= 414) return width * 0.65; // 65% for medium screens
  return Math.min(width * 0.60, 280); // 60% for larger screens, max 280px
};

const SIDEBAR_WIDTH = getSidebarWidth();

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Update your menu items to match exact screen names from your navigator
  const menuItems = [
    { name: 'MainTabs', label: 'Home', icon: <Feather name="home" size={18} color={colors.white} /> },
    { name: 'Shelter', label: 'Shelters', icon: <Feather name="heart" size={18} color={colors.white} /> },
    { name: 'Donate', label: 'Donations', icon: <Feather name="dollar-sign" size={18} color={colors.white} /> },
    { name: 'QuickDoc', label: 'Pet Health', icon: <Feather name="activity" size={18} color={colors.white} /> },
    { name: 'PetSearch', label: 'Lost Pets', icon: <Feather name="map-pin" size={18} color={colors.white} /> },
    { name: 'Tips', label: 'Care Guide', icon: <Feather name="book-open" size={18} color={colors.white} /> },
    { name: 'PetActivityRoulette', label: 'PetScape', icon: <Feather name="rotate-cw" size={18} color={colors.white} /> },
  ];

  const supportItems = [
    { name: 'ContactScreen', label: 'Contact Us', icon: <Feather name="mail" size={18} color={colors.white} /> },
    { name: 'AboutScreen', label: 'About PawSafe', icon: <Feather name="info" size={18} color={colors.white} /> },
  ];

  // Update the navigation handler
  const handleMenuItemPress = (screenName) => {
    try {
      console.log('Attempting to navigate to:', screenName);
      navigation.navigate(screenName);
      onClose();
    } catch (error) {
      console.error('Navigation error:', error);
      onClose();
    }
  };

  const itemAnimations = useRef([...menuItems, ...supportItems].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350, // Slightly faster animation
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        ...itemAnimations.map((anim, index) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            delay: 80 + index * 40, // Slightly faster stagger
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250, // Faster close animation
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        ...itemAnimations.map(anim =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }
  }, [isOpen]);

  // Only render the sidebar when it's open or animating
  if (!isOpen && slideAnim._value === -SIDEBAR_WIDTH) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlayTouchable}
          onPress={onClose}
        >
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
        </TouchableOpacity>
      )}

      <Animated.View style={[styles.sidebar, { 
        width: SIDEBAR_WIDTH,
        transform: [{ translateX: slideAnim }] 
      }]}>
        <View style={styles.sidebarContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.headerTitle}>PawSafe</Text>
              <Text style={styles.headerSubtitle}>For animal welfare</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.menuContainer}>
            <Text style={styles.sectionTitle}>Menu</Text>
            {menuItems.map((item, index) => (
              <Animated.View
                key={`menu-${item.name}`}
                style={{
                  opacity: itemAnimations[index],
                  transform: [
                    {
                      translateX: itemAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 0], // Reduced slide distance
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item.name)}
                >
                  <View style={styles.iconContainer}>
                    {item.icon}
                  </View>
                  <Text style={styles.menuText}>{item.label}</Text>
                  <Feather name="chevron-right" size={14} color={colors.darkGray} />
                </TouchableOpacity>
              </Animated.View>
            ))}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Support</Text>
            {supportItems.map((item, index) => (
              <Animated.View
                key={`support-${item.name}`}
                style={{
                  opacity: itemAnimations[index + menuItems.length],
                  transform: [
                    {
                      translateX: itemAnimations[index + menuItems.length].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 0],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item.name)}
                >
                  <View style={styles.iconContainer}>
                    {item.icon}
                  </View>
                  <Text style={styles.menuText}>{item.label}</Text>
                  <Feather name="chevron-right" size={14} color={colors.darkGray} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Version 2.4.1</Text>
            <Text style={styles.footerCopyright}>© 2023 PawSafe</Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    zIndex: 100,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  sidebarContent: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: 50,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20, // Reduced padding
    paddingBottom: 14,
    marginBottom: 8,
  },
  logoContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24, // Slightly smaller
    fontWeight: '700',
    color: colors.white,
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13, // Slightly smaller
    color: colors.lightGray,
    marginTop: 3,
    fontFamily: 'System',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 6, // Reduced padding
    marginTop: -6,
    marginRight: -6,
  },
  menuContainer: {
    paddingHorizontal: 12, // Reduced padding
    paddingBottom: 16,
  },
  sectionTitle: {
    color: colors.lightGray,
    fontSize: 12, // Slightly smaller
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 10,
    marginLeft: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Reduced padding
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  iconContainer: {
    width: 20, // Reduced width
    alignItems: 'center',
    marginRight: 12, // Reduced margin
  },
  menuText: {
    color: colors.white,
    fontSize: 15, // Slightly smaller
    fontWeight: '500',
    flex: 1,
    fontFamily: 'System',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12, // Reduced margin
    marginHorizontal: 12,
  },
  footer: {
    padding: 20, // Reduced padding
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontSize: 11, // Slightly smaller
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 3,
  },
  footerCopyright: {
    fontSize: 11, // Slightly smaller
    color: colors.darkGray,
    textAlign: 'center',
  },
});

export default Sidebar;