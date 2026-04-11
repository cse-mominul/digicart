const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

// User routes
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);

// Admin routes
router.get('/', protect, requireAdmin, getAllOrders);
router.put('/:id/status', protect, requireAdmin, updateOrderStatus);
router.put('/:id/payment', protect, requireAdmin, updateOrderPayment);
router.delete('/:id', protect, requireAdmin, deleteOrder);

module.exports = router;
