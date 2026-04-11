const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUserByAdmin } = require('../controllers/userController');
const {
	getAllReviews,
	updateReviewByAdmin,
	deleteReviewByAdmin,
} = require('../controllers/reviewController');
const { getAbandonedCartInsights } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/users', protect, requireAdmin, getAllUsers);
router.put('/users/:id', protect, requireAdmin, updateUserByAdmin);
router.delete('/users/:id', protect, requireAdmin, deleteUser);
router.get('/reviews', protect, requireAdmin, getAllReviews);
router.put('/reviews/:id', protect, requireAdmin, updateReviewByAdmin);
router.delete('/reviews/:id', protect, requireAdmin, deleteReviewByAdmin);
router.get('/abandoned-carts', protect, requireAdmin, getAbandonedCartInsights);

module.exports = router;
