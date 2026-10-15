const express = require('express');
const router = express.Router();
const universityController = require('../controllers/universityController');

// @route   GET /api/universities
// @desc    Cached search across universities and colleges
router.get('/', universityController.searchUniversities);

module.exports = router;
