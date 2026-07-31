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
    enum: ['All Items', 'Books', 'Electronics', 'Dorm & Living', 'Clothing & Merch', 'Vehicles & Cycles', 'Sports & Hobbies'],
    default: 'All Items'
  },
  condition: {
    type: String,
    enum: ['Like New', 'Good', 'Fair'],
    default: 'Like New'
  },
  images: [{
    type: String, // Cloudinary URLs
    required: true
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campusName: {
    type: String,
    default: 'Stanford Campus'
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'archived'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
