const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

const JWT_SECRET = process.env.JWT_SECRET || 'campus_buddy_super_secret_jwt_key_2026_token_auth';

// Helper to format user payload
const formatUser = (user) => ({
  id: user._id,
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  universityName: user.universityName || 'Campus Member',
  avatar: user.avatar || '/avatar.svg',
  studentIdUrl: user.studentIdUrl || '',
  isVerified: Boolean(user.isVerified),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// @route   POST /api/auth/upload-id
// @desc    Upload Student ID image to Cloudinary (folder: campus_buddy_verification)
// @access  Public
router.post('/upload-id', upload.single('studentId'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No student ID file provided' });
    }

    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'campus_buddy_verification',
      resource_type: 'auto',
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
    });

    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('Cloudinary student ID upload error:', err);
    res.status(500).json({ error: 'Failed to upload student ID to Cloudinary' });
  }
});

// @route   POST /api/auth/signup
// @desc    Register a new student directly in MongoDB Atlas and return JWT token
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      password,
      universityName,
      studentIdUrl,
      isVerified,
      avatar
    } = req.body;

    const resolvedName = (name || fullName || '').trim();
    const resolvedEmail = (email || '').trim().toLowerCase();

    if (!resolvedName) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!resolvedEmail || !resolvedEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid college email is required' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email: resolvedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user in MongoDB Atlas
    const user = new User({
      fullName: resolvedName,
      email: resolvedEmail,
      password: hashedPassword,
      universityName: universityName || 'Campus Member',
      studentIdUrl: studentIdUrl || '',
      isVerified: Boolean(isVerified),
      avatar: avatar || '/avatar.svg',
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: formatUser(user)
    });
  } catch (err) {
    console.error('Registration error in /api/auth/signup:', err);
    res.status(500).json({ error: err.message || 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user directly from MongoDB Atlas and return JWT token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const resolvedEmail = (identifier || email || '').trim().toLowerCase();

    if (!resolvedEmail || !password) {
      return res.status(400).json({ error: 'Please enter your email and password' });
    }

    // Find user in MongoDB Atlas
    const user = await User.findOne({ email: resolvedEmail });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email. Please sign up first.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password entered. Please try again.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: formatUser(user)
    });
  } catch (err) {
    console.error('Login error in /api/auth/login:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get the current authenticated user directly from MongoDB Atlas
// @access  Private (JWT required)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.auth.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User profile not found in database' });
    }

    res.json(formatUser(user));
  } catch (err) {
    console.error('Error fetching user profile in /api/auth/me:', err);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

// @route   PUT /api/auth/me/university
// @desc    Update user campus profile directly in MongoDB Atlas
// @access  Private (JWT required)
router.put('/me/university', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.auth.userId;
    const { universityName, fullName, name, isVerified, studentIdUrl, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // University name is locked once verified and cannot be edited
    if (universityName && !user.universityName) user.universityName = universityName;
    if (fullName || name) user.fullName = fullName || name;
    if (avatar) user.avatar = avatar;
    if (studentIdUrl) user.studentIdUrl = studentIdUrl;
    if (isVerified !== undefined) user.isVerified = Boolean(isVerified);

    await user.save();

    res.json({
      success: true,
      user: formatUser(user)
    });
  } catch (err) {
    console.error('Error updating profile in /api/auth/me/university:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// @route   PUT /api/auth/me/password
// @desc    Update password for authenticated user
// @access  Private (JWT required)
router.put('/me/password', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with verified email
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const resolvedEmail = (email || '').trim().toLowerCase();

    if (!resolvedEmail || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const user = await User.findOne({ email: resolvedEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
