const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  username: { type: String, required: true },  // from localStorage
  content: { type: String, required: true },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },  // null = top level comment
  likes: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);  // correct export
