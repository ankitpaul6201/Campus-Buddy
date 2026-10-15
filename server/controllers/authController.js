const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');

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

/**
 * Register a new student
 */
async function signup(req, res, next) {
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
    const existingUser = await User.findOne({ email: resolvedEmail }).select('_id').lean();
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
    next(err);
  }
}

/**
 * Authenticate user
 */
async function login(req, res, next) {
  try {
    const { identifier, email, password } = req.body;
    const resolvedEmail = (identifier || email || '').trim().toLowerCase();

    if (!resolvedEmail || !password) {
      return res.status(400).json({ error: 'Please enter your email and password' });
    }

    // Find user in MongoDB Atlas with lean query
    const user = await User.findOne({ email: resolvedEmail }).lean();
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
    next(err);
  }
}

/**
 * Get the current authenticated user
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.id || (req.auth && req.auth.userId);
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return res.status(404).json({ error: 'User profile not found in database' });
    }

    res.json(formatUser(user));
  } catch (err) {
    next(err);
  }
}

/**
 * Update user campus profile
 */
async function updateUniversity(req, res, next) {
  try {
    const userId = req.user.id || (req.auth && req.auth.userId);
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
    next(err);
  }
}

/**
 * Update password
 */
async function updatePassword(req, res, next) {
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
    next(err);
  }
}

/**
 * Request password reset code
 */
async function requestResetCode(req, res, next) {
  try {
    const { email } = req.body;
    const resolvedEmail = (email || '').trim().toLowerCase();

    if (!resolvedEmail) {
      return res.status(400).json({ error: 'Please enter your registered email address' });
    }

    const user = await User.findOne({ email: resolvedEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email. Please check your email or sign up.' });
    }

    // Generate secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // Valid for 15 minutes
    await user.save();

    res.json({
      success: true,
      message: 'Verification code generated successfully',
      code
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reset password
 */
async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;
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

    // Verify code if code was previously issued
    if (user.resetPasswordCode && code) {
      if (user.resetPasswordCode !== String(code).trim()) {
        return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
      }
      if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Generate fresh JWT token for seamless auto-login
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Password reset successfully',
      token,
      user: formatUser(user)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Upload student ID image to Cloudinary
 */
async function uploadStudentId(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No student ID file provided' });
    }

    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'campus_buddy_verification',
      resource_type: 'auto',
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
    });

    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/auth/me
 * Permanently delete authenticated user's account and all associated listings and chats
 */
async function deleteAccount(req, res, next) {
  try {
    const userId = req.user.id || (req.auth && req.auth.userId);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const Product = require('../models/Product');
    const Conversation = require('../models/Conversation');
    const cacheService = require('../cache/cacheService');

    // 1. Delete all user listings
    await Product.deleteMany({ seller: userId });

    // 2. Invalidate caches
    cacheService.invalidatePattern('products:');
    cacheService.invalidatePattern('marketplace:');
    cacheService.delete(`user_ads:${userId}`);

    // 3. Delete user conversations
    await Conversation.deleteMany({ participants: userId });

    // 4. Delete user document
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Your account and all associated listings have been permanently deleted.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  login,
  getMe,
  updateUniversity,
  updatePassword,
  requestResetCode,
  resetPassword,
  uploadStudentId,
  deleteAccount
};
