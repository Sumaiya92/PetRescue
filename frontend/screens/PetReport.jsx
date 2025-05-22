import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const ReportPetScreen = ({ route, navigation }) => {
  const { reportType = 'lost', foundPet } = route.params || {};
  
  const [petInfo, setPetInfo] = useState({
    type: foundPet?.type || '',
    breed: foundPet?.breed || '',
    name: foundPet?.name || '',
    color: foundPet?.color || '',
    gender: foundPet?.gender || '',
    age: foundPet?.age || '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    images: foundPet ? [foundPet.image] : [],
  });

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPetInfo({
        ...petInfo,
        images: [...petInfo.images, result.assets[0].uri]
      });
    }
  };

  const handleSubmit = () => {
    // Here you would handle the submission of the report
    // For demo purposes, just navigate back to the Lost & Found screen
    alert(`Thank you for reporting this ${reportType} pet. Your report has been submitted.`);
    navigation.navigate('LostFoundMain');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Report {reportType === 'lost' ? 'Lost' : 'Found'} Pet</Text>
          
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Pet Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {petInfo.images.map((image, index) => (
                <Image key={index} source={typeof image === 'string' ? {uri: image} : image} style={styles.petImage} />
              ))}
              <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
                <Ionicons name="camera" size={24} color="#FF6B6B" />
                <Text style={styles.addImageText}>Add Image</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Pet Information</Text>
            
            <Text style={styles.inputLabel}>Pet Type</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={[styles.radioButton, petInfo.type === 'Dog' && styles.radioSelected]}
                onPress={() => setPetInfo({...petInfo, type: 'Dog'})}
              >
                <Text style={[styles.radioText, petInfo.type === 'Dog' && styles.radioTextSelected]}>Dog</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.radioButton, petInfo.type === 'Cat' && styles.radioSelected]}
                onPress={() => setPetInfo({...petInfo, type: 'Cat'})}
              >
                <Text style={[styles.radioText, petInfo.type === 'Cat' && styles.radioTextSelected]}>Cat</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.radioButton, petInfo.type === 'Other' && styles.radioSelected]}
                onPress={() => setPetInfo({...petInfo, type: 'Other'})}
              >
                <Text style={[styles.radioText, petInfo.type === 'Other' && styles.radioTextSelected]}>Other</Text>
              </TouchableOpacity>
            </View>
            
            {reportType === 'lost' && (
              <>
                <Text style={styles.inputLabel}>Pet Name</Text>
                <TextInput
                  style={styles.input}
                  value={petInfo.name}
                  onChangeText={(text) => setPetInfo({...petInfo, name: text})}
                  placeholder="Pet's name"
                />
              </>
            )}
            
            <Text style={styles.inputLabel}>Breed</Text>
            <TextInput
              style={styles.input}
              value={petInfo.breed}
              onChangeText={(text) => setPetInfo({...petInfo, breed: text})}
              placeholder="Breed (if known)"
            />
            
            <Text style={styles.inputLabel}>Color</Text>
            <TextInput
              style={styles.input}
              value={petInfo.color}
              onChangeText={(text) => setPetInfo({...petInfo, color: text})}
              placeholder="Color"
            />
            
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={[styles.radioButton, petInfo.gender === 'Male' && styles.radioSelected]}
                onPress={() => setPetInfo({...petInfo, gender: 'Male'})}
              >
                <Text style={[styles.radioText, petInfo.gender === 'Male' && styles.radioTextSelected]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.radioButton, petInfo.gender === 'Female' && styles.radioSelected]}
                onPress={() => setPetInfo({...petInfo, gender: 'Female'})}
              >
                <Text style={[styles.radioText, petInfo.gender === 'Female' && styles.radioTextSelected]}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.radioButton, petInfo.gender === 'Unknown' && styles.radioSelected]}
                onPress={() => setPetInfo({...petInfo, gender: 'Unknown'})}
              >
                <Text style={[styles.radioText, petInfo.gender === 'Unknown' && styles.radioTextSelected]}>Unknown</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Approximate Age</Text>
            <TextInput
              style={styles.input}
              value={petInfo.age}
              onChangeText={(text) => setPetInfo({...petInfo, age: text})}
              placeholder="Age (if known)"
            />
            
            <Text style={styles.inputLabel}>Location {reportType === 'lost' ? 'Lost' : 'Found'}</Text>
            <TextInput
              style={styles.input}
              value={petInfo.location}
              onChangeText={(text) => setPetInfo({...petInfo, location: text})}
              placeholder="Address or area"
            />
            
            <Text style={styles.inputLabel}>Date {reportType === 'lost' ? 'Lost' : 'Found'}</Text>
            <TextInput
              style={styles.input}
              value={petInfo.date}
              onChangeText={(text) => setPetInfo({...petInfo, date: text})}
              placeholder="YYYY-MM-DD"
            />
            
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={petInfo.description}
              onChangeText={(text) => setPetInfo({...petInfo, description: text})}
              placeholder="Additional details about the pet"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Your Contact Information</Text>
            
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={petInfo.contactName}
              onChangeText={(text) => setPetInfo({...petInfo, contactName: text})}
              placeholder="Your name"
            />
            
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              value={petInfo.contactPhone}
              onChangeText={(text) => setPetInfo({...petInfo, contactPhone: text})}
              placeholder="Your phone number"
              keyboardType="phone-pad"
            />
            
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={petInfo.contactEmail}
              onChangeText={(text) => setPetInfo({...petInfo, contactEmail: text})}
              placeholder="Your email address"
              keyboardType="email-address"
            />
          </View>
          
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  formContainer: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addImageText: {
    marginTop: 5,
    color: '#FF6B6B',
    fontSize: 12,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  radioButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: '#FF6B6B',
  },
  radioText: {
    color: '#333',
  },
  radioTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ReportPetScreen;