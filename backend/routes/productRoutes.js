const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getTopSellingProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const {
  getMyReviews,
  getProductReviews,
  createOrUpdateProductReview,
  deleteMyProductReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', getProducts);
router.get('/top-selling', getTopSellingProducts);
router.get('/my-reviews', protect, getMyReviews);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, createOrUpdateProductReview);
router.delete('/:id/reviews/me', protect, deleteMyProductReview);
router.get('/:id', getProductById);
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

module.exports = router;
