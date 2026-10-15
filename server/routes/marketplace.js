const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');

// @route   GET /api/marketplace/home
// @desc    Aggregated homepage payload (listings, categories, campus metadata)
router.get('/home', marketplaceController.getHomeMarketplace);

module.exports = router;
