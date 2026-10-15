const mongoose = require('mongoose');

// User model for Traditional JWT Auth + Campus Profile directly in MongoDB Atlas
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  universityName: {
    type: String,
    default: 'Campus Member'
  },
  avatar: {
    type: String,
    default: '/avatar.svg'
  },
  studentIdUrl: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordCode: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  resetPasswordAttempts: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
