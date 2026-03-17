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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);