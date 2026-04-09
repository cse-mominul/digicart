const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    insideDhakaCharge: {
      type: Number,
      default: 80,
      min: 0,
    },
    outsideDhakaCharge: {
      type: Number,
      default: 120,
      min: 0,
    },
    contactAddress: {
      type: String,
      default: '125 Market Street, Gulshan Avenue, Dhaka 1212',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '+880 1700-123456',
      trim: true,
    },
    supportEmail: {
      type: String,
      default: 'support@digicart.com',
      trim: true,
    },
    salesEmail: {
      type: String,
      default: 'sales@digicart.com',
      trim: true,
    },
    siteTitle: {
      type: String,
      default: 'DigiCart',
      trim: true,
    },
    siteLogoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    faviconUrl: {
      type: String,
      default: '',
      trim: true,
    },
    siteSlogan: {
      type: String,
      default: 'Rebranded Sellzy',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);