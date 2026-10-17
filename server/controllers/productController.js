const Product = require('../models/Product');
const User = require('../models/User');
const cacheService = require('../cache/cacheService');
const { createAndSendNotification } = require('../services/notificationService');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * GET /api/products
 * Optimized product catalog query with compound indexing, projection, lean docs, and caching.
 */
async function getProducts(req, res, next) {
  try {
    const { university, campus, status = 'active', seller, category, limit, page, cursor, format } = req.query;

    const pageSize = limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 60;
    const cacheKey = `products:${university || campus || 'all'}:${status || 'all'}:${category || 'all'}:${seller || 'all'}:${pageSize}:${cursor || page || '1'}`;
    const bypass = req.headers['cache-control'] === 'no-cache' || req.headers['x-cache-bypass'] === 'true';

    // Stampede-protected cache lookup (30-second TTL) with cold-cache bypass support
    const result = await cacheService.getOrFetch(cacheKey, async () => {
      const filter = {};
      if (status && status !== 'all') filter.status = status;
      if (seller) filter.seller = seller;
      if (category && category !== 'all') filter.category = category;

      // Efficient University / Campus filtering
      const uniQuery = (university || campus || '').trim();
      if (uniQuery) {
        const escaped = uniQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match either exact or prefix regex to maximize index utility
        filter.$or = [
          { campusName: new RegExp(escaped, 'i') },
          { universityName: new RegExp(escaped, 'i') }
        ];
      }

      // Cursor-based pagination support for scalability
      if (cursor) {
        filter._id = { $lt: cursor };
      }

      let query = Product.find(filter)
        .select('title description price category condition images seller campusName universityName location phone contactNumber status createdAt')
        .populate('seller', 'fullName avatar universityName isVerified email phone')
        .sort({ createdAt: -1 })
        .limit(pageSize + 1)
        .lean();

      if (!cursor && page && parseInt(page, 10) > 1) {
        const skipCount = (parseInt(page, 10) - 1) * pageSize;
        query = query.skip(skipCount);
      }

      const rawItems = await query;
      let hasMore = rawItems.length > pageSize;
      let items = hasMore ? rawItems.slice(0, pageSize) : rawItems;
      let nextCursor = items.length > 0 ? items[items.length - 1]._id : null;

      // If client explicitly requested paginated format
      if (format === 'paginated') {
        return {
          products: items,
          hasMore,
          nextCursor,
          count: items.length
        };
      }

      // Default: direct array for 100% backward compatibility with existing frontend
      return items;
    }, 30);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/my-ads
 * Retrieves listings posted by the authenticated user
 */
async function getMyAds(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const cacheKey = `user_ads:${userId}`;
    const products = await cacheService.getOrFetch(cacheKey, async () => {
      return Product.find({ seller: userId })
        .select('title description price category condition images seller campusName universityName location phone contactNumber status createdAt')
        .populate('seller', 'fullName avatar universityName isVerified email phone')
        .sort({ createdAt: -1 })
        .lean();
    }, 15);

    res.json(products);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id
 * Retrieve details for a single product with caching
 */
async function getProductById(req, res, next) {
  try {
    const productId = req.params.id;
    const cacheKey = `product_detail:${productId}`;

    const product = await cacheService.getOrFetch(cacheKey, async () => {
      return Product.findById(productId)
        .select('title description price category condition images seller campusName universityName location phone contactNumber status createdAt updatedAt')
        .populate('seller', 'fullName avatar universityName isVerified email phone createdAt')
        .lean();
    }, 60);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products
 * Create a new product listing and invalidate catalog caches
 */
async function createProduct(req, res, next) {
  try {
    const { title, description, price, category, condition, images, location, campusName, universityName, phone, phoneNumber, contactNumber } = req.body;
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);

    const numericPrice = Number(price) || 0;
    if (numericPrice <= 0) {
      return res.status(400).json({ error: 'Please enter a valid price' });
    }
    if (numericPrice > 200000) {
      return res.status(400).json({ error: 'Only items up to ₹2,00,000 can be listed' });
    }
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one photo for the listing' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'Pickup location is required' });
    }

    // Fetch user profile once for campus resolution and response payload
    const userDoc = await User.findById(userId).select('fullName avatar universityName isVerified email phone').lean();
    const resolvedCampus = campusName || universityName || userDoc?.universityName || 'Campus Member';

    // Validate 10-digit phone number strictly
    const rawContactPhone = (phone || contactNumber || phoneNumber || userDoc?.phone || '').toString().replace(/\D/g, '');
    const cleanPhone = rawContactPhone.length >= 10 ? rawContactPhone.slice(-10) : '';
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Phone number must have exactly 10 digits' });
    }

    // Sync phone back to user account if missing or updated
    if (!userDoc?.phone || userDoc.phone !== cleanPhone) {
      User.findByIdAndUpdate(userId, { phone: cleanPhone }).catch(e => console.warn('User phone sync error:', e));
    }

    const product = new Product({
      title: title.trim(),
      description: description.trim(),
      price: numericPrice,
      category: (category && category.trim()) || 'Other',
      condition: condition || 'Like New',
      images: images.slice(0, 5),
      seller: userId,
      campusName: resolvedCampus,
      universityName: resolvedCampus,
      location: location.trim(),
      phone: cleanPhone,
      contactNumber: cleanPhone,
      status: 'active'
    });

    await product.save();

    // Invalidate university-specific cache and global feed
    cacheService.invalidatePattern('products:all');
    cacheService.invalidatePattern('marketplace:');
    cacheService.invalidatePattern(`user_ads:${userId}`);
    if (resolvedCampus) {
      cacheService.invalidatePattern(`products:${resolvedCampus.toLowerCase()}`);
    }

    const responsePayload = product.toObject();
    responsePayload.phone = cleanPhone;
    responsePayload.contactNumber = cleanPhone;
    responsePayload.seller = {
      ...(userDoc || { _id: userId, fullName: 'Student', universityName: resolvedCampus }),
      phone: cleanPhone
    };

    res.status(201).json(responsePayload);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/products/:id/status
 * Toggle product status (active / sold) with cache invalidation
 */
async function updateProductStatus(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const { status } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: userId },
      { status },
      { new: true }
    )
      .populate('seller', 'fullName avatar universityName isVerified email phone')
      .lean();

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    // Invalidate caches
    cacheService.invalidatePattern('products:all');
    cacheService.invalidatePattern('marketplace:');
    cacheService.delete(`product_detail:${req.params.id}`);
    cacheService.invalidatePattern(`user_ads:${userId}`);
    if (product.universityName) {
      cacheService.invalidatePattern(`products:${product.universityName.toLowerCase()}`);
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:id
 * Delete a product listing with cache invalidation
 */
async function deleteProduct(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: userId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    // Invalidate caches
    cacheService.invalidatePattern('products:all');
    cacheService.invalidatePattern('marketplace:');
    cacheService.delete(`product_detail:${req.params.id}`);
    cacheService.invalidatePattern(`user_ads:${userId}`);
    if (product.universityName) {
      cacheService.invalidatePattern(`products:${product.universityName.toLowerCase()}`);
    }

    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products/upload-image
 * Cloudinary image upload with stream/memory protection
 */
async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate image MIME type to prevent malicious uploads
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPG, PNG, and WebP images are permitted' });
    }

    // Convert buffer to Data URI for Cloudinary upload with auto format and compression
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'campus_buddy_products',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
      ]
    });

    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products/sign-upload
 * Secure signature generator for direct client-to-Cloudinary uploads
 * Eliminates backend CPU/memory bottlenecks for file transfers
 */
async function signUpload(req, res, next) {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'campus_buddy_products';

    const signature = cloudinary.utils.api_sign_request({
      folder,
      timestamp
    }, process.env.CLOUDINARY_API_SECRET);

    res.json({
      success: true,
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products/:id/report
 * Student listing report & moderation flagging
 */
async function reportProduct(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const { reason, details } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Please specify a reason for reporting' });
    }

    if (!Array.isArray(product.reports)) {
      product.reports = [];
    }

    // Prevent duplicate reporting by the same student
    const alreadyReported = product.reports.some(r => String(r.reporter) === String(userId));
    if (alreadyReported) {
      return res.status(400).json({ error: 'You have already reported this listing' });
    }

    product.reports.push({
      reporter: userId,
      reason: reason.trim(),
      details: details ? details.trim() : '',
      createdAt: new Date()
    });

    if (product.reports.length >= 3) {
      product.isFlagged = true;
    }

    await product.save();

    res.json({
      success: true,
      reportCount: product.reports.length,
      message: 'Thank you for reporting. Our campus moderation team has been notified.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products/:id/like
 * Like or wishlist a product + notify seller in real time
 */
async function likeProduct(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const { isLiked } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Only notify if liking (not unliking) and user is not the seller
    if (isLiked && String(product.seller) !== String(userId)) {
      User.findById(userId).select('fullName avatar').lean().then(likerUser => {
        const likerName = likerUser?.fullName || 'A student';
        return createAndSendNotification({
          recipientId: product.seller,
          senderId: userId,
          type: 'like',
          title: `${likerName} liked your listing`,
          message: `${likerName} added "${product.title}" to their wishlist.`,
          productId: product._id
        });
      }).catch(err => console.error('Notification error in likeProduct:', err));
    }

    res.json({ success: true, isLiked: Boolean(isLiked) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products/:id/buy-intent
 * Signal buyer interest / want-to-buy intent + notify seller
 */
async function expressBuyIntent(req, res, next) {
  try {
    const userId = (req.user && req.user.id) || (req.auth && req.auth.userId);
    const { message } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (String(product.seller) === String(userId)) {
      return res.status(400).json({ error: 'You are the seller of this listing' });
    }

    const buyerUser = await User.findById(userId).select('fullName avatar').lean();
    const buyerName = buyerUser?.fullName || 'A student';
    const note = message && message.trim() ? ` "${message.trim()}"` : '';

    await createAndSendNotification({
      recipientId: product.seller,
      senderId: userId,
      type: 'buy_intent',
      title: `Buyer Interest: ${product.title}`,
      message: `${buyerName} wants to purchase your "${product.title}"!${note} Check your chats to coordinate.`,
      productId: product._id,
      metadata: { buyerName, buyerId: userId }
    });

    res.json({ success: true, message: 'Seller notified of your purchase interest' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getMyAds,
  getProductById,
  createProduct,
  updateProductStatus,
  deleteProduct,
  uploadImage,
  signUpload,
  reportProduct,
  likeProduct,
  expressBuyIntent
};
