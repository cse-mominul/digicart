const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const now = Date.now();
      const lastLoginMs = req.user.lastLoginAt ? new Date(req.user.lastLoginAt).getTime() : 0;
      // Keep a lightweight heartbeat for active sessions without writing on every request.
      if (!lastLoginMs || now - lastLoginMs > 15 * 60 * 1000) {
        await User.updateOne({ _id: req.user._id }, { $set: { lastLoginAt: new Date(now) } });
        req.user.lastLoginAt = new Date(now);
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const optionalProtect = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    req.user = null;
    return next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      req.user = null;
      return next();
    }

    const now = Date.now();
    const lastLoginMs = req.user.lastLoginAt ? new Date(req.user.lastLoginAt).getTime() : 0;
    if (!lastLoginMs || now - lastLoginMs > 15 * 60 * 1000) {
      await User.updateOne({ _id: req.user._id }, { $set: { lastLoginAt: new Date(now) } });
      req.user.lastLoginAt = new Date(now);
    }

    return next();
  } catch {
    req.user = null;
    return next();
  }
};

module.exports = { protect, optionalProtect };
