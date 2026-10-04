const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    default: 'Other'
  },
  condition: {
    type: String,
    default: 'Like New'
  },
  images: [{
    type: String, // Cloudinary URLs or photo URLs
    required: true
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campusName: {
    type: String,
    default: 'Campus Member'
  },
  universityName: {
    type: String,
    default: 'Campus Member'
  },
  location: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'archived'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
