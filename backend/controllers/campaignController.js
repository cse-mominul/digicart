const Campaign = require('../models/Campaign');

exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCampaign = async (req, res) => {
  const { title, subtitle, image, desktopImage, mobileImage, isActive } = req.body;
  try {
    const resolvedDesktopImage = desktopImage || image;
    const resolvedMobileImage = mobileImage || image;
    const resolvedImage = image || resolvedDesktopImage || resolvedMobileImage;

    if (!title || !subtitle || !resolvedDesktopImage || !resolvedMobileImage) {
      return res.status(400).json({ message: 'Title, subtitle, desktop image, and mobile image are required' });
    }
    const campaign = await Campaign.create({
      title,
      subtitle,
      image: resolvedImage,
      desktopImage: resolvedDesktopImage,
      mobileImage: resolvedMobileImage,
      isActive: isActive !== undefined ? isActive : true,
    });
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCampaign = async (req, res) => {
  const { title, subtitle, image, desktopImage, mobileImage, isActive } = req.body;
  try {
    const resolvedDesktopImage = desktopImage || image;
    const resolvedMobileImage = mobileImage || image;
    const resolvedImage = image || resolvedDesktopImage || resolvedMobileImage;

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title,
          subtitle,
          image: resolvedImage,
          desktopImage: resolvedDesktopImage,
          mobileImage: resolvedMobileImage,
          isActive,
        },
      },
      { new: true, runValidators: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
