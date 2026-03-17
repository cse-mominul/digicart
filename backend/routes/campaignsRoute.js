const express = require('express');
const campaignController = require('../controllers/campaignController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/active', campaignController.getActiveCampaigns);
router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/', protect, requireAdmin, campaignController.createCampaign);
router.put('/:id', protect, requireAdmin, campaignController.updateCampaign);
router.delete('/:id', protect, requireAdmin, campaignController.deleteCampaign);

module.exports = router;
