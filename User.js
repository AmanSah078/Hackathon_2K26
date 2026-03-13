// ================================================================
// PostOBT — User Model
// File: models/User.js
// ================================================================

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({

  // ── Basic Info ──
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },

  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false   // password by default queries mein nahi aayega
  },

  // ── Profile ──
  displayName: {
    type: String,
    default: function() { return this.username; }
  },

  avatar: {
    type: String,
    default: ''
  },

  bio: {
    type: String,
    default: '',
    maxlength: [160, 'Bio cannot exceed 160 characters']
  },

  // ── Verification ──
  emailVerified: {
    type: Boolean,
    default: false
  },

  mobileVerified: {
    type: Boolean,
    default: false
  },

  // ── OTP (temporary storage) ──
  emailOtp: { type: String, select: false },
  emailOtpExpiry: { type: Date, select: false },
  mobileOtp: { type: String, select: false },
  mobileOtpExpiry: { type: Date, select: false },

  // ── Connected Social Platforms ──
  connectedPlatforms: {
    instagram: { type: Boolean, default: false },
    youtube:   { type: Boolean, default: false },
    twitter:   { type: Boolean, default: false },
    facebook:  { type: Boolean, default: false }
  },

  // ── Stats ──
  totalPosts:     { type: Number, default: 0 },
  totalFollowers: { type: Number, default: 0 },

  // ── Settings ──
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },

  notifications: {
    email:  { type: Boolean, default: true },
    push:   { type: Boolean, default: true },
    weekly: { type: Boolean, default: false }
  },

  // ── Timestamps ──
  createdAt: { type: Date, default: Date.now },
  lastLogin:  { type: Date, default: Date.now }

}, { timestamps: true });

// ── HASH PASSWORD BEFORE SAVE ──
UserSchema.pre('save', async function(next) {
  // Sirf tab hash karo jab password change hua ho
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── COMPARE PASSWORD METHOD ──
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── GET INITIALS (for avatar) ──
UserSchema.methods.getInitials = function() {
  return this.displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

module.exports = mongoose.model('User', UserSchema);
