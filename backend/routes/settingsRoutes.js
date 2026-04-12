const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getCouponStats, getPaymentSettings, updatePaymentSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/coupon-stats', protect, requireAdmin, getCouponStats);
router.get('/payment', getPaymentSettings);
router.patch('/payment', protect, requireAdmin, updatePaymentSettings);
router.get('/', getSettings);
router.post('/', protect, requireAdmin, updateSettings);
router.patch('/', protect, requireAdmin, updateSettings);

module.exports = router;