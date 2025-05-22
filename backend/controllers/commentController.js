const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Like/Unlike comment
router.put('/:commentId/like', async (req, res) => {
  const { username } = req.body;
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    if (comment.likes.includes(username)) {
      comment.likes.pull(username);
    } else {
      comment.likes.push(username);
    }
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all replies of a comment
router.get('/:commentId/replies', async (req, res) => {
  try {
    const replies = await Comment.find({ parentCommentId: req.params.commentId });
    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
