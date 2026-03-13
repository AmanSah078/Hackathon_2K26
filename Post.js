// ================================================================
// PostOBT — Post Model
// File: models/Post.js
// ================================================================

const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2200, 'Content cannot exceed 2200 characters']
  },

  caption: {
    type: String,
    default: ''
  },

  platforms: [{
    type: String,
    enum: ['instagram', 'youtube', 'twitter', 'facebook']
  }],

  mediaUrl: {
    type: String,
    default: ''
  },

  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft'
  },

  scheduledAt: {
    type: Date,
    default: null
  },

  publishedAt: {
    type: Date,
    default: null
  },

  // ── Engagement Stats ──
  likes:    { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares:   { type: Number, default: 0 },
  reach:    { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
