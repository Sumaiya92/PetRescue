import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock data for comments
const DUMMY_COMMENTS = [
  {
    id: '1',
    author: 'Jane Smith',
    authorAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    text: 'Congratulations on your new furry friend! Make sure to get them to a vet for a checkup soon.',
    timestamp: '1 hour ago',
    likes: 3,
  },
  {
    id: '2',
    author: 'Michael Brown',
    authorAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    text: 'Golden Retrievers are the best! So loyal and friendly. You\'ll love having them as part of your family.',
    timestamp: '45 minutes ago',
    likes: 2,
  },
];

const PostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const [comments, setComments] = useState(DUMMY_COMMENTS);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  // Handle like/unlike
  const toggleLike = () => {
    if (isLiked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setIsLiked(!isLiked);
  };

  // Add a new comment
  const addComment = () => {
    if (commentText.trim() === '') return;
    
    const newComment = {
      id: Date.now().toString(),
      author: 'Your Name',
      authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      text: commentText,
      timestamp: 'Just now',
      likes: 0,
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  // Render a comment item
  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.authorAvatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <Text style={styles.commentAuthor}>{item.author}</Text>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
        <View style={styles.commentActions}>
          <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
          <TouchableOpacity>
            <Text style={styles.commentActionText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.container}>
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
            <View style={styles.postHeaderText}>
              <Text style={styles.authorName}>{post.author}</Text>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
            </View>
          </View>
          
          <Text style={styles.postContent}>{post.content}</Text>
          
          {post.image && (
            <Image source={{ uri: post.image }} style={styles.postImage} />
          )}
          
          <View style={styles.postStats}>
            <View style={styles.likesContainer}>
              <View style={styles.likeIcon}>
                <Ionicons name="heart" size={12} color="#fff" />
              </View>
              <Text style={styles.statsText}>{likesCount} likes</Text>
            </View>
            <Text style={styles.statsText}>{post.comments} comments</Text>
          </View>
          
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={isLiked ? "#FF6B6B" : "#666"} 
              />
              <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>Like</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#666" />
              <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={24} color="#666" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.commentsSection}>
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={item => item.id}
            style={styles.commentsList}
          />
        </View>
        
        <View style={styles.commentInputContainer}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} 
            style={styles.commentInputAvatar} 
          />
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            style={styles.commentSubmitButton}
            onPress={addComment}
            disabled={commentText.trim() === ''}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={commentText.trim() === '' ? "#ccc" : "#FF6B6B"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postHeaderText: {
    marginLeft: 10,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    backgroundColor: '#FF6B6B',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  statsText: {
    color: '#666',
    fontSize: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    color: '#666',
  },
  actionTextActive: {
    color: '#FF6B6B',
  },
  commentsSection: {
    flex: 1,
  },
  commentsList: {
    paddingHorizontal: 15,
  },
  commentContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#f0f2f5',
    borderRadius: 18,
    padding: 10,
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 2,
  },
  commentTimestamp: {
    fontSize: 11,
    color: '#666',
    marginRight: 10,
  },
  commentActionText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#666',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentInputAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  commentSubmitButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostDetailScreen;