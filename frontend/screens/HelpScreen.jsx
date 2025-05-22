// HelpCenterScreen.jsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.faqQuestion} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#555" />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const HelpCenterScreen = () => {
  const faqs = [
    {
      question: "How do I adopt a pet?",
      answer: "Browse our available pets, select one you're interested in, and tap 'Start Adoption Process'. You'll fill out an application which our team will review within 48 hours."
    },
    {
      question: "What are the adoption fees?",
      answer: "Adoption fees vary by animal type and age. Dogs range from $100-$300, cats from $50-$150. All pets are spayed/neutered, vaccinated, and microchipped prior to adoption."
    },
    {
      question: "How do I report a stray animal?",
      answer: "Use the 'Report' feature in the app to provide details about the animal's location and condition. Our rescue team will respond as quickly as possible."
    },
    {
      question: "Can I foster instead of adopt?",
      answer: "Yes! We always need foster homes. Select 'Become a Foster' in your profile to start the application process and learn more about our fostering program."
    },
    {
      question: "What if the pet I adopt isn't a good fit?",
      answer: "We have a 14-day trial period. If the pet isn't working out in your home, please contact us to discuss returning the pet or finding solutions to make it work."
    },
    {
      question: "How can I donate to your rescue?",
      answer: "Tap on the 'Donate' button in the main menu to make a one-time or recurring monetary donation. We also accept supplies - check our 'Wishlist' for current needs."
    },
  ];

  const categories = [
    { title: "Adoption Process", icon: "home" },
    { title: "Pet Care Guides", icon: "heart" },
    { title: "Donation Info", icon: "gift" },
    { title: "Volunteering", icon: "users" },
    { title: "Lost & Found", icon: "map-pin" },
    { title: "Emergency", icon: "alert-circle" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Help Center</Text>
        
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search for help...</Text>
        </View>
        
        <Text style={styles.sectionTitle}>How can we help you?</Text>
        
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Feather name={category.icon} size={22} color="#5e72e4" />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </View>
        
        <View style={styles.needMoreHelpContainer}>
          <Text style={styles.needMoreHelpTitle}>Need more help?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: '#888',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 12,
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    marginBottom: 24,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    marginHorizontal: '1.65%',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#f0f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4a4a4a',
    textAlign: 'center',
  },
  faqContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  needMoreHelpContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  needMoreHelpTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 14,
  },
  contactButton: {
    backgroundColor: '#5e72e4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HelpCenterScreen;