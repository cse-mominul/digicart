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
    footerCopyrightText: {
      type: String,
      default: '© 2026 DigiCart. All rights reserved.',
      trim: true,
    },
    siteDescription: {
      type: String,
      default: 'DigiCart helps modern shoppers discover top-rated products at honest prices, fast delivery, and smooth checkout experiences.',
      trim: true,
    },
    siteWebsiteUrl: {
      type: String,
      default: 'www.digicart.com',
      trim: true,
    },
    couponCode: {
      type: String,
      default: '',
      trim: true,
    },
    couponDiscountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    couponActive: {
      type: Boolean,
      default: false,
    },
    paymentMethods: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        bkash: { enabled: true, number: '' },
        nogod: { enabled: true, number: '' },
        cod: { enabled: true },
        card: { enabled: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);