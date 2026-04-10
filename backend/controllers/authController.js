const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, phone: String(phone || '').trim() });
    res.status(201).json({
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
  const { email, password } = req.body;

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

    if (isPasswordMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, email, phone, password } = req.body;

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

    if (typeof password === 'string' && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password.trim();
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

module.exports = { register, login, updateProfile };
