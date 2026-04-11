const User = require('../models/User');

// @desc  Get all users (admin only)
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a user (admin only)
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update a user (admin only)
// @route PUT /api/admin/users/:id
const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const incomingName = String(req.body?.name || '').trim();
    const incomingEmail = String(req.body?.email || '').trim().toLowerCase();
    const incomingPhone = String(req.body?.phone || '').trim();

    if (!incomingName) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!incomingEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await User.findOne({ email: incomingEmail, _id: { $ne: user._id } });
    if (existing) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    user.name = incomingName;
    user.email = incomingEmail;
    user.phone = incomingPhone;

    await user.save();

    const safeUser = await User.findById(user._id).select('-password');
    return res.json(safeUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, updateUserByAdmin };
