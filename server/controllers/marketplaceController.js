const Product = require('../models/Product');
const cacheService = require('../cache/cacheService');

const STANDARD_CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'books', label: 'Books & Notes' },
  { id: 'electronics', label: 'Electronics & Gadgets' },
  { id: 'cycles', label: 'Cycles & Vehicles' },
  { id: 'dorm', label: 'Dorm Essentials' },
  { id: 'fashion', label: 'Fashion & Wearables' },
  { id: 'other', label: 'Other Essentials' }
];

/**
 * GET /api/marketplace/home
 * Aggregated screen endpoint: returns active listings, categories, and campus summary
 * in a single request, eliminating frontend request waterfalls.
 */
async function getHomeMarketplace(req, res, next) {
  try {
    const { university, campus } = req.query;
    const targetUni = (university || campus || '').trim();
    const cacheKey = `marketplace:home:${targetUni || 'all'}`;

    const data = await cacheService.getOrFetch(cacheKey, async () => {
      const filter = { status: 'active' };

      if (targetUni) {
        const escaped = targetUni.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
          { campusName: new RegExp(escaped, 'i') },
          { universityName: new RegExp(escaped, 'i') }
        ];
      }

      // Fetch active products with lean projection
      const products = await Product.find(filter)
        .select('title description price category condition images seller campusName universityName location status createdAt')
        .populate('seller', 'fullName avatar universityName isVerified email')
        .sort({ createdAt: -1 })
        .limit(40)
        .lean();

      return {
        success: true,
        university: targetUni || 'All Campuses',
        categories: STANDARD_CATEGORIES,
        products,
        totalCount: products.length,
        timestamp: new Date().toISOString()
      };
    }, 30); // 30-second TTL

    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHomeMarketplace
};
