const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

// User routes
router.post('/', optionalProtect, createOrder);
router.get('/myorders', protect, getMyOrders);

// Admin routes
router.get('/', protect, requireAdmin, getAllOrders);
router.get('/:id', protect, requireAdmin, getOrderById);
router.put('/:id/status', protect, requireAdmin, updateOrderStatus);
router.put('/:id/payment', protect, requireAdmin, updateOrderPayment);
router.delete('/:id', protect, requireAdmin, deleteOrder);

module.exports = router;
