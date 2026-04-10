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
  getProductReviews,
  createOrUpdateProductReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', getProducts);
router.get('/top-selling', getTopSellingProducts);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, createOrUpdateProductReview);
router.get('/:id', getProductById);
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

module.exports = router;
