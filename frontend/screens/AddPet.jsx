import React, { useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import BASE_URL from './config';

const AddPet = ({ navigation }) => {
  const [petData, setPetData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    description: '',
    history: '',
    medicalInfo: '',
    behavior: '',
    urgent: false,
    shelter: '67de818b9e8456eeb881dc6a',
    availableForAdoption: true,
  });

  const [imageUri, setImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setPetData({ ...petData, [field]: value });
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
    if (!petData.name || !petData.type || !petData.breed) {
      Alert.alert("Required Fields", "Please fill in pet name, type, and breed");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      Object.keys(petData).forEach(key => {
        formData.append(key, petData[key]?.toString());
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

      Alert.alert(
        'Success', 
        'Pet added successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack()
          }
        ]
      );
      
      // Reset form
      setPetData({
        name: '',
        type: '',
        breed: '',
        age: '',
        description: '',
        history: '',
        medicalInfo: '',
        behavior: '',
        urgent: false,
        shelter: '67de818b9e8456eeb881dc6a',
        availableForAdoption: true,
      });
      setImageUri(null);

    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', 'Failed to add pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#4B5D67" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Pet</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <View style={styles.formContainer}>
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
            <TextInput
              style={styles.input}
              placeholder="Dog, Cat, etc."
              value={petData.type}
              onChangeText={(text) => handleInputChange('type', text)}
            />
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
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Age in years"
              keyboardType="numeric"
              value={petData.age}
              onChangeText={(text) => handleInputChange('age', text)}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Size</Text>
            <TextInput
              style={styles.input}
              placeholder="Small, Medium, Large"
              value={petData.size}
              onChangeText={(text) => handleInputChange('size', text)}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about this pet..."
            multiline
            numberOfLines={4}
            value={petData.description}
            onChangeText={(text) => handleInputChange('description', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Medical Information</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any medical conditions or needs..."
            multiline
            numberOfLines={4}
            value={petData.medicalInfo}
            onChangeText={(text) => handleInputChange('medicalInfo', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Behavior Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Temperament, training, etc."
            multiline
            numberOfLines={4}
            value={petData.behavior}
            onChangeText={(text) => handleInputChange('behavior', text)}
          />
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
    paddingBottom: 30,
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
    padding: 10,
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
  submitButton: {
    backgroundColor: '#57CC99',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddPet;