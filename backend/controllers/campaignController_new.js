const Campaign = require('../models/Campaign');

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCampaign = async (req, res) => {
  const { title, subtitle, cta, image, bg, isActive } = req.body;
  try {
    if (!title || !subtitle || !cta || !image) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const campaign = await Campaign.create({
      title,
      subtitle,
      cta,
      image,
      bg: bg || 'from-pink-500 via-fuchsia-500 to-purple-600',
      isActive: isActive !== undefined ? isActive : true,
    });
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCampaign = async (req, res) => {
  const { title, subtitle, cta, image, bg, isActive } = req.body;
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: { title, subtitle, cta, image, bg, isActive } },
      { new: true, runValidators: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCampaigns,
  getActiveCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
};
