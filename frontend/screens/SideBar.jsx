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

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = useNavigation();
   const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;


  // Update your menu items to match exact screen names from your navigator
  const menuItems = [
    { name: 'MainTabs', label: 'Home', icon: <Feather name="home" size={20} color={colors.white} /> },
    { name: 'Shelter', label: 'Shelters', icon: <Feather name="heart" size={20} color={colors.white} /> },
    { name: 'Donate', label: 'Donations', icon: <Feather name="dollar-sign" size={20} color={colors.white} /> }, // Changed from DonationStack to Donate
    { name: 'QuickDoc', label: 'Pet Health', icon: <Feather name="activity" size={20} color={colors.white} /> }, // Changed from PetDocStack to QuickDoc
    { name: 'PetSearch', label: 'Lost Pets', icon: <Feather name="map-pin" size={20} color={colors.white} /> }, // Changed from PetSearchStack to PetSearch
    { name: 'Tips', label: 'Care Guide', icon: <Feather name="book-open" size={20} color={colors.white} /> }, // Changed from PetTipsStack to Tips
    { name: 'PetActivityRoulette', label: 'Pet Roulette', icon: <Feather name="rotate-cw" size={20} color={colors.white} /> }, // Changed from RouletteScreen to PetActivityRoulette
  ];

  const supportItems = [
    { name: 'ContactScreen', label: 'Contact Us', icon: <Feather name="mail" size={20} color={colors.white} /> },
    { name: 'AboutScreen', label: 'About PawSafe', icon: <Feather name="info" size={20} color={colors.white} /> },
  ];

  // Update the navigation handler
  const handleMenuItemPress = (screenName) => {
    try {
       console.log('Attempting to navigate to:', screenName);
      navigation.navigate(screenName);
      onClose();
    } catch (error) {
      console.error('Navigation error:', error);
      // Handle error or show a message to the user
      onClose();
    }
  };


  const itemAnimations = useRef([...menuItems, ...supportItems].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        ...itemAnimations.map((anim, index) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay: 100 + index * 50,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width, // Use screen width here
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
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
  if (!isOpen && slideAnim._value === -width) {
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

      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.sidebarContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.headerTitle}>PawSafe</Text>
              <Text style={styles.headerSubtitle}>For animal welfare</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.white} />
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
                        outputRange: [-50, 0],
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
                  <Feather name="chevron-right" size={16} color={colors.darkGray} />
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
                        outputRange: [-50, 0],
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
                  <Feather name="chevron-right" size={16} color={colors.darkGray} />
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
    width: '85%',
    maxWidth: 320,
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
    paddingHorizontal: 24,
    paddingBottom: 16,
    marginBottom: 10,
  },
  logoContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    fontFamily: 'System', // Use your custom font here if available
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.lightGray,
    marginTop: 4,
    fontFamily: 'System',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 8,
    marginTop: -8,
    marginRight: -8,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: colors.lightGray,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    marginLeft: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    fontFamily: 'System',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'center',
  },
});

export default Sidebar;
