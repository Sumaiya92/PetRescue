import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Heart, Phone, Mail, MapPin, ArrowLeft, Users, Award, Calendar, Shield } from 'lucide-react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const colors = {
  primary: '#4A6FA5',
  secondary: '#FF7E5F',
  white: '#FFFFFF',
  lightGray: '#F5F7FA',
  darkGray: '#6B7C93',
  black: '#2D3748',
  success: '#48BB78',
  info: '#4299E1',
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
};

const AboutScreen = ({ navigation }) => {
  const handlePress = (type, value) => {
    const urlMap = {
      phone: `tel:${value}`,
      email: `mailto:${value}`,
      location: `https://maps.google.com/?q=${encodeURIComponent(value)}`,
    };
    Linking.openURL(urlMap[type]);
  };

  const handleSocialPress = (platform) => {
    Alert.alert(
      "Coming Soon",
      `We're working on our ${platform} presence! Follow us for updates when we launch our social media channels.`,
      [{ text: "OK", style: "default" }]
    );
  };

  const handleDonatePress = () => {
    navigation.navigate('Donate');
  };

  const stats = [
    { icon: Heart, label: "Animals Rescued", value: "1,247+" },
    { icon: Users, label: "Happy Families", value: "892+" },
    { icon: Award, label: "Years of Service", value: "12+" },
    { icon: Shield, label: "Success Rate", value: "94%" },
  ];

  return (
    <View style={styles.container}>
      {/* Enhanced Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft color={colors.white} size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>About PawSafe</Text>
          <Text style={styles.subtitle}>Rescue • Rehabilitate • Rehome</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Our Impact</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <stat.icon color={colors.secondary} size={20} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Heart color={colors.white} size={20} />
            </View>
            <Text style={styles.sectionTitle}>Our Mission</Text>
          </View>
          <Text style={styles.text}>
            At PawSafe, we believe every animal deserves love, care, and a forever home. 
            We rescue animals from difficult situations, provide them with medical care and 
            rehabilitation, and match them with loving families who will cherish them for life.
          </Text>
          <Text style={styles.text}>
            Our dedicated team works tirelessly to ensure each animal receives personalized 
            attention and the best possible care during their journey to finding their perfect match.
          </Text>
        </View>

        {/* What We Do Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Do</Text>
          <View style={styles.servicesList}>
            <View style={styles.serviceItem}>
              <Text style={styles.serviceBullet}>•</Text>
              <Text style={styles.serviceText}>Emergency animal rescue and intake</Text>
            </View>
            <View style={styles.serviceItem}>
              <Text style={styles.serviceBullet}>•</Text>
              <Text style={styles.serviceText}>Comprehensive veterinary care and rehabilitation</Text>
            </View>
            <View style={styles.serviceItem}>
              <Text style={styles.serviceBullet}>•</Text>
              <Text style={styles.serviceText}>Behavioral training and socialization</Text>
            </View>
            <View style={styles.serviceItem}>
              <Text style={styles.serviceBullet}>•</Text>
              <Text style={styles.serviceText}>Adoption matching and follow-up support</Text>
            </View>
            <View style={styles.serviceItem}>
              <Text style={styles.serviceBullet}>•</Text>
              <Text style={styles.serviceText}>Community education and awareness programs</Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get In Touch</Text>
          <Text style={styles.contactDescription}>
            Have questions or want to help? We'd love to hear from you!
          </Text>
          
          <TouchableOpacity 
            onPress={() => handlePress('phone', '5551234567')} 
            style={styles.contactItem}
            activeOpacity={0.7}
          >
            <View style={styles.contactIcon}>
              <Phone size={18} color={colors.white} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactText}>(555) 123-4567</Text>
              <Text style={styles.contactSubtext}>Mon-Fri 9AM-6PM</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handlePress('email', 'pawsafe123@gmail.com')} 
            style={styles.contactItem}
            activeOpacity={0.7}
          >
            <View style={styles.contactIcon}>
              <Mail size={18} color={colors.white} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactText}>pawsafe123@gmail.com</Text>
              <Text style={styles.contactSubtext}>We respond within 24 hours</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handlePress('location', '123 Rescue Lane, Pet City')} 
            style={styles.contactItem}
            activeOpacity={0.7}
          >
            <View style={styles.contactIcon}>
              <MapPin size={18} color={colors.white} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactText}>123 Rescue Lane, Pet City</Text>
              <Text style={styles.contactSubtext}>Visit us for adoption events</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stay Connected</Text>
          <Text style={styles.socialDescription}>
            We're building our online community! Follow us for updates, success stories, 
            and adorable pet photos when we launch our social media channels.
          </Text>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              onPress={() => handleSocialPress('Facebook')}
              style={[styles.socialIconButton, { backgroundColor: colors.facebook }]}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="facebook-f" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleSocialPress('Instagram')}
              style={[styles.socialIconButton, { backgroundColor: colors.instagram }]}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="instagram" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleSocialPress('Twitter')}
              style={[styles.socialIconButton, { backgroundColor: colors.twitter }]}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="twitter" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Make a Difference</Text>
          <Text style={styles.text}>
            Your support helps us provide food, medical care, shelter, and love to animals in need. 
            Every donation, no matter the size, makes a real difference in an animal's life.
          </Text>
          <TouchableOpacity 
            style={styles.donateButton}
            activeOpacity={0.8}
            onPress={handleDonatePress}
          >
            <Text style={styles.donateText}>Donate Now</Text>
          </TouchableOpacity>
          <Text style={styles.donateSubtext}>
            100% of donations go directly to animal care
          </Text>
        </View>

        {/* Hours Section */}
        

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Paws & Hearts Animal Rescue</Text>
          <Text style={styles.footerSubtext}>
            Licensed Non-Profit Organization • Tax ID: 123456789
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  statsSection: {
    backgroundColor: colors.lightGray,
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: colors.white,
    paddingVertical: 15,
    borderRadius: 12,
  },
  statIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    marginBottom: 12,
  },
  servicesList: {
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceBullet: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
  },
  serviceText: {
    flex: 1,
    fontSize: 15,
    color: colors.darkGray,
    lineHeight: 20,
  },
  contactDescription: {
    fontSize: 15,
    color: colors.darkGray,
    marginBottom: 16,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: colors.lightGray,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  contactIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactContent: {
    marginLeft: 14,
    flex: 1,
  },
  contactText: {
    fontSize: 15,
    color: colors.black,
    fontWeight: '600',
  },
  contactSubtext: {
    fontSize: 13,
    color: colors.darkGray,
    marginTop: 2,
  },
  socialDescription: {
    fontSize: 15,
    color: colors.darkGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  socialIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  donateButton: {
    marginTop: 16,
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'center',
    minWidth: 200,
  },
  donateText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  donateSubtext: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.darkGray,
    marginTop: 8,
    fontStyle: 'italic',
  },
  hoursContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  hoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  hoursDay: {
    fontSize: 15,
    color: colors.black,
    fontWeight: '500',
  },
  hoursTime: {
    fontSize: 15,
    color: colors.darkGray,
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
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 11,
    color: colors.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AboutScreen;