const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const Product = require('../models/Product');
const cacheService = require('../cache/cacheService');
const emailService = require('../services/emailService');

// Configure Cloudinary explicitly from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const JWT_SECRET = process.env.JWT_SECRET || 'campus_buddy_super_secret_jwt_key_2026_token_auth';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Timing-safe string comparison to protect against side-channel timing attacks
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Helper to format user payload
const formatUser = (user) => ({
  id: user._id,
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone || '',
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
      phone,
      phoneNumber,
      dob,
      course,
      year,
      universityName,
      studentIdUrl,
      isVerified,
      avatar
    } = req.body;

    if (typeof (name || fullName) !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    const resolvedName = (name || fullName || '').trim();
    const resolvedEmail = email.trim().toLowerCase();

    if (!resolvedName || resolvedName.length > 100) {
      return res.status(400).json({ error: 'Valid full name is required (max 100 characters)' });
    }
    if (!resolvedEmail || !EMAIL_REGEX.test(resolvedEmail) || resolvedEmail.length > 254) {
      return res.status(400).json({ error: 'Valid college email is required' });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be between 8 and 128 characters' });
    }

    const rawPhone = (phone || phoneNumber || '').toString().replace(/\D/g, '');
    if (!rawPhone || rawPhone.length !== 10) {
      return res.status(400).json({ error: 'Phone number must have exactly 10 digits' });
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email: String(resolvedEmail) }).select('_id').lean();
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
      phone: rawPhone,
      universityName: typeof universityName === 'string' ? universityName.trim().slice(0, 100) : 'Campus Member',
      studentIdUrl: typeof studentIdUrl === 'string' ? studentIdUrl.trim() : '',
      isVerified: Boolean(isVerified),
      avatar: typeof avatar === 'string' ? avatar.trim() : '/avatar.svg',
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
    const rawEmail = identifier || email;

    if (typeof rawEmail !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please enter your email and password' });
    }

    const resolvedEmail = rawEmail.trim().toLowerCase();
    if (!resolvedEmail || !password || password.length > 128) {
      return res.status(400).json({ error: 'Please enter your email and password' });
    }

    // Find user in MongoDB Atlas with safe string casting
    const user = await User.findOne({ email: String(resolvedEmail) }).lean();
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
    const { universityName, fullName, name, isVerified, studentIdUrl, avatar, dob, course, year, phone, phoneNumber } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // University name is locked once verified and cannot be edited
    if (universityName && !user.universityName) user.universityName = universityName;
    if (fullName || name) user.fullName = fullName || name;
    let phoneChanged = false;
    let targetPhone = '';
    if (phone !== undefined || phoneNumber !== undefined) {
      targetPhone = (phone !== undefined ? phone : phoneNumber).toString().replace(/\D/g, '');
      if (targetPhone.length !== 10) {
        return res.status(400).json({ error: 'Phone number must have exactly 10 digits' });
      }
      if (user.phone !== targetPhone) {
        phoneChanged = true;
      }
      user.phone = targetPhone;
    }
    if (studentIdUrl) user.studentIdUrl = studentIdUrl;
    if (isVerified !== undefined) user.isVerified = Boolean(isVerified);

    // If avatar is provided as a Base64 data URI, upload it permanently to Cloudinary
    if (avatar && typeof avatar === 'string') {
      if (avatar.startsWith('data:image')) {
        try {
          const uploadRes = await cloudinary.uploader.upload(avatar, {
            folder: 'campus_buddy_avatars',
            resource_type: 'image',
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' }]
          });
          user.avatar = uploadRes.secure_url;
        } catch (cloudErr) {
          console.error('[authController] Cloudinary avatar upload failed:', cloudErr.message);
        }
      } else if (avatar.startsWith('http') || avatar.startsWith('/')) {
        user.avatar = avatar;
      }
    }

    await user.save();

    // If phone number or full name was updated, synchronize all existing ads in MongoDB for this student
    if (phoneChanged || fullName || name) {
      const updateFields = {};
      if (targetPhone) {
        updateFields.phone = targetPhone;
        updateFields.contactNumber = targetPhone;
      }

      if (Object.keys(updateFields).length > 0) {
        await Product.updateMany(
          { seller: userId },
          { $set: updateFields }
        );
      }

      // Invalidate product caches for this user's ads so buyers see the updated number immediately
      try {
        const userProducts = await Product.find({ seller: userId }).select('_id').lean();
        userProducts.forEach(p => {
          cacheService.del(`product_detail:${p._id}`);
        });
        cacheService.invalidatePattern('products:');
        cacheService.invalidatePattern('marketplace:');
        cacheService.invalidatePattern(`user_ads:${userId}`);
      } catch (cacheErr) {
        console.warn('[authController] Cache invalidation warning:', cacheErr.message);
      }
    }

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
    if (typeof email !== 'string') {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const resolvedEmail = email.trim().toLowerCase();
    if (!resolvedEmail || !EMAIL_REGEX.test(resolvedEmail) || resolvedEmail.length > 254) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Cast explicitly to primitive string to prevent NoSQL query operator injection
    const user = await User.findOne({ email: String(resolvedEmail) });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email. Please check your email or sign up.' });
    }

    // Generate cryptographically secure 6-digit verification code
    const code = crypto.randomInt(100000, 1000000).toString();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // Valid for 15 minutes
    user.resetPasswordAttempts = 0; // Reset attempts counter
    await user.save();

    // Send code to the user's email inbox asynchronously so the HTTP response returns immediately (<100ms)
    emailService.sendVerificationCode({
      to: resolvedEmail,
      code,
      name: user.fullName || user.name
    }).then(res => {
      console.log(`[authController] Verification code delivered to ${resolvedEmail}`);
    }).catch(emailErr => {
      console.error('[authController] Background verification email delivery failed:', emailErr.message);
    });

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${resolvedEmail}. Please check your inbox and spam folder.`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify password reset code
 */
async function verifyResetCode(req, res, next) {
  try {
    const { email, code } = req.body;
    if (typeof email !== 'string' || typeof code !== 'string') {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const resolvedEmail = email.trim().toLowerCase();
    const resolvedCode = code.trim();

    if (!resolvedEmail || !EMAIL_REGEX.test(resolvedEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!/^\d{6}$/.test(resolvedCode)) {
      return res.status(400).json({ error: 'Verification code must be exactly 6 digits' });
    }

    const user = await User.findOne({ email: String(resolvedEmail) });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Check expiry first
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      user.resetPasswordAttempts = 0;
      await user.save();
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    // Rate-limit brute force attempts per OTP (max 5 failed attempts)
    if ((user.resetPasswordAttempts || 0) >= 5) {
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      user.resetPasswordAttempts = 0;
      await user.save();
      return res.status(429).json({ error: 'Too many incorrect attempts. For security, this verification code has been invalidated. Please request a new code.' });
    }

    // Timing-safe comparison to prevent timing attacks
    if (!user.resetPasswordCode || !safeCompare(user.resetPasswordCode, resolvedCode)) {
      user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
      await user.save();
      const attemptsLeft = Math.max(0, 5 - user.resetPasswordAttempts);
      return res.status(400).json({
        error: attemptsLeft > 0
          ? `Invalid verification code. ${attemptsLeft} attempt(s) remaining.`
          : 'Too many incorrect attempts. This code has been invalidated. Please request a new one.'
      });
    }

    res.json({ success: true, message: 'Verification code verified successfully' });
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
    if (typeof email !== 'string' || typeof code !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Email, verification code, and new password are required' });
    }

    const resolvedEmail = email.trim().toLowerCase();
    const resolvedCode = code.trim();

    if (!resolvedEmail || !EMAIL_REGEX.test(resolvedEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (!/^\d{6}$/.test(resolvedCode)) {
      return res.status(400).json({ error: 'Verification code must be exactly 6 digits' });
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ error: 'Password must be between 8 and 128 characters' });
    }

    const user = await User.findOne({ email: String(resolvedEmail) });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Check expiry
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      user.resetPasswordAttempts = 0;
      await user.save();
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    // Check attempt limits
    if ((user.resetPasswordAttempts || 0) >= 5) {
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      user.resetPasswordAttempts = 0;
      await user.save();
      return res.status(429).json({ error: 'Too many incorrect attempts. For security, this verification code has been invalidated. Please request a new code.' });
    }

    // Timing-safe compare
    if (!user.resetPasswordCode || !safeCompare(user.resetPasswordCode, resolvedCode)) {
      user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
      await user.save();
      const attemptsLeft = Math.max(0, 5 - user.resetPasswordAttempts);
      return res.status(400).json({
        error: attemptsLeft > 0
          ? `Invalid verification code. ${attemptsLeft} attempt(s) remaining.`
          : 'Too many incorrect attempts. This code has been invalidated. Please request a new one.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    // Purge reset credentials
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    user.resetPasswordAttempts = 0;
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
 * Upload profile avatar image to Cloudinary
 */
async function uploadAvatar(req, res, next) {
  try {
    const userId = req.user.id || (req.auth && req.auth.userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let fileData = null;
    if (req.file) {
      fileData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body && typeof req.body.avatar === 'string') {
      fileData = req.body.avatar;
    }

    if (!fileData) {
      return res.status(400).json({ error: 'No avatar image file provided' });
    }

    const uploadRes = await cloudinary.uploader.upload(fileData, {
      folder: 'campus_buddy_avatars',
      resource_type: 'image',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' }]
    });

    user.avatar = uploadRes.secure_url;
    await user.save();

    res.json({
      success: true,
      url: uploadRes.secure_url,
      avatar: uploadRes.secure_url,
      user: formatUser(user)
    });
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
  verifyResetCode,
  resetPassword,
  uploadStudentId,
  uploadAvatar,
  deleteAccount
};
