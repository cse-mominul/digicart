const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// @desc  Get admin notifications
// @route GET /api/admin/notifications
const getAdminNotifications = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));

    const total = await Notification.countDocuments({});
    const pages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, pages);

    const items = await Notification.find({})
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * limit)
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({ readByAdmin: false });

    return res.json({
      items,
      page: safePage,
      pages,
      total,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Mark notification as read
// @route PUT /api/admin/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification id' });
    }

    const updated = await Notification.findByIdAndUpdate(
      id,
      { $set: { readByAdmin: true } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Mark all notifications as read
// @route PUT /api/admin/notifications/read-all
const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { readByAdmin: false },
      { $set: { readByAdmin: true } }
    );

    return res.json({
      message: 'All notifications marked as read',
      modifiedCount: Number(result?.modifiedCount) || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
