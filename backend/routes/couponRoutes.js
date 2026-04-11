const express = require('express');
const router = express.Router();
const {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getActiveCoupons,
} = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/active', getActiveCoupons);
router.get('/', protect, requireAdmin, getAllCoupons);
router.post('/', protect, requireAdmin, createCoupon);
router.patch('/:id', protect, requireAdmin, updateCoupon);
router.delete('/:id', protect, requireAdmin, deleteCoupon);

module.exports = router;
