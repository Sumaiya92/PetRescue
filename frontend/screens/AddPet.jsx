import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import BASE_URL from './config';

const AddPet = ({ navigation, route }) => {
  const [petData, setPetData] = useState({
    name: '',
    type: 'Dog',
    breed: '',
    age: '',
    gender: 'Unknown',
    size: 'Medium',
    vaccinationStatus: 'Not Vaccinated',
    medicalStatus: 'Healthy',
    microchip: 'Not Microchipped',
    spayedNeutered: false,
    description: '',
    history: '',
    medicalInfo: '',
    behavior: '',
    temperament: [],
    trainingLevel: 'Untrained',
    urgent: false,
    shelter: '67de818b9e8456eeb881dc6a',
    availableForAdoption: true,
  });

  const [imageUri, setImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get refresh function from route params if available
  const { onRefresh } = route?.params || {};

  const handleInputChange = (field, value) => {
    setPetData({ ...petData, [field]: value });
  };

  const toggleTemperament = (trait) => {
    const currentTraits = petData.temperament;
    if (currentTraits.includes(trait)) {
      setPetData({
        ...petData,
        temperament: currentTraits.filter(t => t !== trait)
      });
    } else {
      setPetData({
        ...petData,
        temperament: [...currentTraits, trait]
      });
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to upload pet images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!petData.name || !petData.type || !petData.breed || !petData.age) {
      Alert.alert("Required Fields", "Please fill in pet name, type, breed, and age");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      Object.keys(petData).forEach(key => {
        if (key === 'temperament') {
          formData.append(key, JSON.stringify(petData[key]));
        } else {
          formData.append(key, petData[key]?.toString());
        }
      });

      if (imageUri) {
        const fileExt = imageUri.split('.').pop();
        formData.append('image', {
          uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          type: `image/${fileExt}`,
          name: `pet_${Date.now()}.${fileExt}`,
        });
      }

      const response = await fetch(`${BASE_URL}/pet`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to add pet');
      }

      // Reset form first
      setPetData({
        name: '',
        type: 'Dog',
        breed: '',
        age: '',
        gender: 'Unknown',
        size: 'Medium',
        vaccinationStatus: 'Not Vaccinated',
        medicalStatus: 'Healthy',
        microchip: 'Not Microchipped',
        spayedNeutered: false,
        description: '',
        history: '',
        medicalInfo: '',
        behavior: '',
        temperament: [],
        trainingLevel: 'Untrained',
        urgent: false,
        shelter: '67de818b9e8456eeb881dc6a',
        availableForAdoption: true,
      });
      setImageUri(null);

      Alert.alert(
        'Success', 
        'Pet added successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate back and trigger refresh
              navigation.goBack();
              // Call the refresh function if provided
              if (onRefresh) {
                setTimeout(() => onRefresh(), 100);
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', 'Failed to add pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const temperamentOptions = ['Friendly', 'Playful', 'Shy', 'Energetic', 'Calm', 'Aggressive', 'Gentle', 'Independent'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#4B5D67" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Pet</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        {/* Image Section */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.petImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="paw" size={40} color="#D8E3E7" />
          </View>
        )}

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Ionicons name="camera" size={20} color="#4B5D67" />
          <Text style={styles.imagePickerText}>Add Photo</Text>
        </TouchableOpacity>

        {/* Basic Information */}
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Pet Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pet name"
            value={petData.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={petData.type}
                style={styles.picker}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <Picker.Item label="Dog" value="Dog" />
                <Picker.Item label="Cat" value="Cat" />
                <Picker.Item label="Bird" value="Bird" />
                <Picker.Item label="Rabbit" value="Rabbit" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Breed *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter breed"
              value={petData.breed}
              onChangeText={(text) => handleInputChange('breed', text)}
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2 years, 6 months"
              value={petData.age}
              onChangeText={(text) => handleInputChange('age', text)}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={petData.gender}
                style={styles.picker}
                onValueChange={(value) => handleInputChange('gender', value)}
              >
                <Picker.Item label="Unknown" value="Unknown" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Size</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={petData.size}
              style={styles.picker}
              onValueChange={(value) => handleInputChange('size', value)}
            >
              <Picker.Item label="Small" value="Small" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="Large" value="Large" />
            </Picker>
          </View>
        </View>

        {/* Medical Information */}
        <Text style={styles.sectionTitle}>Medical Information</Text>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Vaccination Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={petData.vaccinationStatus}
                style={styles.picker}
                onValueChange={(value) => handleInputChange('vaccinationStatus', value)}
              >
                <Picker.Item label="Not Vaccinated" value="Not Vaccinated" />
                <Picker.Item label="Partially Vaccinated" value="Partially Vaccinated" />
                <Picker.Item label="Fully Vaccinated" value="Fully Vaccinated" />
              </Picker>
            </View>
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Medical Status</Text>
            <TextInput
              style={styles.input}
              placeholder="Healthy"
              value={petData.medicalStatus}
              onChangeText={(text) => handleInputChange('medicalStatus', text)}
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Microchip Status</Text>
            <TextInput
              style={styles.input}
              placeholder="Not Microchipped"
              value={petData.microchip}
              onChangeText={(text) => handleInputChange('microchip', text)}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Spayed/Neutered</Text>
            <TouchableOpacity
              style={[styles.toggleButton, petData.spayedNeutered && styles.toggleButtonActive]}
              onPress={() => handleInputChange('spayedNeutered', !petData.spayedNeutered)}
            >
              <Text style={[styles.toggleButtonText, petData.spayedNeutered && styles.toggleButtonTextActive]}>
                {petData.spayedNeutered ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Medical Information</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any medical conditions, treatments, or special needs..."
            multiline
            numberOfLines={4}
            value={petData.medicalInfo}
            onChangeText={(text) => handleInputChange('medicalInfo', text)}
          />
        </View>

        {/* Behavior & Training */}
        <Text style={styles.sectionTitle}>Behavior & Training</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Training Level</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={petData.trainingLevel}
              style={styles.picker}
              onValueChange={(value) => handleInputChange('trainingLevel', value)}
            >
              <Picker.Item label="Untrained" value="Untrained" />
              <Picker.Item label="Basic" value="Basic" />
              <Picker.Item label="Intermediate" value="Intermediate" />
              <Picker.Item label="Advanced" value="Advanced" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Temperament</Text>
          <View style={styles.temperamentContainer}>
            {temperamentOptions.map((trait) => (
              <TouchableOpacity
                key={trait}
                style={[
                  styles.temperamentTag,
                  petData.temperament.includes(trait) && styles.temperamentTagActive
                ]}
                onPress={() => toggleTemperament(trait)}
              >
                <Text style={[
                  styles.temperamentTagText,
                  petData.temperament.includes(trait) && styles.temperamentTagTextActive
                ]}>
                  {trait}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Behavior Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the pet's temperament, behavior around people, other pets, children..."
            multiline
            numberOfLines={4}
            value={petData.behavior}
            onChangeText={(text) => handleInputChange('behavior', text)}
          />
        </View>

        {/* Additional Information */}
        <Text style={styles.sectionTitle}>Additional Information</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about this pet's personality, what makes them special..."
            multiline
            numberOfLines={4}
            value={petData.description}
            onChangeText={(text) => handleInputChange('description', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>History</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Previous home, how they came to the shelter..."
            multiline
            numberOfLines={4}
            value={petData.history}
            onChangeText={(text) => handleInputChange('history', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Urgent Case</Text>
          <TouchableOpacity
            style={[styles.toggleButton, petData.urgent && styles.urgentToggleActive]}
            onPress={() => handleInputChange('urgent', !petData.urgent)}
          >
            <Text style={[styles.toggleButtonText, petData.urgent && styles.urgentToggleTextActive]}>
              {petData.urgent ? 'Yes - Urgent' : 'No'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Pet for Adoption</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EEF5FF',
    paddingBottom: 50, // Added bottom padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#EEF5FF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B5D67',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5D67',
    marginTop: 25,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D8E3E7',
    paddingBottom: 5,
  },
  petImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#D8E3E7',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#D8E3E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8E3E7',
    marginBottom: 20,
  },
  imagePickerText: {
    marginLeft: 8,
    color: '#4B5D67',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#4B5D67',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D8E3E7',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#4B5D67',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D8E3E7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#4B5D67',
  },
  toggleButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D8E3E7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#57CC99',
    borderColor: '#57CC99',
  },
  toggleButtonText: {
    color: '#4B5D67',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#FFF',
  },
  urgentToggleActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  urgentToggleTextActive: {
    color: '#FFF',
  },
  temperamentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  temperamentTag: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D8E3E7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  temperamentTagActive: {
    backgroundColor: '#57CC99',
    borderColor: '#57CC99',
  },
  temperamentTagText: {
    color: '#4B5D67',
    fontSize: 12,
    fontWeight: '500',
  },
  temperamentTagTextActive: {
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: '#57CC99',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20, // Added margin bottom for better spacing
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
export default AddPet;