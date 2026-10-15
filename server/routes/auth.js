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

// @route   POST /api/auth/upload-id
router.post('/upload-id', upload.single('studentId'), authController.uploadStudentId);

// @route   POST /api/auth/signup (rate-limited)
router.post('/signup', authLimiter, authController.signup);

// @route   POST /api/auth/login (rate-limited)
router.post('/login', authLimiter, authController.login);

// @route   GET /api/auth/me
router.get('/me', authMiddleware, authController.getMe);

// @route   PUT /api/auth/me/university
router.put('/me/university', authMiddleware, authController.updateUniversity);

// @route   PUT /api/auth/me/password
router.put('/me/password', authMiddleware, authController.updatePassword);

// @route   POST /api/auth/reset-password (rate-limited)
router.post('/reset-password', authLimiter, authController.resetPassword);

// @route   DELETE /api/auth/me (Account deletion & data purge)
router.delete('/me', authMiddleware, authController.deleteAccount);

module.exports = router;
