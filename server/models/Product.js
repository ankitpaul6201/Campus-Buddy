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
  phone: {
    type: String,
    default: ''
  },
  contactNumber: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'archived'],
    default: 'active'
  },
  reports: [{
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, default: 'Inappropriate content' },
    details: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
  isFlagged: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound indexes matching high-concurrency query patterns
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ universityName: 1, status: 1, createdAt: -1 });
productSchema.index({ campusName: 1, status: 1, createdAt: -1 });
productSchema.index({ seller: 1, createdAt: -1 });
productSchema.index({ category: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);

