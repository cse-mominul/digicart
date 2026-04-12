const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getOrderPaymentInfo,
  submitOrderTransaction,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

// User routes
router.post('/', optionalProtect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id/payment-info', optionalProtect, getOrderPaymentInfo);
router.put('/:id/transaction', optionalProtect, submitOrderTransaction);

// Admin routes
router.get('/', protect, requireAdmin, getAllOrders);
router.get('/:id', protect, requireAdmin, getOrderById);
router.put('/:id/status', protect, requireAdmin, updateOrderStatus);
router.put('/:id/payment', protect, requireAdmin, updateOrderPayment);
router.delete('/:id', protect, requireAdmin, deleteOrder);

module.exports = router;
