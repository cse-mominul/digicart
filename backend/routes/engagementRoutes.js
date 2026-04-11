const express = require('express');
const { syncUserEngagement } = require('../controllers/engagementController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/sync', protect, syncUserEngagement);

module.exports = router;
