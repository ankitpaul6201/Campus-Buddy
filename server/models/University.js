const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  slug: {
    type: String,
    index: true
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'India'
  },
  logo: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  verified: {
    type: Boolean,
    default: true
  },
  studentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'universities'
});

module.exports = mongoose.model('University', universitySchema);
