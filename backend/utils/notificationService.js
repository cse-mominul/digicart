const Notification = require('../models/Notification');

const createNotification = async (payload) => {
  try {
    return await Notification.create(payload);
  } catch (error) {
    // Notification failures should not block core flows like login/order.
    console.error('Notification create failed:', error.message);
    return null;
  }
};

module.exports = { createNotification };
