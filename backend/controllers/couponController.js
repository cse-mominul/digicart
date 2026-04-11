const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

// @desc  Get all coupons with usage stats
// @route GET /api/coupons
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    
    const couponsWithStats = await Promise.all(
      coupons.map(async (coupon) => {
        const usageCount = await Order.countDocuments({
          appliedCoupon: coupon.code,
        });
        return {
          _id: coupon._id,
          code: coupon.code,
          discountPercent: coupon.discountPercent,
          isActive: coupon.isActive,
          description: coupon.description,
          usageCount,
          createdAt: coupon.createdAt,
        };
      })
    );

    res.json(couponsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create new coupon (admin only)
// @route POST /api/coupons
const createCoupon = async (req, res) => {
  const { code, discountPercent, description, isActive } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ message: 'Coupon code is required' });
  }

  if (!Number.isFinite(Number(discountPercent)) || discountPercent < 0 || discountPercent > 100) {
    return res.status(400).json({ message: 'Discount percent must be between 0 and 100' });
  }

  try {
    const existingCoupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountPercent: Number(discountPercent),
      description: description || '',
      isActive: Boolean(isActive) !== false,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update coupon (admin only)
// @route PATCH /api/coupons/:id
const updateCoupon = async (req, res) => {
  const { code, discountPercent, description, isActive } = req.body;

  if (code && !code.trim()) {
    return res.status(400).json({ message: 'Coupon code cannot be empty' });
  }

  if (discountPercent !== undefined) {
    if (!Number.isFinite(Number(discountPercent)) || discountPercent < 0 || discountPercent > 100) {
      return res.status(500).json({ message: 'Discount percent must be between 0 and 100' });
    }
  }

  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (code && code.trim().toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        ...(code && { code: code.trim().toUpperCase() }),
        ...(discountPercent !== undefined && { discountPercent: Number(discountPercent) }),
        ...(description !== undefined && { description: description || '' }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      { new: true }
    );

    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete coupon (admin only)
// @route DELETE /api/coupons/:id
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get active coupons for checkout
// @route GET /api/coupons/active
const getActiveCoupons = async (req, res) => {
  try {
    const existingCoupons = await Coupon.find({ isActive: true });
    
    if (existingCoupons.length === 0) {
      const defaultCoupon = await Coupon.findOneAndUpdate(
        { code: 'MOMIN' },
        {
          code: 'MOMIN',
          discountPercent: 12,
          isActive: true,
          description: 'Default welcome coupon',
        },
        { upsert: true, new: true }
      );
      return res.json([defaultCoupon]);
    }
    
    res.json(existingCoupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getActiveCoupons,
};
