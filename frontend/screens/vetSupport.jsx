import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const VetSupportScreen = () => {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  const faqData = [
    {
      question: "When should I take my pet to the vet?",
      answer: "You should take your pet to the vet for annual check-ups, vaccinations, and any time they show signs of illness like vomiting, diarrhea, loss of appetite, unusual behavior, or visible injuries."
    },
    {
      question: "How often should my pet be vaccinated?",
      answer: "Dogs and cats typically need vaccines annually, though some vaccines may last 3 years. Puppies and kittens need a series of vaccines every 3-4 weeks until they're about 16 weeks old."
    },
    {
      question: "What are common signs my pet needs emergency care?",
      answer: "Seek emergency care if your pet shows difficulty breathing, severe bleeding, seizures, collapse, inability to urinate, severe vomiting/diarrhea, or suspected poisoning."
    },
    {
      question: "How do I know if my pet is at a healthy weight?",
      answer: "You should be able to feel your pet's ribs without excess fat covering. They should have a visible waist when viewed from above and an abdominal tuck when viewed from the side."
    },
    {
      question: "How often should I brush my pet's teeth?",
      answer: "Ideally, you should brush your pet's teeth daily. At minimum, aim for 2-3 times per week to prevent dental disease."
    }
  ];

  const onlineDoctors = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "General Pet Care",
      available: true,
      image: "https://as1.ftcdn.net/v2/jpg/05/60/26/08/1000_F_560260880_O1V3Qm2cNO5HWjN66mBh2NrlPHNHOUxW.jpg" // Make sure to have these images in your assets folder
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Surgery & Emergency",
      available: false,
      image:"https://as1.ftcdn.net/v2/jpg/05/60/26/08/1000_F_560260880_O1V3Qm2cNO5HWjN66mBh2NrlPHNHOUxW.jpg"
    },
    {
      name: "Dr. Lisa Rodriguez",
      specialty: "Dermatology",
      available: true,
      image: "https://as1.ftcdn.net/v2/jpg/05/60/26/08/1000_F_560260880_O1V3Qm2cNO5HWjN66mBh2NrlPHNHOUxW.jpg"
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pet Health Support</Text>
      </View>

      <TouchableOpacity 
        style={styles.chatbotButton}
        onPress={() => navigation.navigate('Chatbot')}
      >
        <Ionicons name="chatbubbles" size={24} color="white" />
        <Text style={styles.chatbotButtonText}>Ask AI Pet Assistant</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Online Veterinarians</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorsContainer}>
          {onlineDoctors.map((doctor, index) => (
            <TouchableOpacity key={index} style={styles.doctorCard}>
              <Image source={doctor.image} style={styles.doctorImage} />
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              <View style={[styles.availabilityIndicator, 
                { backgroundColor: doctor.available ? '#4CAF50' : '#F44336' }]}>
                <Text style={styles.availabilityText}>
                  {doctor.available ? 'Available Now' : 'Unavailable'}
                </Text>
              </View>
              {doctor.available && (
                <TouchableOpacity style={styles.consultButton}>
                  <Text style={styles.consultButtonText}>Start Consultation</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Pet Health Questions</Text>
        {faqData.map((faq, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.faqItem}
            onPress={() => toggleFaq(index)}
          >
            <View style={styles.faqQuestion}>
              <Text style={styles.faqQuestionText}>{faq.question}</Text>
              <Ionicons 
                name={expandedFaq === index ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#555" 
              />
            </View>
            {expandedFaq === index && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.emergencySection}>
        <Text style={styles.emergencyTitle}>Emergency Services</Text>
        <Text style={styles.emergencyText}>
          If your pet is experiencing a life-threatening emergency, 
          please call your nearest emergency vet clinic immediately.
        </Text>
        <TouchableOpacity style={styles.emergencyButton}>
          <Ionicons name="call" size={24} color="white" />
          <Text style={styles.emergencyButtonText}>Call Emergency Vet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: '#FF6B6B',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  chatbotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  chatbotButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  doctorsContainer: {
    flexDirection: 'row',
    paddingBottom: 16,
  },
  doctorCard: {
    width: 180,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  availabilityIndicator: {
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  availabilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  consultButton: {
    backgroundColor: '#FF6B6B',
    padding: 8,
    borderRadius: 8,
  },
  consultButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    lineHeight: 20,
  },
  emergencySection: {
    backgroundColor: '#FFF3F3',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default VetSupportScreen;