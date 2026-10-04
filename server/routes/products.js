const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const User = require('../models/User');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for in-memory file handling
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max per image
});

// @route   POST /api/products/upload-image
// @desc    Upload product image to Cloudinary & return CDN URL
router.post('/upload-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert buffer to base64 Data URI for Cloudinary upload
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'campus_buddy_products',
      transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
    });

    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
  }
});

// @route   GET /api/products/my-ads
// @desc    Get all listings posted by the logged-in user
router.get('/my-ads', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const products = await Product.find({ seller: userId })
      .populate('seller', 'fullName avatar universityName isVerified email')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error('Error fetching my-ads:', err);
    res.status(500).json({ error: 'Server error fetching user listings' });
  }
});

// @route   GET /api/products
// @desc    Get all active campus listings (optionally filtered by university/campus)
router.get('/', async (req, res) => {
  try {
    const { university, campus, status = 'active', seller } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (seller) filter.seller = seller;

    const uniQuery = university || campus;
    if (uniQuery && uniQuery.trim()) {
      const cleanUni = uniQuery.trim();
      const escaped = cleanUni.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { campusName: new RegExp(escaped, 'i') },
        { universityName: new RegExp(escaped, 'i') }
      ];
    }

    const products = await Product.find(filter)
      .populate('seller', 'fullName avatar universityName isVerified email')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// @route   POST /api/products
// @desc    Post a new product listing
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, price, category, condition, images, location, campusName, universityName } = req.body;
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);

    const userDoc = await User.findById(userId);
    const resolvedCampus = campusName || universityName || (userDoc && userDoc.universityName) || 'Campus Member';

    const product = new Product({
      title,
      description: description || '',
      price: Number(price) || 0,
      category: category || 'Other',
      condition: condition || 'Like New',
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80'],
      seller: userId,
      campusName: resolvedCampus,
      universityName: resolvedCampus,
      location: location || ''
    });

    await product.save();
    const populated = await Product.findById(product._id).populate('seller', 'fullName avatar universityName isVerified email');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: 'Failed to create product listing', details: err.message });
  }
});

// @route   PATCH /api/products/:id/status
// @desc    Toggle product status (active / sold)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const { status } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: userId },
      { status },
      { new: true }
    ).populate('seller', 'fullName avatar universityName isVerified email');

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error updating product status:', err);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product listing
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: userId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
