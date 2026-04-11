const mongoose = require('mongoose');

const userEngagementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    cartProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    wishlistProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserEngagement', userEngagementSchema);
