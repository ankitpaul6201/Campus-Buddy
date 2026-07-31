const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

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

// @route   GET /api/products
// @desc    Get all active campus listings
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' })
      .populate('seller', 'fullName username avatar universityName')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// @route   POST /api/products
// @desc    Post a new product listing
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, price, category, condition, images } = req.body;

    const product = new Product({
      title,
      description,
      price,
      category,
      condition,
      images,
      seller: req.auth.userId
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: 'Failed to create product listing' });
  }
});

module.exports = router;
