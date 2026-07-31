const express = require('express');
const router = express.Router();
const { clerkClient } = require('@clerk/express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/auth/me
// @desc    Get the current user's campus profile (synced with Clerk identity)
// @access  Private (Clerk token required)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.auth;

    // Check if we have a local campus profile for this Clerk user
    let campusUser = await User.findOne({ clerkId: userId });

    if (!campusUser) {
      // First login after Clerk signup — fetch from Clerk and create local profile
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
      const username = clerkUser.username || email.split('@')[0].toLowerCase().replace(/\s+/g, '');

      campusUser = new User({
        clerkId: userId,
        username,
        email,
        fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || username,
        universityName: clerkUser.publicMetadata?.universityName || 'Campus Member',
        avatar: clerkUser.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      });
      await campusUser.save();
    }

    res.json({
      id: campusUser._id,
      clerkId: campusUser.clerkId,
      username: campusUser.username,
      email: campusUser.email,
      fullName: campusUser.fullName,
      universityName: campusUser.universityName,
      avatar: campusUser.avatar,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

// @route   PUT /api/auth/me/university
// @desc    Update the university for the current user (called after Clerk signup step 2)
// @access  Private
router.put('/me/university', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { universityName, username } = req.body;

    let campusUser = await User.findOne({ clerkId: userId });

    if (!campusUser) {
      // Create the profile if it doesn't exist yet
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
      campusUser = new User({
        clerkId: userId,
        username: username || email.split('@')[0].toLowerCase(),
        email,
        fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        universityName: universityName || 'Campus Member',
        avatar: clerkUser.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      });
    } else {
      if (universityName) campusUser.universityName = universityName;
      if (username) campusUser.username = username;
    }

    await campusUser.save();

    // Also persist universityName to Clerk public metadata so it's available everywhere
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { universityName: campusUser.universityName },
    });

    res.json({ success: true, universityName: campusUser.universityName });
  } catch (err) {
    console.error('Error updating university:', err);
    res.status(500).json({ error: 'Failed to update university' });
  }
});

module.exports = router;
