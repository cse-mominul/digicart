const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, deleteUser, updateUserByAdmin } = require('../controllers/userController');
const {
	getAllReviews,
	getReviewByAdmin,
	updateReviewByAdmin,
	deleteReviewByAdmin,
} = require('../controllers/reviewController');
const {
	getAbandonedCartInsights,
	getAbandonedCartDetailsByAdmin,
	resolveAbandonedCartByAdmin,
	deleteAbandonedCartByAdmin,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/users', protect, requireAdmin, getAllUsers);
router.get('/users/:id', protect, requireAdmin, getUserById);
router.put('/users/:id', protect, requireAdmin, updateUserByAdmin);
router.delete('/users/:id', protect, requireAdmin, deleteUser);
router.get('/reviews', protect, requireAdmin, getAllReviews);
router.get('/reviews/:id', protect, requireAdmin, getReviewByAdmin);
router.put('/reviews/:id', protect, requireAdmin, updateReviewByAdmin);
router.delete('/reviews/:id', protect, requireAdmin, deleteReviewByAdmin);
router.get('/abandoned-carts', protect, requireAdmin, getAbandonedCartInsights);
router.get('/abandoned-carts/:userId', protect, requireAdmin, getAbandonedCartDetailsByAdmin);
router.put('/abandoned-carts/:userId', protect, requireAdmin, resolveAbandonedCartByAdmin);
router.delete('/abandoned-carts/:userId', protect, requireAdmin, deleteAbandonedCartByAdmin);

module.exports = router;
