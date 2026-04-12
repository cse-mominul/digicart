const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['login', 'order'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    actorName: { type: String, trim: true, default: '' },
    actorEmail: { type: String, trim: true, default: '' },
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    readByAdmin: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
