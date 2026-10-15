const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const productController = require('../controllers/productController');

// Multer memory storage with 10MB limit
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// @route   POST /api/products/upload-image
router.post('/upload-image', authMiddleware, upload.single('image'), productController.uploadImage);

// @route   POST /api/products/sign-upload (Direct-to-Cloudinary signed upload)
router.post('/sign-upload', authMiddleware, productController.signUpload);

// @route   GET /api/products/my-ads
router.get('/my-ads', authMiddleware, productController.getMyAds);

// @route   GET /api/products/:id
router.get('/:id', productController.getProductById);

// @route   GET /api/products
router.get('/', productController.getProducts);

// @route   POST /api/products
router.post('/', authMiddleware, productController.createProduct);

// @route   PATCH /api/products/:id/status
router.patch('/:id/status', authMiddleware, productController.updateProductStatus);

// @route   DELETE /api/products/:id
router.delete('/:id', authMiddleware, productController.deleteProduct);

// @route   POST /api/products/:id/report (Moderation reporting)
router.post('/:id/report', authMiddleware, productController.reportProduct);

// @route   POST /api/products/:id/like (Wishlist/like product + notify seller)
router.post('/:id/like', authMiddleware, productController.likeProduct);

// @route   POST /api/products/:id/buy-intent (Express buy intent + notify seller)
router.post('/:id/buy-intent', authMiddleware, productController.expressBuyIntent);

module.exports = router;
