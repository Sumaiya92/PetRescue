const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  username: { type: String, required: true },
  caption: { type: String },
  imageUrl: { type: String },
  likes: [{ type: String }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);  // clean export