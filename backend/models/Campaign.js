const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    cta: {
      type: String,
      required: true,
      trim: true,
    },
    desktopImage: {
      type: String,
      required: true,
      trim: true,
    },
    mobileImage: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    bg: {
      type: String,
      required: true,
      default: 'from-pink-500 via-fuchsia-500 to-purple-600',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);
