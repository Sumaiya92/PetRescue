import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, ScrollView,
  FlatList, Modal, Alert, ActivityIndicator, RefreshControl,
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import API_URL  from './config';  // Ensure you have a .env file with your API URL

// API URL definition
 // Replace with your actual API URL

// Color palette
const colors = {
  // Primary colors
  primary: '#4A6FA5',       // Soft blue (like Aussie eyes)
  primaryLight: '#E8F0FE',  // Very light blue for backgrounds
  primaryDark: '#2C4A7A',   // Darker blue for text/accents
 
  // Secondary colors
  secondary: '#FF7E5F',     // Coral accent (paws/noses)
  secondaryLight: '#FFE8E2', // Light coral for highlights
 
  // Neutrals
  white: '#FFFFFF',
  lightGray: '#F5F7FA',     // Background color
  mediumGray: '#E1E5EB',    // Borders
  darkGray: '#6B7C93',      // Secondary text
  black: '#2D3748',         // Primary text
 
  // Status colors
  success: '#48BB78',       // Green (for available pets)
  warning: '#ED8936',       // Orange (urgent notices)
  danger: '#E53E3E',        // Red (important alerts)
  info: '#4299E1',          // Blue (information)
 
  // Pet-related colors
  furLight: '#F6AD55',      // Light fur tones
  furMedium: '#C05621',     // Medium fur tones
  furDark: '#723F13',       // Dark fur tones
 
  // Special accents
  highlight: '#FEFCBF',     // Yellow highlight
  rewardGold: '#D69E2E',    // Gold for reward badges
};

// UsernamePromptModal component
const UsernamePromptModal = ({ visible, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    // Username validation
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    onSubmit(username.trim());
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Join Our Community
          </Text>
          
          <Text style={styles.modalText}>
            Please choose a username to continue:
          </Text>
          
          <TextInput
            style={[styles.textInput, error ? styles.inputError : null]}
            placeholder="Your username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setError('');
            }}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.darkGray}
          />
          
          {error ? (
            <Text style={styles.errorText}>
              {error}
            </Text>
          ) : null}
          
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.primaryButton}
          >
            <Text style={styles.buttonText}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// CommentItem component with recursive structure
const CommentItem = ({ 
  comment, 
  username, 
  postId, 
  onLikeComment, 
  onReply, 
  allComments,
  depth = 0  // Add depth parameter to track nesting level
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  
  const isLiked = comment.likes.includes(username);
  
  useEffect(() => {
    // Find direct replies to this specific comment
    const commentReplies = allComments.filter(c => 
      c.parentCommentId && c.parentCommentId === comment._id
    );
    setReplies(commentReplies);
  }, [comment._id, allComments]);
  
  // Function to handle replying to this specific comment
  const handleReplyToThis = () => {
    onReply(comment._id, comment.username);
  };
  
  return (
    <View style={[
      styles.commentContainer,
      // Adjust border color based on nesting level for visual cues
      { borderLeftColor: depth % 2 === 0 ? colors.primary : colors.secondary }
    ]}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUsername}>{comment.username}</Text>
        <Text style={styles.commentDate}>
          {new Date(comment.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.commentContent}>{comment.content}</Text>
      
      <View style={styles.commentActions}>
        <TouchableOpacity 
          style={styles.commentActionButton} 
          onPress={() => onLikeComment(comment._id)}
        >
          <AntDesign 
            name={isLiked ? "heart" : "hearto"} 
            size={16} 
            color={isLiked ? colors.danger : colors.darkGray} 
          />
          {comment.likes.length > 0 && (
            <Text style={styles.commentActionText}>{comment.likes.length}</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.commentActionButton}
          onPress={handleReplyToThis}
        >
          <AntDesign name="message1" size={16} color={colors.darkGray} />
          <Text style={styles.commentActionText}>Reply</Text>
        </TouchableOpacity>
        
        {replies.length > 0 && (
          <TouchableOpacity 
            style={styles.commentActionButton}
            onPress={() => setShowReplies(!showReplies)}
          >
            <Text style={styles.showRepliesText}>
              {showReplies ? "Hide replies" : `Show ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {showReplies && replies.length > 0 && (
        <View style={[
          styles.repliesContainer,
          // Adjust styling for deeper nesting levels
          depth > 3 && { marginLeft: 8 }
        ]}>
          {/* Recursively render each reply as a CommentItem */}
          {replies.map(reply => (
            <CommentItem
              key={reply._id}
              comment={reply}
              username={username}
              postId={postId}
              onLikeComment={onLikeComment}
              onReply={onReply}
              allComments={allComments}
              depth={depth + 1}  // Increment depth for nested replies
            />
          ))}
        </View>
      )}
    </View>
  );
};

// PostItem component
const PostItem = ({ post, username, onLikePost, onAddComment, onLikeComment }) => {
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyingToUsername, setReplyingToUsername] = useState('');
  
  const isLiked = post.likes.includes(username);
  
  const handleSubmitComment = () => {
    if (comment.trim()) {
      onAddComment(post._id, comment, replyTo);
      setComment('');
      setReplyTo(null);
      setReplyingToUsername('');
    }
  };
  
  // Handle reply at any nesting level
  const handleReply = (commentId, replyUsername) => {
    setReplyTo(commentId);
    setReplyingToUsername(replyUsername);
    setShowComments(true); // Ensure comments are visible when replying
  };

  // Calculate time since post
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return postDate.toLocaleDateString();
  };
  
  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfoContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {username && post.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.dateText}>{getTimeAgo(post.createdAt)}</Text>
          </View>
        </View>
        
        {post.community && (
          <TouchableOpacity style={styles.communityTag}>
            <Text style={styles.communityTagText}>r/{post.community}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            {post.caption}
          </Text>
        </View>
      )}
      
      {post.imageUrl && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: post.imageUrl }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      )}
      
      <View style={styles.postStats}>
        {post.likes.length > 0 && (
          <Text style={styles.statsText}>
            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
          </Text>
        )}
        {post.comments.length > 0 && (
          <Text style={styles.statsText}>
            {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
          </Text>
        )}
      </View>
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onLikePost(post._id)}
        >
          <AntDesign 
            name={isLiked ? "heart" : "hearto"} 
            size={24} 
            color={isLiked ? colors.danger : colors.darkGray} 
          />
          <Text style={[
            styles.actionText,
            isLiked && styles.actionTextActive
          ]}>Like</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowComments(!showComments)}
        >
          <AntDesign 
            name="message1" 
            size={24} 
            color={showComments ? colors.primary : colors.darkGray} 
          />
          <Text style={[
            styles.actionText,
            showComments && styles.actionTextActive
          ]}>Comment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <AntDesign name="sharealt" size={24} color={colors.darkGray} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
      
      {showComments && (
        <View style={styles.commentsSection}>
          {/* Only render top-level comments here (no parent) */}
          {post.comments.filter(comment => !comment.parentCommentId).map(comment => (
            <CommentItem 
              key={comment._id} 
              comment={comment} 
              username={username}
              postId={post._id}
              onLikeComment={onLikeComment}
              onReply={handleReply}
              allComments={post.comments}
            />
          ))}
          
          <View style={styles.commentInputContainer}>
            {replyTo && (
              <View style={styles.replyingToContainer}>
                <Text style={styles.replyingToText}>
                  Replying to: <Text style={styles.replyUsername}>{replyingToUsername}</Text>
                </Text>
                <TouchableOpacity style={styles.cancelReply} onPress={() => {
                  setReplyTo(null);
                  setReplyingToUsername('');
                }}>
                  <AntDesign name="close" size={16} color={colors.darkGray} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.commentInputRow}>
              <View style={styles.commentInputWrapper}>
                <TextInput
                  style={styles.commentInput}
                  placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  placeholderTextColor={colors.darkGray}
                />
              </View>
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  !comment.trim() && styles.sendButtonDisabled
                ]} 
                onPress={handleSubmitComment}
                disabled={!comment.trim()}
              >
                <AntDesign 
                  name="arrowright" 
                  size={20} 
                  color={comment.trim() ? colors.white : colors.mediumGray} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// CreatePostModal component
const CreatePostModal = ({ visible, onClose, onSubmit, username }) => {
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [community, setCommunity] = useState('');
  
  const resetForm = () => {
    setCaption('');
    setImageUrl('');
    setTitle('');
    setCommunity('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please add a title to your post');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formattedCaption = `${title}${caption ? `\n\n${caption}` : ''}`;
      const formattedCommunity = community.trim() ? community.trim().replace(/^r\//, '') : null;
      
      await onSubmit({
        caption: formattedCaption,
        imageUrl: imageUrl.trim() || null,
        community: formattedCommunity,
      });
      
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.createPostContainer}
      >
        <View style={styles.createPostHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <AntDesign name="close" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.createPostTitle}>Create New Post</Text>
          <TouchableOpacity 
            style={[
              styles.postButton,
              (!title.trim() || isLoading) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={!title.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.createPostForm}>
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Community (optional)</Text>
            <View style={styles.communityInputContainer}>
              <Text style={styles.communityPrefix}>r/</Text>
              <TextInput
                style={styles.communityInput}
                placeholder="community name"
                value={community.replace(/^r\//, '')}
                onChangeText={(text) => setCommunity(text)}
                autoCapitalize="none"
                placeholderTextColor={colors.darkGray}
              />
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Add an interesting title"
              value={title}
              onChangeText={setTitle}
              multiline={false}
              maxLength={300}
              placeholderTextColor={colors.darkGray}
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Text (optional)</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="What's on your mind?"
              value={caption}
              onChangeText={setCaption}
              multiline={true}
              textAlignVertical="top"
              numberOfLines={5}
              placeholderTextColor={colors.darkGray}
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Image (optional)</Text>
            <TouchableOpacity 
              style={styles.imageUploadButton}
              onPress={pickImage}
            >
              <Feather name="image" size={24} color={colors.primary} />
              <Text style={styles.imageUploadText}>
                {imageUrl ? 'Change Image' : 'Upload an Image'}
              </Text>
            </TouchableOpacity>
            
            {imageUrl ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setImageUrl('')}
                >
                  <AntDesign name="closecircle" size={24} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ) : null}
            
            <TextInput
              style={styles.imageInput}
              placeholder="Or paste an image URL"
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholderTextColor={colors.darkGray}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Main SocialFeed component
const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  
  useEffect(() => {
    // Check for username in AsyncStorage
    const checkUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          // Show username prompt if no username is found
          setShowUsernamePrompt(true);
        }
      } catch (error) {
        console.error('Error checking username:', error);
        // Show username prompt if there's an error
        setShowUsernamePrompt(true);
      }
      
      fetchPosts();
    };
    
    checkUsername();
  }, []);
  
  // Extract communities from posts
  useEffect(() => {
    const extractedCommunities = new Set();
    posts.forEach(post => {
      if (post.community) {
        extractedCommunities.add(post.community);
      }
    });
    setCommunities(Array.from(extractedCommunities).sort());
  }, [posts]);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/post`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };
  
  const handleUsernameSubmit = async (newUsername) => {
    try {
      // Save username to AsyncStorage
      await AsyncStorage.setItem('username', newUsername);
      setUsername(newUsername);
      setShowUsernamePrompt(false);
      
      // Show welcome message
      Alert.alert(
        'Welcome!',
        `Hello ${newUsername}, welcome to the community!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving username:', error);
      Alert.alert('Error', 'Failed to save username. Please try again.');
    }
  };
  
  const likePost = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/post/${postId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      const updatedPost = await response.json();
      
      setPosts(posts.map(post => 
        post._id === postId ? updatedPost : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  const addComment = async (postId, content, parentCommentId = null) => {
    try {
      const response = await fetch(`${API_URL}/post/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          content,
          parentCommentId,
        }),
      });
      
      const newComment = await response.json();
      
      // Refresh posts to get updated comments
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  const likeComment = async (commentId) => {
    try {
      const response = await fetch(`${API_URL}/comment/${commentId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      const updatedComment = await response.json();
      
      // Refresh posts to get updated comments
      fetchPosts();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };
  
  const createPost = async (postData) => {
    try {
      const response = await fetch(`${API_URL}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          caption: postData.caption,
          imageUrl: postData.imageUrl,
          community: postData.community,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }
      
      const newPost = await response.json();
      
      // Refresh the posts list to include the new post
      fetchPosts();
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };
  
  // Function to filter posts by community
  const getFilteredPosts = () => {
    if (!selectedCommunity) return posts;
    return posts.filter(post => post.community === selectedCommunity);
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading community feed...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Username prompt modal */}
      <UsernamePromptModal 
        visible={showUsernamePrompt} 
        onSubmit={handleUsernameSubmit} 
      />
      
      {/* Header with branding */}
   
      
      {/* Communities scroll */}
      <View style={styles.communitiesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.communitiesScroll}
          contentContainerStyle={styles.communitiesScrollContent}
        >
          <TouchableOpacity 
            style={[
              styles.communityTab, 
              selectedCommunity === null && styles.selectedCommunityTab
            ]}
            onPress={() => setSelectedCommunity(null)}
          >
            <Text style={[
              styles.communityTabText,
              selectedCommunity === null && styles.selectedCommunityTabText
            ]}>
              All Communities
            </Text>
          </TouchableOpacity>
          
          {communities.map(community => (
            <TouchableOpacity
              key={community}
              style={[
                styles.communityTab,
                selectedCommunity === community && styles.selectedCommunityTab
              ]}
              onPress={() => setSelectedCommunity(
                selectedCommunity === community ? null : community
              )}
            >
              <Text style={[
                styles.communityTabText,
                selectedCommunity === community && styles.selectedCommunityTabText
              ]}>
                r/{community}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Post list */}
      <FlatList
        data={getFilteredPosts()}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            username={username}
            onLikePost={likePost}
            onAddComment={addComment}
            onLikeComment={likeComment}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={64} color={colors.mediumGray} />
            <Text style={styles.emptyText}>
              {selectedCommunity 
                ? `No posts in r/${selectedCommunity} yet`
                : "No posts yet"}
            </Text>
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={() => setCreatePostModalVisible(true)}
            >
              <Text style={styles.createFirstButtonText}>Create the first post</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.postList}
      />
      
      {/* Floating action button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setCreatePostModalVisible(true)}
      >
        <MaterialIcons name="add" size={30} color={colors.white} />
      </TouchableOpacity>
      
      {/* Create post modal */}
      <CreatePostModal
        visible={createPostModalVisible}
        onClose={() => setCreatePostModalVisible(false)}
        onSubmit={createPost}
        username={username}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  
  // Header styles
  headerContainer: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  userWelcome: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    color: colors.white,
    fontSize: 16,
  },
  
  // Communities styles
  communitiesContainer: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    marginBottom: 5,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  communitiesScroll: {
    flexGrow: 0,
  },
  communitiesScrollContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  communityTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  selectedCommunityTab: {
    backgroundColor: colors.primary,
  },
  communityTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  selectedCommunityTabText: {
    color: colors.white,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  loadingText: {
    marginTop: 15,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    margin: 15,
    borderRadius: 15,
  },
  emptyText: {
    fontSize: 18,
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  createFirstButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Post list styles
  postList: {
    paddingVertical: 10,
  },
  
  // Post styles
  postContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  dateText: {
    fontSize: 12,
    color: colors.darkGray,
  },
  communityTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  communityTagText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  captionContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  caption: {
    fontSize: 16,
    color: colors.black,
    lineHeight: 22,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.5,
    backgroundColor: colors.mediumGray,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.mediumGray,
  },
  statsText: {
    fontSize: 13,
    color: colors.darkGray,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  actionText: {
    fontSize: 14,
    color: colors.darkGray,
    marginLeft: 5,
  },
  actionTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  
  // Comments section styles
  commentsSection: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderColor: colors.mediumGray,
  },
  commentInputContainer: {
    marginTop: 15,
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    marginBottom: 5,
  },
  replyingToText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  replyUsername: {
    fontWeight: '600',
    color: colors.primary,
  },
  cancelReply: {
    padding: 5,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: colors.lightGray,
  },
  commentInput: {
    minHeight: 40,
    maxHeight: 100,
    fontSize: 14,
    paddingVertical: 10,
    color: colors.black,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: colors.mediumGray,
  },
  
  // Comment item styles
  commentContainer: {
    paddingVertical: 10,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    marginVertical: 5,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  commentDate: {
    fontSize: 12,
    color: colors.darkGray,
  },
  commentContent: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 15,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentActionText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 5,
  },
  showRepliesText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  repliesContainer: {
    marginLeft: 15,
    marginTop: 5,
  },
  
  // Create Post Modal styles
  createPostContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  createPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  closeButton: {
    padding: 5,
  },
  createPostTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: colors.mediumGray,
  },
  postButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  createPostForm: {
    flex: 1,
    padding: 15,
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.darkGray,
    marginBottom: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  communityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  communityPrefix: {
    paddingLeft: 15,
    fontSize: 16,
    color: colors.darkGray,
  },
  communityInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 5,
    fontSize: 16,
    color: colors.black,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.black,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: colors.white,
    color: colors.black,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: colors.primaryLight,
  },
  imageUploadText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageInput: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    backgroundColor: colors.white,
    color: colors.black,
  },
   
  // Username prompt modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 10,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: colors.white,
    marginBottom: 10,
    color: colors.black,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Floating action button styles
  fab: {
    position: 'absolute',
    right: 20,
    top: 0,
    backgroundColor: colors.secondary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});

export default SocialFeed;