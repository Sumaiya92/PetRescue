import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Heart, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react-native';

const colors = {
  primary: '#4A6FA5',
  secondary: '#FF7E5F',
  white: '#FFFFFF',
  lightGray: '#F5F7FA',
  darkGray: '#6B7C93',
  black: '#2D3748',
};

const AboutScreen = () => {
  const handlePress = (type, value) => {
    const urlMap = {
      phone: `tel:${value}`,
      email: `mailto:${value}`,
      location: `https://maps.google.com/?q=${value}`,
      social: value,
    };
    Linking.openURL(urlMap[type]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Minimal Header */}
      <View style={styles.header}>
        <Text style={styles.title}>About Us</Text>
        <View style={styles.divider} />
      </View>

      {/* Mission */}
      <View style={styles.section}>
        <View style={styles.iconCircle}>
          <Heart color={colors.white} size={20} />
        </View>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.text}>
          We rescue, rehabilitate, and rehome animals in need, giving them a second chance at life.
        </Text>
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get In Touch</Text>
        
        <TouchableOpacity 
          onPress={() => handlePress('phone', '5551234567')} 
          style={styles.contactItem}
          activeOpacity={0.7}
        >
          <View style={styles.contactIcon}>
            <Phone size={18} color={colors.white} />
          </View>
          <Text style={styles.contactText}>(555) 123-4567</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handlePress('email', 'pawsafe123@gmail.com')} 
          style={styles.contactItem}
          activeOpacity={0.7}
        >
          <View style={styles.contactIcon}>
            <Mail size={18} color={colors.white} />
          </View>
          <Text style={styles.contactText}>pawsafe123@gmail.com</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handlePress('location', '123 Rescue Lane, Pet City')} 
          style={styles.contactItem}
          activeOpacity={0.7}
        >
          <View style={styles.contactIcon}>
            <MapPin size={18} color={colors.white} />
          </View>
          <Text style={styles.contactText}>123 Rescue Lane, Pet City</Text>
        </TouchableOpacity>
      </View>

      {/* Social Media */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connect With Us</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            onPress={() => handlePress('social', 'https://facebook.com/pawsandhearts')}
            style={styles.socialIcon}
            activeOpacity={0.7}
          >
            <Facebook size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handlePress('social', 'https://instagram.com/pawsandhearts')}
            style={styles.socialIcon}
            activeOpacity={0.7}
          >
            <Instagram size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handlePress('social', 'https://twitter.com/pawsandhearts')}
            style={styles.socialIcon}
            activeOpacity={0.7}
          >
            <Twitter size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Make a Difference</Text>
        <Text style={styles.text}>
          Help us provide care and shelter to animals. Every donation makes a difference.
        </Text>
        <TouchableOpacity 
          style={styles.donateButton}
          activeOpacity={0.8}
        >
          <Text style={styles.donateText}>Donate Now</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Paws & Hearts</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    padding: 28,
    paddingBottom: 20,
    alignItems: 'flex-start',
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 25,
    color: colors.white,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: colors.darkGray,
    lineHeight: 22,
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: {
    marginLeft: 14,
    fontSize: 15,
    color: colors.black,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  donateButton: {
    marginTop: 16,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  donateText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
  },
  footerText: {
    fontSize: 13,
    color: colors.darkGray,
    letterSpacing: 0.3,
  },
});

export default AboutScreen;