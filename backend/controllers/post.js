const express = require('express');
const router = express.Router();
const  Post  = require('../models/post');
const Comment = require('../models/Comment');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('comments').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a post
router.post('/', async (req, res) => {
  const { username, caption, imageUrl } = req.body;
  try {
    const newPost = new Post({ username, caption, imageUrl });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like/Unlike a post
router.put('/:postId/like', async (req, res) => {
  const { username } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.likes.includes(username)) {
      post.likes.pull(username);
    } else {
      post.likes.push(username);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment to post
router.post('/:postId/comment', async (req, res) => {
  const { username, content, parentCommentId } = req.body;
  try {
    const newComment = new Comment({ username, content, parentCommentId });
    await newComment.save();

    const post = await Post.findById(req.params.postId);
    post.comments.push(newComment._id);
    await post.save();

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
