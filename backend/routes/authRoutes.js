const express = require('express');
const router = express.Router();
const { register, login, updateProfile, verifyOTP, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', protect, updateProfile);

module.exports = router;
