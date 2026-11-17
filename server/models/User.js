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
  phone: {
    type: String,
    default: '',
    trim: true,
    index: true
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
  course: {
    type: String,
    default: '',
    trim: true
  },
  year: {
    type: String,
    default: '1st Year',
    trim: true
  },
  dob: {
    type: String,
    default: ''
  },
  ratings: [{
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewerName: { type: String, default: 'Verified Student' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    ratingDescription: { type: String, default: '' },
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
  ratingAverage: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
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
