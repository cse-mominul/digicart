const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { createNotification } = require('../utils/notificationService');
const { sendOTP } = require('../utils/emailService');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @desc  Register a new user
// @route POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
      } else {
        // Update existing unverified user with new details and new OTP
        const otp = generateOTP();
        userExists.name = name;
        userExists.password = password;
        userExists.phone = String(phone || '').trim();
        userExists.otp = otp;
        userExists.otpExpires = Date.now() + 10 * 60 * 1000;
        await userExists.save();
        await sendOTP(email, otp, 'verification');
        return res.status(200).json({ message: 'OTP sent to your email. Please verify.' });
      }
    }

    const otp = generateOTP();
    const user = await User.create({
      name,
      email,
      password,
      phone: String(phone || '').trim(),
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false,
    });

    await sendOTP(email, otp, 'verification');

    res.status(201).json({
      message: 'OTP sent to your email. Please verify.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Verify OTP for registration
// @route POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Authenticate user & get token
// @route POST /api/auth/login
const login = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[LOGIN] User not found for email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`[LOGIN] User found: ${email}`);
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      console.log(`[LOGIN] Password did not match for email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000;
      await user.save();
      await sendOTP(email, otp, 'verification');
      return res.status(401).json({ message: 'Account not verified. OTP sent to email.' });
    }

    if (isPasswordMatch) {
      const now = new Date();
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: { lastLoginAt: now } },
        { new: true }
      );

      await createNotification({
        type: 'login',
        title: 'User Login',
        message: `${updatedUser.name || 'A user'} logged in`,
        actorName: updatedUser.name || '',
        actorEmail: updatedUser.email || '',
        actorUserId: updatedUser._id,
      });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        lastLoginAt: updatedUser.lastLoginAt,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, email, phone, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof name === 'string') {
      user.name = name.trim();
    }

    if (typeof email === 'string') {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = normalizedEmail;
    }

    if (typeof phone === 'string') {
      user.phone = phone.trim();
    }

    const currentPasswordValue = String(currentPassword || '').trim();
    const newPasswordValue = String(newPassword || '').trim();

    if (currentPasswordValue && !newPasswordValue) {
      return res.status(400).json({ message: 'Please provide a new password' });
    }

    if (newPasswordValue) {
      if (!currentPasswordValue) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }

      const isCurrentPasswordMatch = await user.matchPassword(currentPasswordValue);
      if (!isCurrentPasswordMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      if (newPasswordValue.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      user.password = newPasswordValue;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Forgot password
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTP(email, otp, 'reset');

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Reset password
// @route POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Google Login
// @route POST /api/auth/google-login
const googleLogin = async (req, res) => {
  const { name, email, photo } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required from Google' });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      // We use a random password for Google users since they won't use it
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      user = await User.create({
        name,
        email,
        password: randomPassword,
        isVerified: true, // Google users are pre-verified
      });

      await createNotification({
        type: 'registration',
        title: 'New User via Google',
        message: `${name} registered using Google`,
        actorName: name,
        actorEmail: email,
        actorUserId: user._id,
      });
    } else {
      // If user exists but was not verified, verify them now
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }

      await createNotification({
        type: 'login',
        title: 'User Login via Google',
        message: `${user.name} logged in using Google`,
        actorName: user.name,
        actorEmail: user.email,
        actorUserId: user._id,
      });
    }

    const now = new Date();
    await User.findByIdAndUpdate(user._id, { $set: { lastLoginAt: now } });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, updateProfile, verifyOTP, forgotPassword, resetPassword, googleLogin };
