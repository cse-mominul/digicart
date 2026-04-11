const mongoose = require('mongoose');
const UserEngagement = require('../models/UserEngagement');

const toUniqueObjectIdArray = (value) => {
  if (!Array.isArray(value)) return [];

  const unique = new Set();
  value.forEach((item) => {
    const raw = String(item || '').trim();
    if (mongoose.Types.ObjectId.isValid(raw)) {
      unique.add(raw);
    }
  });

  return Array.from(unique).map((id) => new mongoose.Types.ObjectId(id));
};

// @desc  Sync logged-in user's cart/wishlist footprint
// @route POST /api/engagement/sync
const syncUserEngagement = async (req, res) => {
  try {
    const hasCart = Object.prototype.hasOwnProperty.call(req.body || {}, 'cartProductIds');
    const hasWishlist = Object.prototype.hasOwnProperty.call(req.body || {}, 'wishlistProductIds');

    if (!hasCart && !hasWishlist) {
      return res.status(400).json({ message: 'No engagement payload provided' });
    }

    const update = {
      lastActiveAt: new Date(),
    };

    if (hasCart) {
      update.cartProductIds = toUniqueObjectIdArray(req.body.cartProductIds);
    }

    if (hasWishlist) {
      update.wishlistProductIds = toUniqueObjectIdArray(req.body.wishlistProductIds);
    }

    const engagement = await UserEngagement.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      message: 'Engagement synced',
      cartCount: engagement.cartProductIds.length,
      wishlistCount: engagement.wishlistProductIds.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { syncUserEngagement };
