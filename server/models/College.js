const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  aisheCode: {
    type: String,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  rawName: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    index: true
  },
  state: {
    type: String,
    default: '',
    index: true
  },
  district: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: '',
    index: true
  },
  website: {
    type: String,
    default: ''
  },
  yearOfEstablishment: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  collegeType: {
    type: String,
    default: ''
  },
  management: {
    type: String,
    default: ''
  },
  universityAisheCode: {
    type: String,
    default: ''
  },
  universityName: {
    type: String,
    default: '',
    index: true
  },
  universityType: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'India'
  }
}, {
  timestamps: true,
  collection: 'colleges'
});

// Compound text index for fast text search
collegeSchema.index({ name: 'text', city: 'text', universityName: 'text' });

module.exports = mongoose.model('College', collegeSchema);
