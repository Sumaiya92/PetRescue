import React, { useState, useRef, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from './config';

// Color palette
const colors = {
  primary: '#4A6FA5',
  primaryLight: '#E8F0FE',
  primaryDark: '#2C4A7A',
  secondary: '#FF7E5F',
  secondaryLight: '#FFE8E2',
  white: '#FFFFFF',
  lightGray: '#F5F7FA',
  mediumGray: '#E1E5EB',
  darkGray: '#6B7C93',
  black: '#2D3748',
  success: '#48BB78',
  warning: '#ED8936',
  danger: '#E53E3E',
  info: '#4299E1',
  furLight: '#F6AD55',
  furMedium: '#C05621',
  furDark: '#723F13',
  highlight: '#FEFCBF',
  rewardGold: '#D69E2E',
};

const ChatbotScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Dr. Paws, your virtual veterinary assistant. How can I help you and your pet today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [image, setImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const scrollViewRef = useRef();
  const inputRef = useRef(null);

  const API_URL = `${BASE_URL}/chat`;

  // Sample FAQs for quick responses
  const quickResponses = [
    "My dog isn't eating",
    "Cat vomiting",
    "Puppy vaccination schedule",
    "Pet first aid tips",
  ];

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardShown(true);
        scrollToBottom();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardShown(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Generate or retrieve user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        let id = await AsyncStorage.getItem('userId');
        if (!id) {
          id = '67d3cfc3b40a951803c0185c';
          await AsyncStorage.setItem('userId', id);
        }
        setUserId(id);
      } catch (error) {
        console.error('Error with user ID:', error);
        setUserId('67d3cfc3b40a951803c0185c');
      }
    };

    getUserId();
  }, []);

  // Fetch previous messages from the API
  useEffect(() => {
    const fetchPreviousMessages = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`${API_URL}/history?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const formattedMessages = data
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((msg, index) => ({
              id: index + 1,
              text: msg.text,
              isUser: msg.sender === 'user',
              timestamp: new Date(msg.createdAt || Date.now()),
              image: msg.hasImage ? true : null,
            }));
          
          if (formattedMessages.length === 0) {
            setMessages([
              {
                id: 1,
                text: "Hello! I'm Dr. Paws, your virtual veterinary assistant. How can I help you and your pet today?",
                isUser: false,
                timestamp: new Date(),
              },
              ...formattedMessages
            ]);
          } else {
            setMessages(formattedMessages);
          }
        }
      } catch (error) {
        console.error('Error fetching message history:', error);
        loadMessagesFromStorage();
      }
    };

    if (userId) {
      fetchPreviousMessages();
    }
  }, [userId]);

  // Load messages from local storage as fallback
  const loadMessagesFromStorage = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem('chatMessages');

      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        const formattedMessages = parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        formattedMessages.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages from storage:', error);
    }
  };

  // Save messages to local storage
  useEffect(() => {
    const saveMessagesToStorage = async () => {
      try {
        const messagesToSave = [...messages].sort((a, b) => a.timestamp - b.timestamp);
        await AsyncStorage.setItem('chatMessages', JSON.stringify(messagesToSave));
      } catch (error) {
        console.error('Error saving messages to storage:', error);
      }
    };

    if (messages.length > 1) {
      saveMessagesToStorage();
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '' && !image) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      image: image,
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      let imageBase64 = null;
      
      if (image) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(image);
          if (!fileInfo.exists) {
            console.error("File does not exist:", image);
            throw new Error("File does not exist");
          }
          
          const base64 = await FileSystem.readAsStringAsync(image, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          if (!base64 || base64.length < 100) {
            console.error("Invalid base64 data:", base64?.substr(0, 30));
            throw new Error("Invalid base64 data");
          }
          
          imageBase64 = base64;
        } catch (err) {
          console.error('Error converting image to base64:', err);
          const errorMessage = {
            id: Date.now() + 100,
            text: "Error processing image: " + err.message,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
      }

      // Use fetch instead of axios
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText.trim(),
          userId: userId,
          imageBase64: imageBase64
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error.message);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: error.message || 
              "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
      setImage(null);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        
        if (fileInfo.exists) {
          if (fileInfo.size > 5 * 1024 * 1024) {
            Alert.alert(
              "Large Image",
              "The selected image is large (over 5MB). This may cause upload issues. Would you like to continue?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Continue", onPress: () => setImage(result.assets[0].uri) }
              ]
            );
          } else {
            setImage(result.assets[0].uri);
          }
        } else {
          Alert.alert("Error", "Cannot access the selected image file.");
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleQuickResponse = (response) => {
    setInputText(response);
    focusInput();
  };

  const renderMessage = (message) => {
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
      
        <View style={[
          styles.messageContent,
          message.isUser ? styles.userMessageContent : styles.botMessageContent
        ]}>
          {message.image && (
            <Image
              source={{ uri: message.image }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          <Text style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.botMessageText
          ]}>
            {message.text}
          </Text>
          <Text style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const clearChatHistory = async () => {
    try {
      if (userId) {
        // Use fetch instead of axios for DELETE request
        await fetch(`${API_URL}/history`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
      }

      await AsyncStorage.removeItem('chatMessages');
      
      setMessages([{
        id: 1,
        text: "Hello! I'm Dr. Paws, your virtual veterinary assistant. How can I help you and your pet today?",
        isUser: false,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      Alert.alert('Error', 'Failed to clear chat history');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 50}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
         
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Dr. Paws</Text>
          <Text style={styles.headerSubtitle}>Veterinary Assistant</Text>
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            Alert.alert(
              'Clear History',
              'Are you sure you want to clear the chat history?',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Clear', onPress: clearChatHistory, style: 'destructive'},
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.botMessageContainer]}>
           
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.typingText}>Dr. Paws is typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.quickResponseContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickResponsesWrapper}
          keyboardShouldPersistTaps="handled"
        >
          {quickResponses.map((response, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickResponseButton}
              onPress={() => handleQuickResponse(response)}
            >
              <Text style={styles.quickResponseText}>{response}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.inputContainer}>
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImage(null)}
            >
              <Ionicons name="close-circle" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.attachButton}
          onPress={pickImage}
        >
          <Ionicons name="camera-outline" size={24} color={colors.darkGray} />
        </TouchableOpacity>
        
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor={colors.darkGray}
          value={inputText}
          onChangeText={setInputText}
          multiline
          onFocus={scrollToBottom}
        />
        
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() && !image) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() && !image}
        >
          <Ionicons name="send" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          This is an AI assistant and not a substitute for professional veterinary care. 
          In case of emergency, please contact your veterinarian immediately.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.white,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  messagesContent: {
    paddingBottom: 16,
    paddingTop: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-start',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  messageContent: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  botMessageContent: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  userMessageContent: {
    backgroundColor: colors.primaryLight,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.black,
  },
  botMessageText: {
    color: colors.black,
  },
  userMessageText: {
    color: colors.black,
  },
  timestamp: {
    fontSize: 11,
    color: colors.darkGray,
    marginTop: 4,
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.darkGray,
  },
  quickResponseContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    backgroundColor: colors.white,
  },
  quickResponsesWrapper: {
    paddingHorizontal: 12,
  },
  quickResponseButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  quickResponseText: {
    fontSize: 14,
    color: colors.primaryDark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: colors.lightGray,
    fontSize: 16,
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  sendButton: {
    padding: 10,
    marginLeft: 8,
    borderRadius: 22,
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 8,
  },
  imagePreview: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.danger,
    borderRadius: 12,
    padding: 2,
  },
  messageImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  disclaimerContainer: {
    padding: 12,
    backgroundColor: colors.highlight,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.furMedium,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default ChatbotScreen;