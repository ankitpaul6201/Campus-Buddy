const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// @route   POST /api/auth/upload-id (rate-limited)
router.post('/upload-id', authLimiter, upload.single('studentId'), authController.uploadStudentId);

// @route   POST /api/auth/signup (rate-limited)
router.post('/signup', authLimiter, authController.signup);

// @route   POST /api/auth/login (rate-limited)
router.post('/login', authLimiter, authController.login);

// @route   GET /api/auth/me
router.get('/me', authMiddleware, authController.getMe);

// @route   PUT /api/auth/me/university
router.put('/me/university', authMiddleware, authController.updateUniversity);

// @route   POST /api/auth/me/avatar
router.post('/me/avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);

// @route   PUT /api/auth/me/password
router.put('/me/password', authMiddleware, authController.updatePassword);

// @route   POST /api/auth/forgot-password (rate-limited)
router.post('/forgot-password', authLimiter, authController.requestResetCode);

// @route   POST /api/auth/verify-reset-code (rate-limited)
router.post('/verify-reset-code', authLimiter, authController.verifyResetCode);

// @route   POST /api/auth/reset-password (rate-limited)
router.post('/reset-password', authLimiter, authController.resetPassword);

// @route   DELETE /api/auth/me (Account deletion & data purge)
router.delete('/me', authMiddleware, authController.deleteAccount);

// @route   GET /api/auth/student/:id (Student profile for ad details & seller info)
router.get('/student/:id', authController.getStudentProfile);

// @route   POST /api/auth/seller/:id/rating (Submit peer seller rating)
router.post('/seller/:id/rating', authMiddleware, authController.submitSellerRating);

// @route   GET /api/auth/seller/:id/ratings (Get peer seller ratings)
router.get('/seller/:id/ratings', authController.getSellerRatingsEndpoint);

module.exports = router;
